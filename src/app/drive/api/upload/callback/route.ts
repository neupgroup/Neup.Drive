import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createFileFolderLog } from '@/lib/filefolder';

/**
 * Step 6: Finalization - Server Callback
 * This endpoint is called by the CDN when an upload is verified and completed.
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
            // Update file status in database
            const updated = await prisma.file.updateMany({
                where: {
                    path: metadataPath,
                    // We can also verify hash matches if needed, but path is strong enough for this demo
                },
                data: {
                    status: 'VERIFIED',
                    hash: file_hash // Ensure hash is consistent
                }
            });

            if (updated.count > 0) {
                console.log('✅ File verified and finalized in DB:', metadataPath);
            } else {
                console.warn('⚠️ File record not found for verification:', metadataPath);
            }

            const filefolder = await prisma.fileFolder.findFirst({
                where: { path: metadataPath },
                orderBy: { created_on: 'desc' },
            });

            if (filefolder) {
                const existingDetails = filefolder.details && typeof filefolder.details === 'object' && !Array.isArray(filefolder.details)
                    ? filefolder.details
                    : {};

                await prisma.fileFolder.update({
                    where: { id: filefolder.id },
                    data: {
                        details: {
                            ...existingDetails,
                            status: 'VERIFIED',
                            file_hash,
                            upload_session_id,
                            callback_response: body,
                        },
                    },
                });

                await createFileFolderLog({
                    filefolderId: filefolder.id,
                    action: 'upload',
                    details: {
                        status: 'VERIFIED',
                        callback_response: body,
                    },
                    doneBy: filefolder.owner,
                });
            } else {
                console.warn('⚠️ Filefolder record not found for verification:', metadataPath);
            }
            
            return NextResponse.json({ success: true });
        } else {
            console.warn('❌ File verification failed:', metadata);
            // Handle failure cleanup - mark as FAILED
            await prisma.file.updateMany({
                where: { path: metadataPath },
                data: { status: 'FAILED' }
            });

            const filefolder = await prisma.fileFolder.findFirst({
                where: { path: metadataPath },
                orderBy: { created_on: 'desc' },
            });

            if (filefolder) {
                const existingDetails = filefolder.details && typeof filefolder.details === 'object' && !Array.isArray(filefolder.details)
                    ? filefolder.details
                    : {};

                await prisma.fileFolder.update({
                    where: { id: filefolder.id },
                    data: {
                        details: {
                            ...existingDetails,
                            status: 'FAILED',
                            file_hash,
                            upload_session_id,
                            callback_response: body,
                        },
                    },
                });

                await createFileFolderLog({
                    filefolderId: filefolder.id,
                    action: 'upload',
                    details: {
                        status: 'FAILED',
                        callback_response: body,
                    },
                    doneBy: filefolder.owner,
                });
            }
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
