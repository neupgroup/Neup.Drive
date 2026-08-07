import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { getRequestDeviceIp } from '@/lib/bridge-api';
import { createExpiringOperationPayload, createSignedCdnToken, encodeSignedCdnToken, parseDurationSeconds } from '@/lib/cdn-token';
import { prisma } from '@/core/database/prisma';
import { resolveAuthenticatedAccountId, resolveAuthenticatedAccountProfile } from '@/lib/bridge-api';
import { handleServerError } from '@/lib/error-server';

const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
const CDN_BASE_URL = getCdnBaseUrl();
const CDN_LIST_URL = process.env.CDN_LIST_URL || `${CDN_BASE_URL}/list`;
const DEFAULT_WEBDISK_ACCOUNT_ID = process.env.WEBDISK_ACCOUNT_ID || process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';

interface CdnListedFile {
    name: string;
    path: string;
    size: number;
    mime_type?: string;
    modified_time?: string;
}

function getCdnBaseUrl() {
    const explicitBase = process.env.CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_BASE_URL || process.env.CDN_HOST;
    if (explicitBase) return explicitBase.replace(/\/$/, '');

    const uploadUrl = process.env.CDN_UPLOAD_URL || process.env.NEXT_PUBLIC_CDN_UPLOAD_URL;
    if (uploadUrl) {
        try {
            return new URL(uploadUrl).origin;
        } catch {
            // Fall through to the production CDN default.
        }
    }

    return 'https://neupcdn.com';
}

function getWebdiskType(relativePath: string) {
    const [type] = relativePath.split('/');
    return type?.toLowerCase() === 'signed' ? 'signed' : 'assets';
}

function toAccountStoragePath(owner: string, relativePath: string) {
    const cleanPath = relativePath.replace(/^\/+/, '');
    return path.posix.join(owner, cleanPath);
}

function stripWebdiskType(relativePath: string, folderType: string) {
    const [type, ...rest] = relativePath.split('/');
    if (type?.toLowerCase() === folderType.toLowerCase()) {
        return rest.join('/');
    }
    return relativePath;
}

function fileUrl(owner: string, relativePath: string, request: NextRequest) {
    const cleanPath = relativePath.replace(/^\/+/, '');
    const folderType = getWebdiskType(relativePath);
    const exposedPath = stripWebdiskType(relativePath, folderType);
    const encodedPath = exposedPath.split('/').filter(Boolean).map(encodeURIComponent).join('/');
    const storagePath = toAccountStoragePath(owner, cleanPath);

    if (folderType === 'assets') {
        return `${CDN_BASE_URL}/serve/${encodeURIComponent(owner)}/${encodedPath}`;
    }
    const expiresIn = request.nextUrl.searchParams.get('expires_in') || request.nextUrl.searchParams.get('expires');
    const expiresInSeconds = parseDurationSeconds(expiresIn, {
        min: 60,
        max: 24 * 60 * 60,
        fallback: 15 * 60,
    });

    const signedToken = createSignedCdnToken(createExpiringOperationPayload({
        action: 'view',
        account_id: owner,
        account_folder: owner,
        folder_type: folderType,
        path: storagePath,
        method: 'GET',
        device_ip: getRequestDeviceIp(request),
        user_agent: request.headers.get('user-agent') || '',
    }, expiresInSeconds), PRIVATE_KEY);

    return `${CDN_BASE_URL}/serve/${encodeURIComponent(owner)}/signed/${encodedPath}?token=${encodeURIComponent(encodeSignedCdnToken(signedToken))}`;
}

async function listCdnFiles(owner: string) {
    const listPath = path.posix.join(owner);
    const signedToken = createSignedCdnToken(createExpiringOperationPayload({
        action: 'list',
        account_id: owner,
        account_folder: owner,
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

        const authAccountToken = request.cookies.get('auth_account')?.value;
        const accountProfile = await resolveAuthenticatedAccountProfile(authAccountToken);
        const owner = accountProfile?.accountId || await resolveAuthenticatedAccountId(authAccountToken) || DEFAULT_WEBDISK_ACCOUNT_ID;
        const uploaderName = accountProfile?.displayName || accountProfile?.neupid || owner;
        const files = await listCdnFiles(owner);
        const visibleFiles = files.filter((file) => {
            const cleanPath = file.path.replace(/^\/+/, '');
            return (
                cleanPath !== '.trash' &&
                !cleanPath.startsWith('.trash/') &&
                cleanPath !== '.logs' &&
                !cleanPath.startsWith('.logs/')
            );
        });
        const storagePaths = visibleFiles.map((file) => toAccountStoragePath(owner, file.path));
        const matchingFilefolders = storagePaths.length === 0
            ? []
            : await prisma.fileFolder.findMany({
                where: {
                    owner,
                    path: { in: storagePaths },
                },
                select: {
                    id: true,
                    path: true,
                },
            });
        const filefolderIdByPath = new Map(
            matchingFilefolders.map((filefolder) => [filefolder.path, filefolder.id]),
        );
        const mappedFiles = visibleFiles.map((file) => ({
            id: filefolderIdByPath.get(toAccountStoragePath(owner, file.path)) || toAccountStoragePath(owner, file.path),
            filename: file.name,
            path: fileUrl(owner, file.path, request),
            cdn_path: toAccountStoragePath(owner, file.path),
            filefolder_id: filefolderIdByPath.get(toAccountStoragePath(owner, file.path)) || null,
            mimeType: file.mime_type || 'application/octet-stream',
            uploaded_by: owner,
            uploaded_by_name: uploaderName,
            uploaded_on: file.modified_time || new Date(0).toISOString(),
            size: Number(file.size || 0),
            type: 'file',
            details: {
                source: 'cdn-api',
                account_id: owner,
            },
        }));

        return NextResponse.json(mappedFiles);
    } catch (error) {
        return handleServerError(error, '/bridge/api.v1/webdisk/files', { method: 'GET' });
    }
}
