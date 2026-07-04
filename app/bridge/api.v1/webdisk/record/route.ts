import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { createFileFolderLog, recordFileFolderUpload, webdiskStoredAs } from '@/core/lib/filefolder';

const WEBDISK_TYPES = ['assets', 'signed'];

function getWebdiskTypeFromPath(filePath: string) {
    const parts = filePath.replace(/^\/+/, '').split('/');
    const type = parts.length >= 2 ? parts[1]?.toLowerCase() : undefined;
    return type && WEBDISK_TYPES.includes(type) ? type : 'assets';
}

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
        const storedAs = webdiskStoredAs(getWebdiskTypeFromPath(path));

        const filefolder = existingFilefolder
            ? await prisma.fileFolder.update({
                where: { id: existingFilefolder.id },
                data: {
                    owner: uploaded_by,
                    stored_as: storedAs,
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
                storedAs,
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
        return handleServerError(error, '/bridge/api.v1/webdisk/record', { method: 'POST' });
    }
}
