import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { createExpiringOperationPayload, createSignedCdnToken, encodeSignedCdnToken } from '@/core/lib/cdn-token';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { webdiskStoredAs } from '@/core/lib/filefolder';

type WebdiskOperationAction = 'rename' | 'move' | 'delete';

interface WebdiskOperationRequest {
    action?: WebdiskOperationAction;
    cdn_path?: string;
    type?: string;
    new_name?: string;
    to_type?: string;
    to_path?: string;
}

const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
const CDN_BASE_URL = (process.env.CDN_BASE_URL || process.env.CDN_HOST || 'http://localhost:3001').replace(/\/$/, '');
const CDN_OPERATION_BASE = getCdnOperationBase();
const WEBDISK_ACCOUNT_ID = process.env.WEBDISK_ACCOUNT_ID || process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';
const WEBDISK_TYPES = ['assets', 'private', 'signed'];

function getCdnOperationBase() {
    const explicit = process.env.CDN_OPERATION_URL;
    if (!explicit) return `${CDN_BASE_URL}/operate`;

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

function assertSafePathSegment(value: string, label: string) {
    if (!value || value.includes('\0') || value.includes('/') || value.includes('\\') || value === '.' || value === '..') {
        throw new Error(`Invalid ${label}`);
    }
    return value;
}

function normalizeType(value?: string) {
    const type = value?.trim() || 'assets';
    if (!WEBDISK_TYPES.includes(type)) {
        throw new Error('Invalid type');
    }
    return type;
}

function normalizeFolderPath(value?: string) {
    const cleaned = (value || '').trim().replace(/^\/+/, '');
    if (!cleaned) return '';

    const normalized = path.posix.normalize(cleaned);
    if (normalized === '.' || normalized === '..' || normalized.startsWith('../') || path.posix.isAbsolute(normalized)) {
        throw new Error('Invalid path');
    }
    return normalized;
}

function normalizeCdnPath(value?: string) {
    const cleaned = (value || '').trim().replace(/^\/+/, '');
    const accountRoot = `uploads/${WEBDISK_ACCOUNT_ID}`;
    const normalized = path.posix.normalize(cleaned);
    if (!normalized || normalized === accountRoot || !normalized.startsWith(`${accountRoot}/`)) {
        throw new Error('Invalid cdn_path');
    }
    return normalized;
}

async function callCdnOperation(action: WebdiskOperationAction, token: string) {
    const response = await fetch(`${CDN_OPERATION_BASE}/${encodeURIComponent(action)}`, {
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

    return data as { success: true; action: WebdiskOperationAction; path?: string; destination_path?: string; deleted_path?: string };
}

function isMissingFileFolderTableError(error: unknown) {
    return Boolean(
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: unknown }).code === 'P2021' &&
        String((error as { message?: unknown }).message ?? '').includes('filefolder')
    );
}

async function syncFilefolderOperation(params: {
    action: WebdiskOperationAction;
    sourcePath: string;
    currentType: string;
    nextType: string;
    nextName?: string;
    finalPath: string;
    cdn: Awaited<ReturnType<typeof callCdnOperation>>;
}) {
    try {
        const filefolder = await prisma.fileFolder.findFirst({
            where: { path: params.sourcePath },
            orderBy: { created_on: 'desc' },
        });
        if (!filefolder) return;

        const details = filefolder.details && typeof filefolder.details === 'object' && !Array.isArray(filefolder.details)
            ? filefolder.details
            : {};

        if (params.action === 'delete') {
            await prisma.fileFolder.update({
                where: { id: filefolder.id },
                data: {
                    details: {
                        ...details,
                        status: 'DELETED',
                        deleted_on: new Date().toISOString(),
                        deleted_path: params.cdn.deleted_path ?? params.sourcePath,
                    },
                },
            });
            return;
        }

        await prisma.fileFolder.update({
            where: { id: filefolder.id },
            data: {
                name: params.nextName ?? filefolder.name,
                path: params.finalPath,
                stored_as: webdiskStoredAs(params.nextType),
                details: {
                    ...details,
                    mode: 'webdisk',
                    folder_type: params.nextType,
                    previous_path: params.sourcePath,
                    status: typeof details.status === 'string' ? details.status : 'VERIFIED',
                },
            },
        });
    } catch (error) {
        if (!isMissingFileFolderTableError(error)) throw error;
    }
}

export async function POST(request: NextRequest) {
    let body: WebdiskOperationRequest | undefined;

    try {
        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        body = await request.json();
        if (!body?.action || !['rename', 'move', 'delete'].includes(body.action)) {
            return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
        }

        const sourcePath = normalizeCdnPath(body.cdn_path);
        const currentType = normalizeType(body.type);
        let destinationPath: string | undefined;
        let newName: string | undefined;

        if (body.action === 'rename') {
            newName = assertSafePathSegment((body.new_name || '').trim(), 'new_name');
            destinationPath = path.posix.join(path.posix.dirname(sourcePath), newName);
        }

        if (body.action === 'move') {
            const destinationType = normalizeType(body.to_type);
            const destinationFolder = normalizeFolderPath(body.to_path);
            const filename = path.posix.basename(sourcePath);
            destinationPath = path.posix.join('uploads', WEBDISK_ACCOUNT_ID, destinationType, destinationFolder, filename);
        }

        const signedToken = createSignedCdnToken(createExpiringOperationPayload({
            action: body.action,
            account_id: WEBDISK_ACCOUNT_ID,
            account_folder: WEBDISK_ACCOUNT_ID,
            folder_type: currentType,
            path: sourcePath,
            destination_path: destinationPath,
            new_name: newName,
            method: 'POST',
        }), PRIVATE_KEY);

        const cdn = await callCdnOperation(body.action, encodeSignedCdnToken(signedToken));
        await syncFilefolderOperation({
            action: body.action,
            sourcePath,
            currentType,
            nextType: body.action === 'move' ? normalizeType(body.to_type) : currentType,
            nextName: newName,
            finalPath: cdn.destination_path || cdn.path || destinationPath || sourcePath,
            cdn,
        });
        return NextResponse.json({ success: true, action: body.action, cdn });
    } catch (error) {
        return handleServerError(error, '/bridge/api.v1/webdisk/files/operation', { body });
    }
}
