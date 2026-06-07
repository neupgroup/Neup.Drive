import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { getRequestDeviceIp } from '@/lib/bridge-api';
import { createExpiringOperationPayload, createSignedCdnToken, encodeSignedCdnToken, formatDurationToken, parseDurationSeconds } from '@/lib/cdn-token';
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

function getWebdiskType(relativePath: string) {
    const [type] = relativePath.split('/');
    return type === 'signed' || type === 'private' ? type : 'assets';
}

function stripWebdiskType(relativePath: string, folderType: string) {
    const prefix = `${folderType}/`;
    return relativePath.startsWith(prefix) ? relativePath.slice(prefix.length) : relativePath;
}

function fileUrl(filePath: string, request: NextRequest) {
    const cleanPath = filePath.replace(/^\/+/, '');
    const accountPrefix = `uploads/${WEBDISK_ACCOUNT_ID}/`;
    const relativePath = cleanPath.startsWith(accountPrefix)
        ? cleanPath.slice(accountPrefix.length)
        : cleanPath.startsWith('uploads/')
            ? cleanPath.slice('uploads/'.length)
            : cleanPath;
    const folderType = getWebdiskType(relativePath);
    const exposedPath = stripWebdiskType(relativePath, folderType);
    const encodedPath = exposedPath.split('/').filter(Boolean).map(encodeURIComponent).join('/');

    if (folderType === 'assets') {
        return `${CDN_BASE_URL}/files/${encodeURIComponent(WEBDISK_ACCOUNT_ID)}/${encodedPath}`;
    }
    const expiresIn = request.nextUrl.searchParams.get('expires_in') || request.nextUrl.searchParams.get('expires');
    const expiresInSeconds = parseDurationSeconds(expiresIn, {
        min: 60,
        max: folderType === 'private' ? 60 * 60 : 24 * 60 * 60,
        fallback: 15 * 60,
    });

    const signedToken = createSignedCdnToken(createExpiringOperationPayload({
        action: 'view',
        account_id: WEBDISK_ACCOUNT_ID,
        account_folder: WEBDISK_ACCOUNT_ID,
        folder_type: folderType,
        path: cleanPath,
        method: 'GET',
        device_ip: folderType === 'private' ? getRequestDeviceIp(request) : undefined,
        user_agent: folderType === 'private' ? request.headers.get('user-agent') || '' : undefined,
    }, expiresInSeconds), PRIVATE_KEY);

    if (folderType === 'signed') {
        return `${CDN_BASE_URL}/files/${encodeURIComponent(WEBDISK_ACCOUNT_ID)}/signed/${formatDurationToken(expiresInSeconds)}/${encodedPath}?token=${encodeURIComponent(encodeSignedCdnToken(signedToken))}`;
    }

    return `${CDN_BASE_URL}/files/${encodeURIComponent(WEBDISK_ACCOUNT_ID)}/private/${encodedPath}?token=${encodeURIComponent(encodeSignedCdnToken(signedToken))}`;
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

export async function GET(request: NextRequest) {
    try {
        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const files = await listCdnFiles();
        const mappedFiles = files.map((file) => ({
            id: file.path,
            filename: file.name,
            path: fileUrl(file.path, request),
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
