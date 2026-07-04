/*
::neup.documentation::drive-files-route
::api GET /bridge/api.v1/drive/files
::title Drive Files Route
::owner Neup Drive

::public

Returns active Drive file and folder metadata for the current owner.

::response 200

The Drive metadata rows were returned successfully.

::private

Drive listing is database-driven. The returned `path` is the logical folder
path, while signed file URLs resolve against `details.storage_path`.

::private end

::end
*/
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { createBridgeFileUrl, getRequestDeviceIp, isActiveFileDetails } from '@/core/lib/bridge-api';
import { isDirectoryMimeType } from '@/core/lib/filefolder';

const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';

export async function GET(request: NextRequest) {
    try {
        const userId = 'demo-user-123'; // Mocked user ID

        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const files = await prisma.fileFolder.findMany({
            where: {
                owner: userId,
                stored_as: 'drive',
            },
            orderBy: {
                created_on: 'desc'
            }
        });

        // Map files to include full URL and handle BigInt
        const visibleFiles = files.filter((file) => isActiveFileDetails(file.details));
        const tokenOptions = {
            deviceIp: getRequestDeviceIp(request),
            userAgent: request.headers.get('user-agent') || '',
        };

        const mappedFiles = visibleFiles.map(file => ({
            id: file.id,
            name: file.name,
            size: Number(file.size), // Convert BigInt to Number for JSON
            mimeType: typeof file.details === 'object' && file.details && !Array.isArray(file.details) && typeof file.details.mimeType === 'string'
                ? file.details.mimeType
                : 'application/octet-stream',
            path: file.path,
            stored_as: file.stored_as,
            type: isDirectoryMimeType(typeof file.details === 'object' && file.details && !Array.isArray(file.details) && typeof file.details.mimeType === 'string'
                ? file.details.mimeType
                : null)
                ? 'folder'
                : file.type,
            status: typeof file.details === 'object' && file.details && !Array.isArray(file.details) && typeof file.details.status === 'string'
                ? file.details.status
                : 'PENDING',
            userId,
            createdAt: file.created_on,
            updatedAt: file.updated_on,
            url: createBridgeFileUrl(file, 'view', tokenOptions),
            details: file.details,
        }));

        return NextResponse.json(mappedFiles);
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/drive/files');
    }
}
