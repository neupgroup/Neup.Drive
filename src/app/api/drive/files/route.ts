import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleServerError } from '@/lib/error-server';
import { createExpiringOperationPayload, createSignedCdnToken, encodeSignedCdnToken } from '@/lib/cdn-token';

// Base URL for serving files. In production, this would be your CDN domain.
const CDN_HOST = process.env.CDN_HOST || 'http://localhost:3001';
const CDN_BASE_URL = (process.env.CDN_BASE_URL || CDN_HOST).replace(/\/$/, '');
const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';

function toAccountRelativePath(filePath: string, owner: string) {
    const cleanPath = filePath.replace(/^\/+/, '');
    const prefix = `uploads/${owner}/`;
    if (cleanPath.startsWith(prefix)) {
        return cleanPath.slice(prefix.length);
    }
    if (cleanPath.startsWith('uploads/')) {
        return cleanPath.slice('uploads/'.length);
    }
    return cleanPath;
}

function buildFileUrl(filePath: string, owner: string, folderType: string) {
    const relativePath = toAccountRelativePath(filePath, owner);
    const token = encodeSignedCdnToken(createSignedCdnToken(createExpiringOperationPayload({
        action: 'view',
        account_id: owner,
        account_folder: owner,
        folder_type: folderType,
        path: filePath,
        method: 'GET',
    }), PRIVATE_KEY));

    const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
    return `${CDN_BASE_URL}/files/${encodeURIComponent(owner)}/${encodeURIComponent(folderType)}/${encodedPath}?token=${encodeURIComponent(token)}`;
}

export async function GET(request: NextRequest) {
    try {
        const userId = 'demo-user-123'; // Mocked user ID

        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const files = await prisma.fileFolder.findMany({
            where: {
                owner: userId,
                details: {
                    path: ['mode'],
                    equals: 'drive',
                },
            },
            orderBy: {
                created_on: 'desc'
            }
        });

        // Map files to include full URL and handle BigInt
        const visibleFiles = files.filter((file) => {
            const details = typeof file.details === 'object' && file.details && !Array.isArray(file.details) ? file.details : {};
            return details.status !== 'DELETED';
        });

        const mappedFiles = visibleFiles.map(file => ({
            id: file.id,
            name: file.name,
            size: Number(file.size), // Convert BigInt to Number for JSON
            mimeType: typeof file.details === 'object' && file.details && !Array.isArray(file.details) && typeof file.details.mimeType === 'string'
                ? file.details.mimeType
                : 'application/octet-stream',
            path: file.path,
            status: typeof file.details === 'object' && file.details && !Array.isArray(file.details) && typeof file.details.status === 'string'
                ? file.details.status
                : 'PENDING',
            userId,
            createdAt: file.created_on,
            updatedAt: file.updated_on,
            url: buildFileUrl(file.path, userId, typeof file.details === 'object' && file.details && !Array.isArray(file.details) && typeof file.details.mode === 'string'
                ? file.details.mode
                : 'drive'),
            details: file.details,
        }));

        return NextResponse.json(mappedFiles);
    } catch (error) {
        return handleServerError(error, 'api/drive/files');
    }
}
