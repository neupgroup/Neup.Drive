import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/core/database/prisma';
import { handleServerError } from '@/lib/error-server';
import { getAuthenticatedBridgeOwner, getDetails, isActiveFileDetails } from '@/lib/bridge-api';
import { isDirectoryMimeType } from '@/lib/filefolder';

export async function GET(request: NextRequest) {
    try {
        const owner = await resolveDriveOwner(request);
        if (!owner) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const files = await prisma.fileFolder.findMany({
            where: {
                owner,
                stored_as: 'drive',
            },
            select: {
                size: true,
                details: true,
            },
        });

        let bytesUsed = 0;
        let fileCount = 0;
        let folderCount = 0;

        for (const file of files) {
            if (!isActiveFileDetails(file.details)) continue;

            const details = getDetails(file.details);
            const isFolder = isDirectoryMimeType(typeof details.mimeType === 'string' ? details.mimeType : null);

            if (isFolder) {
                folderCount += 1;
                continue;
            }

            fileCount += 1;
            bytesUsed += Number(file.size);
        }

        return NextResponse.json({
            success: true,
            account_id: owner,
            storage: {
                bytes_used: bytesUsed,
                file_count: fileCount,
                folder_count: folderCount,
                item_count: fileCount + folderCount,
            },
        });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/drive/status');
    }
}

async function resolveDriveOwner(request: NextRequest) {
    const authenticatedOwner = await getAuthenticatedBridgeOwner(request);
    if (authenticatedOwner) return authenticatedOwner;

    const requestedOwner = request.nextUrl.searchParams.get('account_id') || request.nextUrl.searchParams.get('owner');
    return requestedOwner?.trim() || null;
}
