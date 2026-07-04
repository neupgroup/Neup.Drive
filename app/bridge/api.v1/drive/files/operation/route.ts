import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

import { createExpiringOperationPayload, createSignedCdnToken, encodeSignedCdnToken } from '@/core/lib/cdn-token';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { logToDatabase } from '@/core/lib/error-server';
import { appendBridgeFileAccessLog } from '@/core/lib/file-access-log';
import { buildFileFolderActivityUpdate, createFileFolderLog } from '@/core/lib/filefolder';
import { buildBridgeTrashPath, getTrashDeletesIn, isActiveFileDetails, isMissingCdnFileError, isReservedWebdiskRootFolder } from '@/core/lib/bridge-api';
import { ErrorType } from '@/core/lib/error-types';

/*
::neup.documentation::drive-files-operation-route
::api POST /bridge/api.v1/drive/files/operation
::title Drive File Operation Route

Handles rename, move, delete, and restore requests for bridge-managed files and keeps metadata in sync with CDN operations.

::param filefolder_id
::location body

The `filefolder` record to mutate.

::param action
::location body

The requested operation: `rename`, `move`, `delete`, or `restore`.

::details

Delete requests soft-succeed when the CDN reports `404_not_found`, still move metadata into the account trash path, append an audit line into `uploads/<account>/.logs/2026jun25`, and can be undone through the `restore` action.

::end
*/

type FileOperationAction = 'rename' | 'move' | 'delete' | 'restore';

interface FileOperationRequest {
    filefolder_id?: string;
    action?: FileOperationAction;
    new_name?: string;
    to_folder_type?: string;
    destination_internal_path?: string;
}

const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
const CDN_BASE_URL = (process.env.CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_BASE_URL || process.env.CDN_HOST || 'http://localhost:3001').replace(/\/$/, '');
const CDN_OPERATION_BASE = getCdnOperationBase();
const FOLDER_TYPES = new Set(['drive', 'assets', 'signed']);

function getDetails(details: Prisma.JsonValue): Prisma.JsonObject {
    return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
}

function getFolderType(details: Prisma.JsonObject) {
    return typeof details.mode === 'string' ? details.mode : 'drive';
}

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

function normalizeInternalPath(value: string) {
    const cleaned = value.trim().replace(/^\/+/, '');
    const normalized = path.posix.normalize(cleaned);
    if (!normalized || normalized === '.' || normalized.startsWith('../') || normalized === '..' || path.posix.isAbsolute(normalized)) {
        throw new Error('Invalid destination_internal_path');
    }
    return normalized;
}

function makeDestinationPath(owner: string, toFolderType: string, filename: string, destinationInternalPath?: string) {
    const safeFolderType = assertSafePathSegment(toFolderType, 'to_folder_type');
    if (!FOLDER_TYPES.has(safeFolderType)) {
        throw new Error('Invalid to_folder_type');
    }
    if (isReservedWebdiskRootFolder(safeFolderType, destinationInternalPath)) {
        throw new Error('The "signed" folder name is reserved at the top level of assets');
    }
    const internalPath = destinationInternalPath
        ? normalizeInternalPath(destinationInternalPath)
        : path.posix.join(safeFolderType, filename);

    return path.posix.join('uploads', owner, internalPath);
}

async function callCdnOperation(action: FileOperationAction, token: string) {
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
        const error = new Error(message) as Error & {
            status?: number;
            code?: string;
            response?: unknown;
        };
        error.status = response.status;
        error.code = typeof data?.error === 'string' ? data.error : undefined;
        error.response = data;
        throw error;
    }

    return data as { success: true; action: FileOperationAction; path?: string; destination_path?: string; deleted_path?: string };
}

async function registerMissingFileMoveError(params: {
    attemptedBy: string;
    oldLocation: string;
    attemptedAction: string;
    destinationPath?: string;
    filefolderId: string;
}) {
    const error = new Error('file_not_found');
    (error as Error & { code?: string }).code = ErrorType.FILE_NOT_FOUND;

    await logToDatabase(error, JSON.stringify({
        errorType: 'file_not_found',
        old_location: params.oldLocation,
        attempted_action: params.attemptedAction,
        attempted_by: params.attemptedBy,
        destination_path: params.destinationPath,
        filefolder_id: params.filefolderId,
    }), 'bridge/api.v1/drive/files/operation');
}

export async function POST(request: NextRequest) {
    let body: FileOperationRequest | undefined;

    try {
        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        body = await request.json();
        const operation = body;

        if (!operation?.filefolder_id || !operation.action) {
            return NextResponse.json({ error: 'filefolder_id and action are required' }, { status: 400 });
        }

        if (!['rename', 'move', 'delete', 'restore'].includes(operation.action)) {
            return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
        }

        const filefolder = await prisma.fileFolder.findUnique({
            where: { id: operation.filefolder_id },
        });

        if (!filefolder) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const details = getDetails(filefolder.details);
        if (operation.action !== 'restore' && !isActiveFileDetails(filefolder.details)) {
            return NextResponse.json({ error: 'File is already deleted' }, { status: 409 });
        }
        if (operation.action === 'restore' && isActiveFileDetails(filefolder.details)) {
            return NextResponse.json({ error: 'File is already active' }, { status: 409 });
        }

        const currentFolderType = getFolderType(details);
        const currentPath = filefolder.path;
        let destinationPath: string | undefined;
        let nextName = filefolder.name;
        let nextFolderType = currentFolderType;
        let cdnAction: Extract<FileOperationAction, 'rename' | 'move' | 'delete'> = operation.action === 'restore' ? 'move' : operation.action;

        if (operation.action === 'rename') {
            if (!operation.new_name) {
                return NextResponse.json({ error: 'new_name is required for rename' }, { status: 400 });
            }
            nextName = assertSafePathSegment(operation.new_name.trim(), 'new_name');
            destinationPath = path.posix.join(path.posix.dirname(currentPath), nextName);
        }

        if (operation.action === 'move') {
            if (!operation.to_folder_type) {
                return NextResponse.json({ error: 'to_folder_type is required for move' }, { status: 400 });
            }
            if (isReservedWebdiskRootFolder(operation.to_folder_type, operation.destination_internal_path)) {
                return NextResponse.json({ error: 'The "signed" folder name is reserved at the top level of assets' }, { status: 400 });
            }
            nextFolderType = operation.to_folder_type;
            destinationPath = makeDestinationPath(filefolder.owner, nextFolderType, filefolder.name, operation.destination_internal_path);
        }

        if (operation.action === 'delete') {
            nextFolderType = '.trash';
            destinationPath = buildBridgeTrashPath({
                owner: filefolder.owner,
                folderType: currentFolderType,
                currentPath,
            });
        }

        if (operation.action === 'restore') {
            const previousPath = typeof details.previous_path === 'string' ? details.previous_path : '';
            const previousMode = typeof details.previous_mode === 'string' ? details.previous_mode : '';
            if (!previousPath || !previousMode) {
                return NextResponse.json({ error: 'File cannot be restored' }, { status: 409 });
            }
            nextFolderType = previousMode;
            destinationPath = previousPath;
        }

        const signedToken = createSignedCdnToken(createExpiringOperationPayload({
            action: cdnAction,
            account_id: filefolder.owner,
            account_folder: filefolder.owner,
            folder_type: currentFolderType,
            path: currentPath,
            destination_path: destinationPath,
            new_name: operation.action === 'rename' ? nextName : undefined,
            method: 'POST',
        }, operation.action === 'delete' ? 60 : undefined), PRIVATE_KEY);

        let cdnResult: Awaited<ReturnType<typeof callCdnOperation>>;
        let missingSource = false;
        try {
            cdnResult = await callCdnOperation(cdnAction, encodeSignedCdnToken(signedToken));
        } catch (error) {
            if (operation.action === 'move' && isMissingCdnFileError(error)) {
                await registerMissingFileMoveError({
                    attemptedBy: filefolder.owner,
                    oldLocation: currentPath,
                    attemptedAction: operation.action,
                    destinationPath,
                    filefolderId: filefolder.id,
                });
                return NextResponse.json({
                    error: 'File not found',
                    code: 'file_not_found',
                    old_location: currentPath,
                    attempted_action: operation.action,
                    attempted_by: filefolder.owner,
                }, { status: 404 });
            }
            if (operation.action !== 'delete' || !isMissingCdnFileError(error)) throw error;
            missingSource = true;
            cdnResult = {
                success: true,
                action: cdnAction,
                path: currentPath,
                destination_path: destinationPath,
                deleted_path: currentPath,
            };
        }

        const operationDetails: Prisma.InputJsonObject = {
            action: operation.action,
            previous_path: currentPath,
            path: cdnResult.path ?? currentPath,
            destination_path: cdnResult.destination_path,
            folder_type: nextFolderType,
            missing_source: missingSource,
            cdn_result: cdnResult as any,
        };

        let updatedFilefolder;
        const finalPath = cdnResult.destination_path || cdnResult.path || destinationPath || currentPath;
        const activityAction = operation.action === 'rename'
            ? 'renamed'
            : operation.action === 'move'
                ? 'moved'
                : operation.action === 'delete'
                    ? 'deleted'
                    : 'restored';
        const activityUpdate = buildFileFolderActivityUpdate({
            currentActivity: filefolder.activity,
            action: activityAction,
            details: {
                path: finalPath,
                previous_path: currentPath,
                folder_type: nextFolderType,
            },
        });

        if (operation.action === 'delete') {
            const now = new Date();
            const deletesIn = getTrashDeletesIn(now);
            updatedFilefolder = await prisma.fileFolder.update({
                where: { id: filefolder.id },
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
                    activity: activityUpdate.activity,
                    lastActivityOn: activityUpdate.lastActivityOn,
                    totalActivity: activityUpdate.totalActivity,
                },
            });
            await prisma.file.updateMany({
                where: { path: currentPath },
                data: { path: finalPath, status: 'TRASHED' },
            });
        } else if (operation.action === 'restore') {
            const {
                deleted_on: _deletedOn,
                deletes_in: _deletesIn,
                trash_path: _trashPath,
                ...restoredDetails
            } = details;

            updatedFilefolder = await prisma.fileFolder.update({
                where: { id: filefolder.id },
                data: {
                    path: finalPath,
                    stored_as: 'drivefile',
                    details: {
                        ...restoredDetails,
                        mode: nextFolderType,
                        folder_type: nextFolderType,
                        previous_mode: '.trash',
                        previous_path: currentPath,
                        status: 'VERIFIED',
                    },
                    activity: activityUpdate.activity,
                    lastActivityOn: activityUpdate.lastActivityOn,
                    totalActivity: activityUpdate.totalActivity,
                },
            });
            await prisma.file.updateMany({
                where: { path: currentPath },
                data: {
                    path: finalPath,
                    status: 'VERIFIED',
                },
            });
        } else {
            updatedFilefolder = await prisma.fileFolder.update({
                where: { id: filefolder.id },
                data: {
                    name: nextName,
                    path: finalPath,
                    stored_as: 'drivefile',
                    details: {
                        ...details,
                        mode: nextFolderType,
                        previous_path: currentPath,
                        status: details.status ?? 'VERIFIED',
                    },
                    activity: activityUpdate.activity,
                    lastActivityOn: activityUpdate.lastActivityOn,
                    totalActivity: activityUpdate.totalActivity,
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
            filefolderId: filefolder.id,
            action: operation.action,
            details: operationDetails,
            doneBy: filefolder.owner,
        });

        try {
            await appendBridgeFileAccessLog({
                owner: filefolder.owner,
                fileType: currentFolderType,
                location: finalPath,
                sourcePage: request.headers.get('referer') || request.headers.get('origin') || 'bridge/api.v1/drive/files/operation',
                viewerInfo: {
                    filefolder_id: filefolder.id,
                    source_path: currentPath,
                    final_path: finalPath,
                    requested_action: operation.action,
                    missing_source: missingSource,
                    user_agent: request.headers.get('user-agent') || '',
                },
                action: operation.action,
            });
        } catch {
            // Preserve the successful file operation even if log persistence fails.
        }

        return NextResponse.json({
            success: true,
            action: operation.action,
            missing_source: missingSource,
            file: {
                id: updatedFilefolder.id,
                name: updatedFilefolder.name,
                path: updatedFilefolder.path,
                type: updatedFilefolder.type,
                owner: updatedFilefolder.owner,
                stored_as: updatedFilefolder.stored_as,
                details: updatedFilefolder.details,
            },
            cdn: cdnResult,
        });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/drive/files/operation', { body });
    }
}
