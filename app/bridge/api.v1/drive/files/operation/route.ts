import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { appendBridgeFileAccessLog } from '@/core/lib/file-access-log';
import { buildFileFolderActivityUpdate, createFileFolderLog, isDirectoryDetails } from '@/core/lib/filefolder';
import { buildBridgeTrashPath, getDetails, getTrashDeletesIn, isActiveFileDetails } from '@/core/lib/bridge-api';

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

Delete requests soft-succeed when the CDN reports `404_not_found`, still move metadata into the account trash path, append an audit line into `<account>/.logs/2026jun25`, and can be undone through the `restore` action.

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

function replacePathPrefix(value: string, sourcePrefix: string, destinationPrefix: string) {
    if (value === sourcePrefix) return destinationPrefix;
    if (!value.startsWith(`${sourcePrefix}/`)) return value;
    return `${destinationPrefix}${value.slice(sourcePrefix.length)}`;
}

async function syncFolderDescendants(params: {
    filefolder: NonNullable<Awaited<ReturnType<typeof prisma.fileFolder.findUnique>>>;
    action: Extract<FileOperationAction, 'delete' | 'restore'>;
    currentPath: string;
    finalPath: string;
    currentFolderType: string;
    nextFolderType: string;
}) {
    const descendantRows = await prisma.fileFolder.findMany({
        where: {
            owner: params.filefolder.owner,
            OR: [
                { path: params.currentPath },
                { path: { startsWith: `${params.currentPath}/` } },
            ],
        },
        orderBy: { created_on: 'asc' },
    });
    const now = new Date();
    const deletesIn = getTrashDeletesIn(now);

    await prisma.$transaction([
        ...descendantRows.map((row) => {
            const rowDetails = getDetails(row.details);
            const nextPath = params.action === 'restore'
                ? typeof rowDetails.previous_path === 'string' && rowDetails.previous_path
                    ? rowDetails.previous_path
                    : replacePathPrefix(row.path, params.currentPath, params.finalPath)
                : replacePathPrefix(row.path, params.currentPath, params.finalPath);
            const activityUpdate = buildFileFolderActivityUpdate({
                currentActivity: row.last_activity,
                action: params.action === 'delete' ? 'deleted' : 'restored',
                details: {
                    path: nextPath,
                    previous_path: row.path,
                    folder_type: params.nextFolderType,
                },
            });

            if (params.action === 'delete') {
                return prisma.fileFolder.update({
                    where: { id: row.id },
                    data: {
                        path: nextPath,
                        type: params.currentFolderType === 'signed' ? 'signed' : params.currentFolderType === 'assets' ? 'assets' : 'drive',
                        stored_as: params.currentFolderType === 'signed' ? 'signed' : params.currentFolderType === 'assets' ? 'assets' : 'drive',
                        details: {
                            ...rowDetails,
                            mode: 'trash',
                            folder_type: '.trash',
                            previous_mode: params.currentFolderType,
                            previous_path: row.path,
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
            } = rowDetails;

            return prisma.fileFolder.update({
                where: { id: row.id },
                data: {
                    path: nextPath,
                    type: 'drive',
                    stored_as: 'drive',
                    details: {
                        ...restoredDetails,
                        mode: params.nextFolderType,
                        folder_type: params.nextFolderType,
                        previous_mode: '.trash',
                        previous_path: row.path,
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

function buildLogicalDestinationPath(owner: string, filename: string, destinationInternalPath?: string) {
    const normalizedPath = destinationInternalPath ? normalizeInternalPath(destinationInternalPath) : '';
    return path.posix.join(owner, 'drive', normalizedPath, filename);
}

const FOLDER_TYPES = new Set(['drive', 'assets', 'signed']);

function getFolderType(details: Prisma.JsonObject) {
    return typeof details.mode === 'string' ? details.mode : 'drive';
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
    if (safeFolderType != 'drive') {
        throw new Error('Drive files can only be moved within Drive');
    }
    return buildLogicalDestinationPath(owner, filename, destinationInternalPath);
}

async function callNoopCdnOperation(action: FileOperationAction, currentPath: string, destinationPath?: string) {
    return {
        success: true as const,
        action: action === 'restore' ? 'move' : action === 'rename' ? 'rename' : action === 'move' ? 'move' : 'delete',
        path: action === 'delete' ? currentPath : destinationPath || currentPath,
        destination_path: destinationPath,
        deleted_path: action === 'delete' ? currentPath : undefined,
    };
}

export async function POST(request: NextRequest) {
    let body: FileOperationRequest | undefined;

    try {
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
            nextFolderType = operation.to_folder_type;
            destinationPath = makeDestinationPath(filefolder.owner, nextFolderType, filefolder.name, operation.destination_internal_path);
        }

        const isFolder = isDirectoryDetails(filefolder.details);

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

        const cdnResult = await callNoopCdnOperation(operation.action, currentPath, destinationPath);

        const operationDetails: Prisma.InputJsonObject = {
            action: operation.action,
            previous_path: currentPath,
            path: cdnResult.path ?? currentPath,
            destination_path: cdnResult.destination_path,
            folder_type: nextFolderType,
            missing_source: false,
            metadata_only: true,
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
            currentActivity: filefolder.last_activity,
            action: activityAction,
            details: {
                path: finalPath,
                previous_path: currentPath,
                folder_type: nextFolderType,
            },
        });

        if (isFolder && (operation.action === 'delete' || operation.action === 'restore')) {
            await syncFolderDescendants({
                filefolder,
                action: operation.action,
                currentPath,
                finalPath,
                currentFolderType,
                nextFolderType,
            });
            updatedFilefolder = await prisma.fileFolder.findUnique({
                where: { id: filefolder.id },
            });
        } else if (operation.action === 'delete') {
            const now = new Date();
            const deletesIn = getTrashDeletesIn(now);
            updatedFilefolder = await prisma.fileFolder.update({
                where: { id: filefolder.id },
                data: {
                    path: finalPath,
                    type: 'drive',
                    stored_as: 'drive',
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
                    last_activity: activityUpdate.last_activity,
                    lastActivityOn: activityUpdate.lastActivityOn,
                    totalActivity: activityUpdate.totalActivity,
                },
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
                    type: 'drive',
                    stored_as: 'drive',
                    details: {
                        ...restoredDetails,
                        mode: nextFolderType,
                        folder_type: nextFolderType,
                        previous_mode: '.trash',
                        previous_path: currentPath,
                        status: 'VERIFIED',
                    },
                    last_activity: activityUpdate.last_activity,
                    lastActivityOn: activityUpdate.lastActivityOn,
                    totalActivity: activityUpdate.totalActivity,
                },
            });
        } else {
            updatedFilefolder = await prisma.fileFolder.update({
                where: { id: filefolder.id },
                data: {
                    name: nextName,
                    path: finalPath,
                    type: 'drive',
                    stored_as: 'drive',
                    details: {
                        ...details,
                        mode: nextFolderType,
                        previous_path: currentPath,
                        status: details.status ?? 'VERIFIED',
                    },
                    last_activity: activityUpdate.last_activity,
                    lastActivityOn: activityUpdate.lastActivityOn,
                    totalActivity: activityUpdate.totalActivity,
                },
            });
        }

        if (!updatedFilefolder) {
            throw new Error('Failed to reload updated filefolder');
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
                    missing_source: false,
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
            missing_source: false,
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
