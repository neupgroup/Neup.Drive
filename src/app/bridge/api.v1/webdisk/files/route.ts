import { NextResponse } from 'next/server';
import path from 'node:path';
import { createExpiringOperationPayload, createSignedCdnToken, encodeSignedCdnToken } from '@/lib/cdn-token';
import { handleServerError } from '@/lib/error-server';

const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
const CDN_BASE_URL = getCdnBaseUrl();
const CDN_LIST_URL = process.env.CDN_LIST_URL || `${CDN_BASE_URL}/list`;
const WEBDISK_ACCOUNT_ID = process.env.WEBDISK_ACCOUNT_ID || process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';

interface CdnListedFile {
    name: string;
    path: string;
    size: number;
    mime_type?: string;
    modified_time?: string;
}

function getCdnBaseUrl() {
    const explicitBase = process.env.CDN_BASE_URL || process.env.CDN_HOST;
    if (explicitBase) return explicitBase.replace(/\/$/, '');

    const uploadUrl = process.env.CDN_UPLOAD_URL || process.env.NEXT_PUBLIC_CDN_UPLOAD_URL;
    if (uploadUrl) {
        try {
            return new URL(uploadUrl).origin;
        } catch {
            // Fall through to local default.
        }
    }

    return 'http://localhost:3001';
}

function fileUrl(filePath: string) {
    const cleanPath = filePath.replace(/^\/+/, '');
    const accountPrefix = `uploads/${WEBDISK_ACCOUNT_ID}/`;
    const relativePath = cleanPath.startsWith(accountPrefix)
        ? cleanPath.slice(accountPrefix.length)
        : cleanPath.startsWith('uploads/')
            ? cleanPath.slice('uploads/'.length)
            : cleanPath;

    const signedToken = createSignedCdnToken(createExpiringOperationPayload({
        action: 'view',
        account_id: WEBDISK_ACCOUNT_ID,
        account_folder: WEBDISK_ACCOUNT_ID,
        folder_type: 'webdisk',
        path: cleanPath,
        method: 'GET',
    }), PRIVATE_KEY);

    const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/');
    return `${CDN_BASE_URL}/files/${encodeURIComponent(WEBDISK_ACCOUNT_ID)}/webdisk/${encodedPath}?token=${encodeURIComponent(encodeSignedCdnToken(signedToken))}`;
}

async function listCdnFiles() {
    const listPath = path.posix.join('uploads', WEBDISK_ACCOUNT_ID);
    const signedToken = createSignedCdnToken(createExpiringOperationPayload({
        action: 'list',
        account_id: WEBDISK_ACCOUNT_ID,
        account_folder: WEBDISK_ACCOUNT_ID,
        folder_type: 'webdisk',
        path: listPath,
        method: 'GET',
    }), PRIVATE_KEY);

    const response = await fetch(`${CDN_LIST_URL}?token=${encodeURIComponent(encodeSignedCdnToken(signedToken))}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    let data: any = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok || !data?.success || !Array.isArray(data.files)) {
        const message = data?.error || data?.message || `CDN list failed with ${response.status}`;
        throw new Error(message);
    }

    return data.files as CdnListedFile[];
}

export async function GET() {
    try {
        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const files = await listCdnFiles();
        const mappedFiles = files.map((file) => ({
            id: file.path,
            filename: file.name,
            path: fileUrl(file.path),
            cdn_path: file.path,
            mimeType: file.mime_type || 'application/octet-stream',
            uploaded_by: WEBDISK_ACCOUNT_ID,
            uploaded_on: file.modified_time || new Date(0).toISOString(),
            size: Number(file.size || 0),
            type: 'file',
            details: {
                source: 'cdn-api',
                account_id: WEBDISK_ACCOUNT_ID,
            },
        }));

        return NextResponse.json(mappedFiles);
    } catch (error) {
        return handleServerError(error, '/bridge/api.v1/webdisk/files', { method: 'GET' });
    }
}
