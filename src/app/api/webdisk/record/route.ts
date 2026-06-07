import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleServerError } from '@/lib/error-server';
import { createFileFolderLog, recordFileFolderUpload } from '@/lib/filefolder';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { filename, path, uploaded_by, mimeType, size } = body;

        if (!filename || !path || !uploaded_by) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const record = await prisma.webDisk.create({
            data: {
                filename,
                path,
                mimeType: mimeType || 'application/octet-stream',
                uploaded_by,
                uploaded_on: new Date()
            }
        });

        const existingFilefolder = await prisma.fileFolder.findFirst({
            where: { path },
            orderBy: { created_on: 'desc' },
        });

        const apiResponse = {
            success: true,
            id: record.id,
        };

        const filefolder = existingFilefolder
            ? await prisma.fileFolder.update({
                where: { id: existingFilefolder.id },
                data: {
                    owner: uploaded_by,
                    details: {
                        ...(existingFilefolder.details && typeof existingFilefolder.details === 'object' && !Array.isArray(existingFilefolder.details)
                            ? existingFilefolder.details
                            : {}),
                        mode: 'webdisk',
                        mimeType: mimeType || 'application/octet-stream',
                        legacy_webdisk_id: record.id,
                        api_response: apiResponse,
                        status: 'VERIFIED',
                    },
                },
            })
            : await recordFileFolderUpload({
                name: filename,
                path,
                mimeType: mimeType || 'application/octet-stream',
                owner: uploaded_by,
                size,
                mode: 'webdisk',
                doneBy: uploaded_by,
                details: {
                    legacy_webdisk_id: record.id,
                    api_response: apiResponse,
                    status: 'VERIFIED',
                },
            });

        if (existingFilefolder) {
            await createFileFolderLog({
                filefolderId: filefolder.id,
                action: 'upload',
                details: {
                    legacy_webdisk_id: record.id,
                    api_response: apiResponse,
                    status: 'VERIFIED',
                },
                doneBy: uploaded_by,
            });
        }

        return NextResponse.json({ success: true, id: record.id, filefolder_id: filefolder.id });
    } catch (error) {
        return handleServerError(error, '/api/webdisk/record', { method: 'POST' });
    }
}
