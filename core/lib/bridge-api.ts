import path from 'node:path';
import type { NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';

import {
    createExpiringOperationPayload,
    createSignedCdnToken,
    encodeSignedCdnToken,
    formatDurationToken,
    parseDurationSeconds,
} from '@/core/lib/cdn-token';
import { prisma } from '@/core/lib/db';
import { createFileFolderLog, fileFolderTypeFromMime, recordFileFolderUpload, webdiskStoredAs } from '@/core/lib/filefolder';
import { generateNonce } from '@/core/lib/upload-client';
import type { UploadInitResponse, UploadSignaturePayload } from '@/core/lib/upload-types';
import { signCdnPayloadBase64 } from '@/core/lib/cdn-token';

export type BridgeOrganizeType = 'rename' | 'move' | 'delete';

export const BRIDGE_PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
export const BRIDGE_UPLOAD_URL = process.env.CDN_UPLOAD_URL || 'https://neupcdn.com/upload';
export const BRIDGE_CDN_BASE_URL = (process.env.CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_BASE_URL || process.env.CDN_HOST || 'http://localhost:3001').replace(/\/$/, '');
export const BRIDGE_CDN_OPERATION_BASE = getCdnOperationBase();
export const DEFAULT_BRIDGE_OWNER = 'demo-user-123';
const BRIDGE_FOLDER_TYPES = new Set(['drive', 'assets', 'private', 'signed']);
const TRASH_RETENTION_DAYS = 30;

export function getBridgeOwner(request: NextRequest) {
    return (
        request.headers.get('x-account-id') ||
        request.headers.get('x-owner') ||
        request.nextUrl.searchParams.get('account_id') ||
        request.nextUrl.searchParams.get('owner') ||
        DEFAULT_BRIDGE_OWNER
    ).trim();
}

export function getParam(request: NextRequest, name: string) {
    return request.nextUrl.searchParams.get(name) || request.headers.get(`x-${name.replace(/_/g, '-')}`);
}

export function getRequestDeviceIp(request: NextRequest) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || '';
    return request.headers.get('cf-connecting-ip') || request.headers.get('x-real-ip') || (request as unknown as { ip?: string }).ip || '';
}

export function getDetails(details: Prisma.JsonValue): Prisma.JsonObject {
    return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
}

export function isActiveFileDetails(details: Prisma.JsonValue) {
    const parsedDetails = getDetails(details);
    return parsedDetails.status !== 'DELETED' && parsedDetails.status !== 'TRASHED';
}

export function assertSafePathSegment(value: string, label: string) {
    if (!value || value.includes('\0') || value.includes('/') || value.includes('\\') || value === '.' || value === '..') {
        throw new Error(`Invalid ${label}`);
    }
    return value;
}

export function normalizeInternalPath(value?: string | null) {
    const cleaned = (value || '').trim().replace(/^\/+/, '');
    if (!cleaned) return '';

    const normalized = path.posix.normalize(cleaned);
    if (normalized === '.' || normalized === '..' || normalized.startsWith('../') || path.posix.isAbsolute(normalized)) {
        throw new Error('Invalid path');
    }
    return normalized;
}

export function sanitizeFilename(filename: string) {
    return assertSafePathSegment(filename.trim().replace(/[^a-zA-Z0-9._ -]/g, '_'), 'filename');
}

export function normalizeFolderType(folderType?: string | null) {
    const safeFolderType = assertSafePathSegment((folderType || 'drive').trim(), 'folder_type');
    if (!BRIDGE_FOLDER_TYPES.has(safeFolderType)) {
        throw new Error('Invalid folder_type');
    }
    return safeFolderType;
}

export function getTrashDeletesIn(from = new Date()) {
    return new Date(from.getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

export function buildBridgeTrashPath(owner: string, filename: string) {
    const safeOwner = assertSafePathSegment(owner, 'owner');
    const safeFilename = sanitizeFilename(path.posix.basename(filename));
    return path.posix.join('uploads', safeOwner, '.trash', safeFilename);
}

export function buildBridgeStoragePath(params: {
    owner: string;
    folderType: string;
    filename: string;
    internalPath?: string | null;
    timestamp?: number;
}) {
    const safeOwner = assertSafePathSegment(params.owner, 'owner');
    const safeFolderType = normalizeFolderType(params.folderType);
    const safeFilename = sanitizeFilename(params.filename);
    const prefix = params.timestamp ? `${params.timestamp}-${safeFilename}` : safeFilename;
    const internalPath = normalizeInternalPath(params.internalPath);
    return path.posix.join('uploads', safeOwner, safeFolderType, internalPath, prefix);
}

export function addUniqueFilenameSuffix(filename: string, suffix = Date.now().toString()) {
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex > 0) {
        return `${filename.slice(0, dotIndex)}.${suffix}${filename.slice(dotIndex)}`;
    }
    return `${filename}.${suffix}`;
}

async function findActiveFileFolderByPath(owner: string, filePath: string) {
    return prisma.fileFolder.findFirst({
        where: {
            owner,
            path: filePath,
        },
        orderBy: { created_on: 'desc' },
    });
}

export async function getDuplicateWebdiskFilename(params: {
    owner: string;
    folderType: string;
    filename: string;
    internalPath?: string | null;
}) {
    const destinationPath = buildBridgeStoragePath(params);
    const existing = await findActiveFileFolderByPath(params.owner, destinationPath);
    if (!existing) return null;

    if (!isActiveFileDetails(existing.details)) return null;

    return {
        existing,
        destinationPath,
        suggestedFilename: addUniqueFilenameSuffix(sanitizeFilename(params.filename)),
    };
}

export function toAccountRelativePath(filePath: string, owner: string) {
    const cleanPath = filePath.replace(/^\/+/, '');
    const prefix = `uploads/${owner}/`;
    if (cleanPath.startsWith(prefix)) return cleanPath.slice(prefix.length);
    if (cleanPath.startsWith('uploads/')) return cleanPath.slice('uploads/'.length);
    return cleanPath;
}

export function getFolderType(filefolder: { path: string; details: Prisma.JsonValue }) {
    const details = getDetails(filefolder.details);
    if (typeof details.folder_type === 'string') return details.folder_type;
    if (typeof details.mode === 'string') return details.mode;

    const parts = filefolder.path.replace(/^\/+/, '').split('/');
    return parts.length >= 3 ? parts[2] : 'drive';
}

export function createBridgeViewToken(
    filefolder: { owner: string; path: string; details: Prisma.JsonValue },
    action: 'view' | 'download' = 'view',
    options: {
        expiresInSeconds?: number;
        deviceIp?: string;
        userAgent?: string;
    } = {},
) {
    const folderType = getFolderType(filefolder);
    return encodeSignedCdnToken(createSignedCdnToken(createExpiringOperationPayload({
        action: 'view',
        account_id: filefolder.owner,
        account_folder: filefolder.owner,
        folder_type: folderType,
        path: filefolder.path,
        method: 'GET',
        device_ip: options.deviceIp,
        user_agent: options.userAgent,
    }, options.expiresInSeconds), BRIDGE_PRIVATE_KEY));
}

function stripFolderType(relativePath: string, folderType: string) {
    const prefix = `${folderType}/`;
    return relativePath === folderType ? '' : relativePath.startsWith(prefix) ? relativePath.slice(prefix.length) : relativePath;
}

export function createBridgeFileUrl(
    filefolder: { owner: string; path: string; details: Prisma.JsonValue },
    action: 'view' | 'download' = 'view',
    options: {
        expiresIn?: string | null;
        expiresInSeconds?: number;
        deviceIp?: string;
        userAgent?: string;
    } = {},
) {
    const folderType = getFolderType(filefolder);
    const relativePath = toAccountRelativePath(filefolder.path, filefolder.owner);
    const exposedPath = folderType === 'assets' || folderType === 'signed' || folderType === 'private'
        ? stripFolderType(relativePath, folderType)
        : relativePath;
    const encodedPath = exposedPath.split('/').filter(Boolean).map(encodeURIComponent).join('/');

    if (folderType === 'assets') {
        return `${BRIDGE_CDN_BASE_URL}/files/${encodeURIComponent(filefolder.owner)}/${encodedPath}`;
    }

    const maxSeconds = folderType === 'private' ? 60 * 60 : folderType === '.trash' ? 60 : 24 * 60 * 60;
    const expiresInSeconds = options.expiresInSeconds ?? parseDurationSeconds(options.expiresIn, {
        min: folderType === 'private' ? 60 : 60,
        max: maxSeconds,
        fallback: folderType === '.trash' ? 60 : 15 * 60,
    });
    const token = createBridgeViewToken(filefolder, action, {
        expiresInSeconds,
        deviceIp: options.deviceIp,
        userAgent: options.userAgent,
    });
    const disposition = action === 'download' ? '&download=1' : '';
    const tokenQuery = `token=${encodeURIComponent(token)}${disposition}`;

    if (folderType === 'signed') {
        return `${BRIDGE_CDN_BASE_URL}/files/${encodeURIComponent(filefolder.owner)}/signed/${formatDurationToken(expiresInSeconds)}/${encodedPath}?${tokenQuery}`;
    }

    if (folderType === 'private') {
        return `${BRIDGE_CDN_BASE_URL}/files/${encodeURIComponent(filefolder.owner)}/private/${encodedPath}?${tokenQuery}`;
    }

    if (folderType === 'drive') {
        const encodedStoragePath = filefolder.path.split('/').filter(Boolean).map(encodeURIComponent).join('/');
        return `${BRIDGE_CDN_BASE_URL}/files/${encodeURIComponent(filefolder.owner)}/drive/${encodedStoragePath}?${tokenQuery}`;
    }

    if (folderType === '.trash') {
        const encodedTrashPath = stripFolderType(toAccountRelativePath(filefolder.path, filefolder.owner), '.trash').split('/').filter(Boolean).map(encodeURIComponent).join('/');
        return `${BRIDGE_CDN_BASE_URL}/files/${encodeURIComponent(filefolder.owner)}/.trash/${encodedTrashPath}?${tokenQuery}`;
    }

    return `${BRIDGE_CDN_BASE_URL}/files/${encodeURIComponent(filefolder.owner)}/${encodeURIComponent(folderType)}/${encodedPath}?${tokenQuery}`;
}

export async function createBridgeUploadInit(params: {
    owner: string;
    fileId: string;
    filename: string;
    size: number;
    mime: string;
    fileHash: string;
    folderType?: string | null;
    internalPath?: string | null;
}) {
    const owner = assertSafePathSegment(params.owner, 'owner');
    const timestamp = Date.now();
    const folderType = normalizeFolderType(params.folderType);
    const isWebdiskUpload = folderType !== 'drive';
    const filename = sanitizeFilename(params.filename);
    const destinationPath = buildBridgeStoragePath({
        owner,
        folderType,
        filename,
        internalPath: params.internalPath,
        timestamp: isWebdiskUpload ? undefined : timestamp,
    });
    const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;
    const uploadSessionId = crypto.randomUUID();

    await prisma.user.upsert({
        where: { id: owner },
        create: { id: owner, email: `${owner}@bridge.local`, name: owner },
        update: {},
    });

    await prisma.file.create({
        data: {
            name: filename,
            size: BigInt(params.size),
            mimeType: params.mime,
            hash: params.fileHash,
            path: destinationPath,
            status: 'PENDING',
            userId: owner,
        },
    });

    const payload: UploadSignaturePayload = {
        path: destinationPath,
        account_id: owner,
        method: 'PUT',
        max_size: params.size,
        content_type: params.mime,
        expires_at: expiresAt,
        nonce: generateNonce(),
        key_id: process.env.CDN_SIGNING_KEY_ID || 'bridge-key',
    };
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    const signature = signCdnPayloadBase64(payloadBase64, BRIDGE_PRIVATE_KEY);

    const response: UploadInitResponse = {
        upload_session_id: uploadSessionId,
        destination_path: destinationPath,
        upload_endpoint: BRIDGE_UPLOAD_URL,
        signed_upload_token: {
            payload: payloadBase64,
            signature,
        },
        expires_at: expiresAt,
    };

    const filefolder = await recordFileFolderUpload({
        name: filename,
        path: destinationPath,
        mimeType: params.mime,
        owner,
        size: params.size,
        mode: folderType === 'drive' ? 'drive' : 'webdisk',
        storedAs: folderType === 'drive' ? 'drivefile' : webdiskStoredAs(folderType),
        details: {
            file_id: params.fileId,
            file_hash: params.fileHash,
            upload_session_id: uploadSessionId,
            destination_path: destinationPath,
            status: 'PENDING',
            source: 'bridge',
            folder_type: folderType,
            api_response: response as any,
        },
    });

    return { ...response, filefolder_id: filefolder.id, folder_type: folderType };
}

export async function findBridgeFile(params: {
    owner: string;
    filefolderId?: string | null;
    fileId?: string | null;
    filePath?: string | null;
}) {
    if (params.filefolderId) {
        return prisma.fileFolder.findFirst({
            where: {
                id: params.filefolderId,
                owner: params.owner,
            },
        });
    }

    if (params.filePath) {
        return prisma.fileFolder.findFirst({
            where: {
                path: params.filePath,
                owner: params.owner,
            },
            orderBy: { created_on: 'desc' },
        });
    }

    if (params.fileId) {
        return prisma.fileFolder.findFirst({
            where: {
                owner: params.owner,
                details: {
                    path: ['file_id'],
                    equals: params.fileId,
                },
            },
            orderBy: { created_on: 'desc' },
        });
    }

    return null;
}

function getCdnOperationBase() {
    const explicit = process.env.CDN_OPERATION_URL;
    if (!explicit) return `${BRIDGE_CDN_BASE_URL}/operate`;

    try {
        const url = new URL(explicit);
        if (url.pathname.endsWith('/operation') || url.pathname.endsWith('/operate')) {
            return `${url.origin}/operate`;
        }
        return `${url.origin}${url.pathname.replace(/\/$/, '')}`;
    } catch {
        return explicit.replace(/\/$/, '');
    }
}

export async function callBridgeCdnOperation(action: BridgeOrganizeType, token: string) {
    const response = await fetch(`${BRIDGE_CDN_OPERATION_BASE}/${encodeURIComponent(action)}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-file-operation-token': token,
        },
    });

    let data: any = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok || !data?.success) {
        const message = data?.error || data?.message || `CDN operation failed with ${response.status}`;
        throw new Error(message);
    }

    return data as { success: true; action: BridgeOrganizeType; path?: string; destination_path?: string; deleted_path?: string };
}

export async function organizeBridgeFile(params: {
    filefolder: NonNullable<Awaited<ReturnType<typeof findBridgeFile>>>;
    action: BridgeOrganizeType;
    newName?: string | null;
    toFolderType?: string | null;
    destinationInternalPath?: string | null;
}) {
    const details = getDetails(params.filefolder.details);
    if (!isActiveFileDetails(params.filefolder.details)) throw new Error('File is already deleted');

    const currentFolderType = getFolderType(params.filefolder);
    const currentPath = params.filefolder.path;
    let nextName = params.filefolder.name;
    let nextFolderType = currentFolderType;
    let destinationPath: string | undefined;

    if (params.action === 'rename') {
        if (!params.newName) throw new Error('new_name is required for rename');
        nextName = sanitizeFilename(params.newName);
        destinationPath = path.posix.join(path.posix.dirname(currentPath), nextName);
    }

    if (params.action === 'move') {
        if (!params.toFolderType) throw new Error('to_folder_type is required for move');
        nextFolderType = normalizeFolderType(params.toFolderType);
        destinationPath = buildBridgeStoragePath({
            owner: params.filefolder.owner,
            folderType: nextFolderType,
            filename: params.filefolder.name,
            internalPath: params.destinationInternalPath,
        });
    }

    if (params.action === 'delete') {
        nextFolderType = '.trash';
        destinationPath = buildBridgeTrashPath(params.filefolder.owner, params.filefolder.name);
    }

    const token = encodeSignedCdnToken(createSignedCdnToken(createExpiringOperationPayload({
        action: params.action,
        account_id: params.filefolder.owner,
        account_folder: params.filefolder.owner,
        folder_type: currentFolderType,
        path: currentPath,
        destination_path: destinationPath,
        new_name: params.action === 'rename' ? nextName : undefined,
        method: 'POST',
    }, params.action === 'delete' ? 60 : undefined), BRIDGE_PRIVATE_KEY));

    const cdnResult = await callBridgeCdnOperation(params.action, token);

    let updatedFilefolder;
    if (params.action === 'delete') {
        const finalPath = cdnResult.destination_path || cdnResult.path || destinationPath || currentPath;
        const now = new Date();
        const deletesIn = getTrashDeletesIn(now);
        updatedFilefolder = await prisma.fileFolder.update({
            where: { id: params.filefolder.id },
            data: {
                path: finalPath,
                stored_as: 'trash',
                details: {
                    ...details,
                    mode: 'trash',
                    folder_type: '.trash',
                    previous_mode: currentFolderType,
                    previous_path: currentPath,
                    status: 'TRASHED',
                    deleted_on: now.toISOString(),
                    deletes_in: deletesIn,
                    trash_path: finalPath,
                },
            },
        });
        await prisma.file.updateMany({ where: { path: currentPath }, data: { path: finalPath, status: 'TRASHED' } });
    } else {
        const finalPath = cdnResult.destination_path || cdnResult.path || destinationPath || currentPath;
        updatedFilefolder = await prisma.fileFolder.update({
            where: { id: params.filefolder.id },
            data: {
                name: nextName,
                path: finalPath,
                type: fileFolderTypeFromMime(typeof details.mimeType === 'string' ? details.mimeType : undefined),
                stored_as: 'drivefile',
                details: {
                    ...details,
                    mode: 'drive',
                    folder_type: nextFolderType,
                    previous_path: currentPath,
                    status: details.status ?? 'VERIFIED',
                },
            },
        });
        await prisma.file.updateMany({
            where: { path: currentPath },
            data: {
                name: nextName,
                path: finalPath,
                status: 'VERIFIED',
            },
        });
    }

    await createFileFolderLog({
        filefolderId: params.filefolder.id,
        action: params.action,
        details: {
            action: params.action,
            previous_path: currentPath,
            path: cdnResult.path ?? currentPath,
            destination_path: cdnResult.destination_path,
            folder_type: nextFolderType,
            source: 'bridge',
            cdn_result: cdnResult as any,
        },
        doneBy: params.filefolder.owner,
    });

    return { updatedFilefolder, cdnResult };
}
