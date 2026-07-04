import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { appendBridgeFileAccessLog } from '@/core/lib/file-access-log';
import { createExpiringOperationPayload, createSignedCdnToken, encodeSignedCdnToken } from '@/core/lib/cdn-token';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { logToDatabase } from '@/core/lib/error-server';
import { buildFileFolderActivityUpdate, isDirectoryDetails, webdiskStoredAs } from '@/core/lib/filefolder';
import { buildBridgeTrashPath, getTrashDeletesIn, isMissingCdnFileError, isReservedWebdiskRootFolder } from '@/core/lib/bridge-api';
import { ErrorType } from '@/core/lib/error-types';

/*
::neup.documentation::webdisk-files-operation-route
::api POST /bridge/api.v1/webdisk/files/operation
::title Webdisk File Operation Route

Handles rename, move, delete, and restore requests for CDN-listed WebDisk files.

::details

Delete operations now move files into `.trash/<original-location>`, log every API action into `<account>/.logs/2026jun25`, treat CDN `404_not_found` delete responses as soft-delete success, and allow an undo through the `restore` action.

::end
*/

type WebdiskOperationAction = 'rename' | 'move' | 'delete' | 'restore';

interface WebdiskOperationRequest {
    action?: WebdiskOperationAction;
    filefolder_id?: string;
    cdn_path?: string;
    type?: string;
    new_name?: string;
    to_type?: string;
    to_path?: string;
    previous_path?: string;
    previous_type?: string;
}

const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
const CDN_BASE_URL = (process.env.CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_BASE_URL || process.env.CDN_HOST || 'http://localhost:3001').replace(/\/$/, '');
const CDN_OPERATION_BASE = getCdnOperationBase();
const WEBDISK_ACCOUNT_ID = process.env.WEBDISK_ACCOUNT_ID || process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';
const WEBDISK_TYPES = ['assets', 'signed'];

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
    const type = (value?.trim() || 'assets').toLowerCase();
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
    const accountRoot = WEBDISK_ACCOUNT_ID;
    const normalized = path.posix.normalize(cleaned);
    if (!normalized || normalized === accountRoot || !normalized.startsWith(`${accountRoot}/`)) {
        throw new Error('Invalid cdn_path');
    }
    return normalized;
}

function isWebdiskStoragePath(value: string) {
    const cleanPath = value.replace(/^\/+/, '');
    return (
        cleanPath.startsWith(`${WEBDISK_ACCOUNT_ID}/assets/`) ||
        cleanPath === `${WEBDISK_ACCOUNT_ID}/assets` ||
        cleanPath.startsWith(`${WEBDISK_ACCOUNT_ID}/signed/`) ||
        cleanPath === `${WEBDISK_ACCOUNT_ID}/signed`
    );
}

function normalizeLegacyWebdiskPath(value: string) {
    const cleanPath = value.replace(/^\/+/, '');
    const legacyPrefix = `uploads/${WEBDISK_ACCOUNT_ID}/`;
    if (!cleanPath.startsWith(legacyPrefix)) return cleanPath;

    const legacyRelative = cleanPath.slice(legacyPrefix.length);
    if (legacyRelative.startsWith('assets/') || legacyRelative === 'assets') {
        return `${WEBDISK_ACCOUNT_ID}/${legacyRelative}`;
    }
    if (legacyRelative.startsWith('signed/') || legacyRelative === 'signed') {
        return `${WEBDISK_ACCOUNT_ID}/${legacyRelative}`;
    }
    if (legacyRelative.startsWith('.trash/') || legacyRelative === '.trash') {
        return `${WEBDISK_ACCOUNT_ID}/${legacyRelative}`;
    }

    return cleanPath;
}

function replacePathPrefix(value: string, sourcePrefix: string, destinationPrefix: string) {
    if (value === sourcePrefix) return destinationPrefix;
    if (!value.startsWith(`${sourcePrefix}/`)) return value;
    return `${destinationPrefix}${value.slice(sourcePrefix.length)}`;
}

function folderTypeFromStoragePath(storagePath: string) {
    const cleanPath = normalizeLegacyWebdiskPath(storagePath);
    const parts = cleanPath.split('/');
    return normalizeType(parts[1]);
}

function resolveWebdiskSourcePath(storagePath: string) {
    const normalized = normalizeLegacyWebdiskPath(storagePath);
    if (isWebdiskStoragePath(normalized)) return normalized;
    return null;
}

async function callCdnOperation(action: Extract<WebdiskOperationAction, 'rename' | 'move' | 'delete'>, token: string) {
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

    return data as { success: true; action: 'rename' | 'move' | 'delete'; path?: string; destination_path?: string; deleted_path?: string };
}

async function registerMissingFileMoveError(params: {
    attemptedBy: string;
    oldLocation: string;
    attemptedAction: string;
    destinationPath?: string;
}) {
    const error = new Error('file_not_found');
    (error as Error & { code?: string }).code = ErrorType.FILE_NOT_FOUND;

    await logToDatabase(error, JSON.stringify({
        errorType: 'file_not_found',
        old_location: params.oldLocation,
        attempted_action: params.attemptedAction,
        attempted_by: params.attemptedBy,
        destination_path: params.destinationPath,
    }), '/bridge/api.v1/webdisk/files/operation');
}

async function registerFolderNotFoundError(params: {
    filefolderId?: string;
    cdnPath?: string;
    action?: string;
    reason: string;
    body?: unknown;
}) {
    const error = new Error('Folder not found');
    (error as Error & { code?: string }).code = ErrorType.FOLDER_NOT_FOUND;

    await logToDatabase(error, JSON.stringify({
        errorType: ErrorType.FOLDER_NOT_FOUND,
        filefolder_id: params.filefolderId,
        cdn_path: params.cdnPath,
        action: params.action,
        reason: params.reason,
        body: params.body,
    }), '/bridge/api.v1/webdisk/files/operation', {
        suppressConsole: true,
    });
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
        const activityAction = params.action === 'rename'
            ? 'renamed'
            : params.action === 'move'
                ? 'moved'
                : params.action === 'delete'
                    ? 'deleted'
                    : 'restored';
        const activityUpdate = buildFileFolderActivityUpdate({
            currentActivity: filefolder.last_activity,
            action: activityAction,
            details: {
                path: params.finalPath,
                previous_path: params.sourcePath,
                folder_type: params.nextType,
            },
        });

        if (params.action === 'delete') {
            const now = new Date();
            await prisma.fileFolder.update({
                where: { id: filefolder.id },
                data: {
                    path: params.finalPath,
                    type: params.currentType === 'signed' ? 'signed' : 'assets',
                    stored_as: params.currentType === 'signed' ? 'signed' : 'assets',
                    details: {
                        ...details,
                        mode: 'trash',
                        folder_type: '.trash',
                        previous_mode: params.currentType,
                        previous_path: params.sourcePath,
                        status: 'TRASHED',
                        deleted_on: now.toISOString(),
                        deletes_in: getTrashDeletesIn(now),
                        trash_path: params.finalPath,
                    },
                    last_activity: activityUpdate.last_activity,
                    lastActivityOn: activityUpdate.lastActivityOn,
                    totalActivity: activityUpdate.totalActivity,
                },
            });
            return;
        }

        if (params.action === 'restore') {
            const {
                deleted_on: _deletedOn,
                deletes_in: _deletesIn,
                trash_path: _trashPath,
                ...restoredDetails
            } = details as Record<string, unknown>;

            await prisma.fileFolder.update({
                where: { id: filefolder.id },
                data: {
                    path: params.finalPath,
                    type: webdiskStoredAs(params.nextType),
                    stored_as: webdiskStoredAs(params.nextType),
                    details: {
                        ...restoredDetails,
                        mode: 'webdisk',
                        folder_type: params.nextType,
                        previous_mode: '.trash',
                        previous_path: params.sourcePath,
                        status: 'VERIFIED',
                    },
                    last_activity: activityUpdate.last_activity,
                    lastActivityOn: activityUpdate.lastActivityOn,
                    totalActivity: activityUpdate.totalActivity,
                },
            });
            return;
        }

        await prisma.fileFolder.update({
            where: { id: filefolder.id },
            data: {
                name: params.nextName ?? filefolder.name,
                path: params.finalPath,
                type: webdiskStoredAs(params.nextType),
                stored_as: webdiskStoredAs(params.nextType),
                details: {
                    ...details,
                    mode: 'webdisk',
                    folder_type: params.nextType,
                    previous_path: params.sourcePath,
                    status: typeof details.status === 'string' ? details.status : 'VERIFIED',
                },
                last_activity: activityUpdate.last_activity,
                lastActivityOn: activityUpdate.lastActivityOn,
                totalActivity: activityUpdate.totalActivity,
            },
        });
    } catch (error) {
        if (!isMissingFileFolderTableError(error)) throw error;
    }
}

async function syncFolderDescendants(params: {
    action: WebdiskOperationAction;
    sourcePath: string;
    currentType: string;
    nextType: string;
    finalPath: string;
}) {
    const filefolders = await prisma.fileFolder.findMany({
        where: {
            owner: WEBDISK_ACCOUNT_ID,
            OR: [
                { path: params.sourcePath },
                { path: { startsWith: `${params.sourcePath}/` } },
            ],
        },
        orderBy: { created_on: 'asc' },
    });
    const now = new Date();
    const deletesIn = getTrashDeletesIn(now);

    await prisma.$transaction([
        ...filefolders.map((filefolder) => {
            const details = filefolder.details && typeof filefolder.details === 'object' && !Array.isArray(filefolder.details)
                ? filefolder.details as Record<string, unknown>
                : {};
            const nextPath = params.action === 'restore'
                ? typeof details.previous_path === 'string' && details.previous_path
                    ? details.previous_path
                    : replacePathPrefix(filefolder.path, params.sourcePath, params.finalPath)
                : replacePathPrefix(filefolder.path, params.sourcePath, params.finalPath);
            const activityUpdate = buildFileFolderActivityUpdate({
                currentActivity: filefolder.last_activity,
                action: params.action === 'delete' ? 'deleted' : 'restored',
                details: {
                    path: nextPath,
                    previous_path: filefolder.path,
                    folder_type: params.nextType,
                },
            });

            if (params.action === 'delete') {
                return prisma.fileFolder.update({
                    where: { id: filefolder.id },
                    data: {
                        path: nextPath,
                        type: params.currentType === 'signed' ? 'signed' : 'assets',
                        stored_as: params.currentType === 'signed' ? 'signed' : 'assets',
                        details: {
                            ...details,
                            mode: 'trash',
                            folder_type: '.trash',
                            previous_mode: params.currentType,
                            previous_path: filefolder.path,
                            status: 'TRASHED',
                            deleted_on: now.toISOString(),
                            deletes_in: deletesIn,
                            trash_path: nextPath,
                        },
                        last_activity: activityUpdate.last_activity,
                        lastActivityOn: activityUpdate.lastActivityOn,
                        totalActivity: activityUpdate.totalActivity,
                    },
                });
            }

            const {
                deleted_on: _deletedOn,
                deletes_in: _deletesIn,
                trash_path: _trashPath,
                ...restoredDetails
            } = details;

            return prisma.fileFolder.update({
                where: { id: filefolder.id },
                data: {
                    path: nextPath,
                    type: webdiskStoredAs(params.nextType),
                    stored_as: webdiskStoredAs(params.nextType),
                    details: {
                        ...restoredDetails,
                        mode: 'webdisk',
                        folder_type: params.nextType,
                        previous_mode: '.trash',
                        previous_path: filefolder.path,
                        status: 'VERIFIED',
                    },
                    last_activity: activityUpdate.last_activity,
                    lastActivityOn: activityUpdate.lastActivityOn,
                    totalActivity: activityUpdate.totalActivity,
                },
            });
        }),
    ]);
}

export async function POST(request: NextRequest) {
    let body: WebdiskOperationRequest | undefined;

    try {
        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        body = await request.json();
        if (!body?.action || !['rename', 'move', 'delete', 'restore'].includes(body.action)) {
            return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
        }

        const explicitFilefolder = body.filefolder_id
            ? await prisma.fileFolder.findUnique({ where: { id: body.filefolder_id } })
            : null;
        if (body.filefolder_id && !explicitFilefolder) {
            await registerFolderNotFoundError({
                filefolderId: body.filefolder_id,
                cdnPath: body.cdn_path,
                action: body.action,
                reason: 'missing_filefolder_record',
                body,
            });
            if (body.action === 'delete') {
                return NextResponse.json({
                    success: true,
                    action: body.action,
                    missing_source: true,
                    code: ErrorType.FOLDER_NOT_FOUND,
                    cdn: {
                        success: true,
                        action: 'delete',
                    },
                });
            }
            return NextResponse.json({ error: 'Folder not found', code: ErrorType.FOLDER_NOT_FOUND }, { status: 404 });
        }
        const explicitSourcePath = explicitFilefolder ? resolveWebdiskSourcePath(explicitFilefolder.path) : null;
        if (explicitFilefolder && !explicitSourcePath && body.action !== 'delete') {
            await registerFolderNotFoundError({
                filefolderId: explicitFilefolder.id,
                cdnPath: explicitFilefolder.path,
                action: body.action,
                reason: 'path_is_not_webdisk_storage',
                body,
            });
            return NextResponse.json({ error: 'Folder not found', code: ErrorType.FOLDER_NOT_FOUND }, { status: 404 });
        }
        const sourcePath = explicitFilefolder
            ? explicitSourcePath || explicitFilefolder.path
            : normalizeCdnPath(body.cdn_path);
        let currentType = explicitFilefolder
            ? folderTypeFromStoragePath(explicitFilefolder.path)
            : normalizeType(body.type);
        let destinationPath: string | undefined;
        let newName: string | undefined;
        let nextType = currentType;
        let cdnAction: Extract<WebdiskOperationAction, 'rename' | 'move' | 'delete'> = body.action === 'restore' ? 'move' : body.action;
        const isFolder = explicitFilefolder ? isDirectoryDetails(explicitFilefolder.details) : false;

        if (body.action === 'rename') {
            newName = assertSafePathSegment((body.new_name || '').trim(), 'new_name');
            destinationPath = path.posix.join(path.posix.dirname(sourcePath), newName);
        }

        if (body.action === 'move') {
            const destinationType = normalizeType(body.to_type);
            const destinationFolder = normalizeFolderPath(body.to_path);
            if (isReservedWebdiskRootFolder(destinationType, destinationFolder)) {
                return NextResponse.json({ error: 'The "signed" folder name is reserved at the top level of assets' }, { status: 400 });
            }
            const filename = path.posix.basename(sourcePath);
            destinationPath = path.posix.join(WEBDISK_ACCOUNT_ID, destinationType, destinationFolder, filename);
            nextType = destinationType;
        }

        if (body.action === 'delete') {
            destinationPath = buildBridgeTrashPath({
                owner: WEBDISK_ACCOUNT_ID,
                folderType: currentType,
                currentPath: sourcePath,
            });
            nextType = '.trash';
        }

        if (body.action === 'restore') {
            const filefolder = explicitFilefolder || await prisma.fileFolder.findFirst({
                where: {
                    OR: [
                        { path: sourcePath },
                        { path: { startsWith: `${sourcePath}/` } },
                    ],
                },
                orderBy: { created_on: 'desc' },
            });
            const details = filefolder?.details && typeof filefolder.details === 'object' && !Array.isArray(filefolder.details)
                ? filefolder.details as Record<string, unknown>
                : {};
            const previousPath = typeof details.previous_path === 'string'
                ? details.previous_path
                : body.previous_path || '';
            const previousMode = typeof details.previous_mode === 'string'
                ? details.previous_mode
                : body.previous_type || '';
            if (!previousPath || !previousMode) {
                return NextResponse.json({ error: 'File cannot be restored' }, { status: 409 });
            }
            currentType = '.trash';
            nextType = normalizeType(previousMode);
            destinationPath = previousPath;
        }

        let cdn: Awaited<ReturnType<typeof callCdnOperation>>;
        let missingSource = false;

        if (explicitFilefolder && !explicitSourcePath && body.action === 'delete') {
            await registerFolderNotFoundError({
                filefolderId: explicitFilefolder.id,
                cdnPath: explicitFilefolder.path,
                action: body.action,
                reason: 'path_is_not_webdisk_storage',
                body,
            });
            missingSource = true;
            cdn = {
                success: true,
                action: cdnAction,
                path: sourcePath,
                destination_path: destinationPath,
                deleted_path: sourcePath,
            };
        } else {
            const signedToken = createSignedCdnToken(createExpiringOperationPayload({
                action: cdnAction,
                account_id: WEBDISK_ACCOUNT_ID,
                account_folder: WEBDISK_ACCOUNT_ID,
                folder_type: currentType,
                path: sourcePath,
                destination_path: destinationPath,
                new_name: newName,
                method: 'POST',
            }, body.action === 'delete' ? 60 : undefined), PRIVATE_KEY);

            try {
                cdn = await callCdnOperation(cdnAction, encodeSignedCdnToken(signedToken));
            } catch (error) {
                if (body.action === 'move' && isMissingCdnFileError(error)) {
                    await registerMissingFileMoveError({
                        attemptedBy: WEBDISK_ACCOUNT_ID,
                        oldLocation: sourcePath,
                        attemptedAction: body.action,
                        destinationPath,
                    });
                    return NextResponse.json({
                        error: 'File not found',
                        code: 'file_not_found',
                        old_location: sourcePath,
                        attempted_action: body.action,
                        attempted_by: WEBDISK_ACCOUNT_ID,
                    }, { status: 404 });
                }
                if (body.action !== 'delete' || !isMissingCdnFileError(error)) throw error;
                missingSource = true;
                cdn = {
                    success: true,
                    action: cdnAction,
                    path: sourcePath,
                    destination_path: destinationPath,
                    deleted_path: sourcePath,
                };
            }
        }
        const finalPath = cdn.destination_path || cdn.path || destinationPath || sourcePath;
        if (isFolder && (body.action === 'delete' || body.action === 'restore')) {
            await syncFolderDescendants({
                action: body.action,
                sourcePath,
                currentType,
                nextType,
                finalPath,
            });
        } else {
            await syncFilefolderOperation({
                action: body.action,
                sourcePath,
                currentType,
                nextType,
                nextName: newName,
                finalPath,
                cdn,
            });
        }
        try {
            await appendBridgeFileAccessLog({
                owner: WEBDISK_ACCOUNT_ID,
                fileType: currentType,
                location: finalPath,
                sourcePage: request.headers.get('referer') || request.headers.get('origin') || 'bridge/api.v1/webdisk/files/operation',
                viewerInfo: {
                    source_path: sourcePath,
                    final_path: finalPath,
                    requested_action: body.action,
                    missing_source: missingSource,
                    user_agent: request.headers.get('user-agent') || '',
                },
                action: body.action,
            });
        } catch {
            // Preserve the successful file operation even if log persistence fails.
        }
        return NextResponse.json({ success: true, action: body.action, missing_source: missingSource, cdn });
    } catch (error) {
        return handleServerError(error, '/bridge/api.v1/webdisk/files/operation', { body });
    }
}
