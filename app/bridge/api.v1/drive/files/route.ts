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
import { prisma } from '@/core/database/prisma';
import { handleServerError } from '@/lib/error-server';
import {
    createBridgeFileUrl,
    getAuthenticatedBridgeOwner,
    getRequestDeviceIp,
    isActiveFileDetails,
    normalizeInternalPath,
    toAccountRelativePath,
} from '@/lib/bridge-api';
import { isDirectoryMimeType } from '@/lib/filefolder';

const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';

export async function GET(request: NextRequest) {
    try {
        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const userId = await resolveDriveOwner(request);
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const normalizedPath = normalizeListingPath(request.nextUrl.searchParams.get('path'));
        if (!normalizedPath.ok) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
        }
        const internalPath = normalizedPath.path;
        const pathPrefix = internalPath ? `${internalPath}/` : '';
        const limitValue = Number(request.nextUrl.searchParams.get('limit') || 500);
        const limit = Number.isFinite(limitValue) ? Math.min(Math.max(limitValue, 1), 500) : 500;

        const files = await prisma.fileFolder.findMany({
            where: {
                owner: userId,
                stored_as: 'drive',
            },
            orderBy: {
                created_on: 'desc'
            },
            take: limit,
        });

        // Map files to include full URL and handle BigInt
        const visibleFiles = files.filter((file) => isActiveFileDetails(file.details));
        const tokenOptions = {
            deviceIp: getRequestDeviceIp(request),
            userAgent: request.headers.get('user-agent') || '',
        };

        const mappedFiles = visibleFiles
            .filter((file) => matchesInternalPath(file.path, file.owner, internalPath, pathPrefix))
            .map(file => ({
            id: file.id,
            name: file.name,
            size: Number(file.size), // Convert BigInt to Number for JSON
            mimeType: typeof file.details === 'object' && file.details && !Array.isArray(file.details) && typeof file.details.mimeType === 'string'
                ? file.details.mimeType
                : 'application/octet-stream',
            path: toAccountRelativePath(file.path, file.owner),
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

function normalizeListingPath(value: string | null) {
    try {
        return {
            ok: true as const,
            path: normalizeInternalPath(value),
        };
    } catch {
        return {
            ok: false as const,
        };
    }
}

function matchesInternalPath(
    storagePath: string,
    owner: string,
    internalPath: string,
    pathPrefix: string,
) {
    if (!internalPath) return true;

    const relativePath = toAccountRelativePath(storagePath, owner);
    if (relativePath === `drive/${internalPath}`) return true;
    return relativePath.startsWith(`drive/${pathPrefix}`);
}

async function resolveDriveOwner(request: NextRequest) {
    const authenticatedOwner = await getAuthenticatedBridgeOwner(request);
    if (authenticatedOwner) return authenticatedOwner;

    const requestedOwner = request.nextUrl.searchParams.get('account_id') || request.nextUrl.searchParams.get('owner');
    return requestedOwner?.trim() || null;
}
