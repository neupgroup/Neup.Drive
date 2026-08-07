import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/core/database/prisma';
import { handleServerError } from '@/lib/error-server';
import {
    createBridgeFileUrl,
    getAuthenticatedBridgeOwner,
    getDetails,
    getFolderType,
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

        const owner = await resolveDriveOwner(request);
        if (!owner) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const fileId = request.nextUrl.searchParams.get('file_id')?.trim();
        const rawPath = request.nextUrl.searchParams.get('path');
        const normalizedPath = normalizeRequestedPath(rawPath);
        if (!normalizedPath.ok) {
            return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
        }
        const internalPath = normalizedPath.path;

        if (!fileId && !internalPath) {
            return NextResponse.json({ error: 'file_id or path is required' }, { status: 400 });
        }

        const file = fileId
            ? await prisma.fileFolder.findFirst({
                where: {
                    id: fileId,
                    owner,
                    stored_as: 'drive',
                },
            })
            : await prisma.fileFolder.findFirst({
                where: {
                    owner,
                    stored_as: 'drive',
                    path: buildDrivePath(owner, internalPath),
                },
            });

        if (!file || !isActiveFileDetails(file.details)) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const details = getDetails(file.details);
        const tokenOptions = {
            deviceIp: getRequestDeviceIp(request),
            userAgent: request.headers.get('user-agent') || '',
        };

        return NextResponse.json({
            success: true,
            account_id: owner,
            file: {
                id: file.id,
                name: file.name,
                path: toAccountRelativePath(file.path, owner),
                type: isDirectoryMimeType(typeof details.mimeType === 'string' ? details.mimeType : null) ? 'folder' : file.type,
                stored_as: file.stored_as,
                folder_type: getFolderType(file),
                size: Number(file.size),
                mimeType: typeof details.mimeType === 'string' ? details.mimeType : 'application/octet-stream',
                status: typeof details.status === 'string' ? details.status : 'PENDING',
                created_on: file.created_on,
                updated_on: file.updated_on,
                url: createBridgeFileUrl(file, 'view', tokenOptions),
                details,
            },
        });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/drive/file');
    }
}

function buildDrivePath(owner: string, internalPath: string) {
    const normalizedPath = internalPath.replace(/^\/+/, '');
    return normalizedPath ? `${owner}/drive/${normalizedPath}` : `${owner}/drive`;
}

function normalizeRequestedPath(value: string | null) {
    if (!value) {
        return {
            ok: true as const,
            path: '',
        };
    }

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

async function resolveDriveOwner(request: NextRequest) {
    const authenticatedOwner = await getAuthenticatedBridgeOwner(request);
    if (authenticatedOwner) return authenticatedOwner;

    const requestedOwner = request.nextUrl.searchParams.get('account_id') || request.nextUrl.searchParams.get('owner');
    return requestedOwner?.trim() || null;
}
