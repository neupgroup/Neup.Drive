import { NextRequest, NextResponse } from 'next/server';

import {
    BRIDGE_PRIVATE_KEY,
    createBridgeFileUrl,
    getBridgeOwner,
    getDetails,
    getFolderType,
    getParam,
    getRequestDeviceIp,
    isActiveFileDetails,
    normalizeFolderType,
} from '@/core/lib/bridge-api';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { webdiskStoredAs } from '@/core/lib/filefolder';

export async function GET(request: NextRequest) {
    try {
        const owner = getBridgeOwner(request);
        const folderType = normalizeFolderType(getParam(request, 'folder_type') || getParam(request, 'type'));
        if (folderType !== 'assets' && !BRIDGE_PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const storedAs = folderType === 'drive' ? 'drivefile' : webdiskStoredAs(folderType);
        const tokenOptions = {
            deviceIp: getRequestDeviceIp(request),
            userAgent: request.headers.get('user-agent') || '',
        };
        const limitValue = Number(getParam(request, 'limit') || 100);
        const limit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 500) : 100;

        const files = await prisma.fileFolder.findMany({
            where: {
                owner,
                stored_as: storedAs,
            },
            orderBy: { created_on: 'desc' },
            take: limit,
        });

        const visibleFiles = files.filter((file) => isActiveFileDetails(file.details));

        return NextResponse.json({
            success: true,
            owner,
            folder_type: folderType,
            files: visibleFiles.map((file) => {
                const details = getDetails(file.details);
                return {
                    id: file.id,
                    name: file.name,
                    path: file.path,
                    type: file.type,
                    stored_as: file.stored_as,
                    folder_type: getFolderType(file),
                    size: Number(file.size),
                    mimeType: typeof details.mimeType === 'string' ? details.mimeType : 'application/octet-stream',
                    status: typeof details.status === 'string' ? details.status : 'PENDING',
                    created_on: file.created_on,
                    updated_on: file.updated_on,
                    url: createBridgeFileUrl(file, 'view', tokenOptions),
                    details,
                };
            }),
        });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/list');
    }
}
