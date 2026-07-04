import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/core/lib/db';
import { buildFileFolderActivityUpdate, createFileFolderLog } from '@/core/lib/filefolder';

/*
::neup.documentation::upload-callback-route
::api POST /bridge/webhook.v1/upload/callback
::title Upload Callback Route
::owner Neup Drive

::public

Accepts the CDN verification callback and finalizes pending upload metadata.

::response 200

The callback was accepted and processed.

::response 400

The callback payload is missing required metadata.

::private

Drive uploads resolve the owning `filefolder` by `details.storage_path` because
the visible drive path is stored separately from the randomized file location.

::private end

::end
*/
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { upload_session_id, file_hash, status, metadata } = body;
        const metadataPath = typeof metadata?.path === 'string' ? metadata.path : undefined;

        console.log('Received upload callback:', {
            upload_session_id,
            status,
            file_hash
        });

        if (!metadataPath) {
            return NextResponse.json(
                { error: 'Missing metadata.path' },
                { status: 400 }
            );
        }

        // Verify the callback source (e.g., check shared secret or signature)
        // const signature = request.headers.get('x-callback-signature');
        // if (!verifySignature(signature, body)) return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });

        if (status === 'verified') {
            await updateFileFolderCallbackState(metadataPath, 'VERIFIED', file_hash, upload_session_id, body);
            
            return NextResponse.json({ success: true });
        } else {
            console.warn('❌ File verification failed:', metadata);
            await updateFileFolderCallbackState(metadataPath, 'FAILED', file_hash, upload_session_id, body);
            return NextResponse.json({ success: true }); // Acknowledge receipt even for failures
        }

    } catch (error) {
        console.error('Callback processing error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function updateFileFolderCallbackState(
    metadataPath: string,
    status: 'VERIFIED' | 'FAILED',
    fileHash: string,
    uploadSessionId: string,
    callbackResponse: Prisma.InputJsonValue,
) {
    try {
        const filefolder = await prisma.fileFolder.findFirst({
            where: {
                OR: [
                    { path: metadataPath },
                    {
                        details: {
                            path: ['storage_path'],
                            equals: metadataPath,
                        },
                    },
                ],
            },
            orderBy: { created_on: 'desc' },
        });

        if (!filefolder) {
            console.warn('⚠️ Filefolder record not found for verification:', metadataPath);
            return;
        }

        const existingDetails = filefolder.details && typeof filefolder.details === 'object' && !Array.isArray(filefolder.details)
            ? filefolder.details
            : {};
        const activityUpdate = status === 'VERIFIED'
            ? buildFileFolderActivityUpdate({
                currentActivity: filefolder.last_activity,
                action: 'changed',
                details: {
                    path: metadataPath,
                    upload_session_id: uploadSessionId,
                },
            })
            : null;

        await prisma.fileFolder.update({
            where: { id: filefolder.id },
            data: {
                details: {
                    ...existingDetails,
                    status,
                    file_hash: fileHash,
                    upload_session_id: uploadSessionId,
                    storage_path: typeof existingDetails.storage_path === 'string' ? existingDetails.storage_path : metadataPath,
                    callback_response: callbackResponse,
                },
                ...(activityUpdate ? {
                    last_activity: activityUpdate.last_activity,
                    lastActivityOn: activityUpdate.lastActivityOn,
                    totalActivity: activityUpdate.totalActivity,
                } : {}),
            },
        });

        await createFileFolderLog({
            filefolderId: filefolder.id,
            action: 'upload',
            details: {
                status,
                callback_response: callbackResponse,
            },
            doneBy: filefolder.owner,
        });
    } catch (error) {
        console.warn('⚠️ Skipping filefolder callback update:', error);
    }
}
