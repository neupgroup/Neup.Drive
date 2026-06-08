import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

import { createExpiringOperationPayload, createSignedCdnToken, encodeSignedCdnToken } from '@/core/lib/cdn-token';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { createFileFolderLog } from '@/core/lib/filefolder';
import { buildBridgeTrashPath, getTrashDeletesIn, isActiveFileDetails } from '@/core/lib/bridge-api';

type FileOperationAction = 'rename' | 'move' | 'delete';

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
const FOLDER_TYPES = new Set(['drive', 'assets', 'private', 'signed']);

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
        throw new Error(message);
    }

    return data as { success: true; action: FileOperationAction; path?: string; destination_path?: string; deleted_path?: string };
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

        if (!['rename', 'move', 'delete'].includes(operation.action)) {
            return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
        }

        const filefolder = await prisma.fileFolder.findUnique({
            where: { id: operation.filefolder_id },
        });

        if (!filefolder) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const details = getDetails(filefolder.details);
        if (!isActiveFileDetails(filefolder.details)) {
            return NextResponse.json({ error: 'File is already deleted' }, { status: 409 });
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

        if (operation.action === 'delete') {
            nextFolderType = '.trash';
            destinationPath = buildBridgeTrashPath(filefolder.owner, filefolder.name);
        }

        const signedToken = createSignedCdnToken(createExpiringOperationPayload({
            action: operation.action,
            account_id: filefolder.owner,
            account_folder: filefolder.owner,
            folder_type: currentFolderType,
            path: currentPath,
            destination_path: destinationPath,
            new_name: operation.action === 'rename' ? nextName : undefined,
            method: 'POST',
        }, operation.action === 'delete' ? 60 : undefined), PRIVATE_KEY);

        const cdnResult = await callCdnOperation(operation.action, encodeSignedCdnToken(signedToken));

        const operationDetails: Prisma.InputJsonObject = {
            action: operation.action,
            previous_path: currentPath,
            path: cdnResult.path ?? currentPath,
            destination_path: cdnResult.destination_path,
            folder_type: nextFolderType,
            cdn_result: cdnResult as any,
        };

        let updatedFilefolder;

        if (operation.action === 'delete') {
            const finalPath = cdnResult.destination_path || cdnResult.path || destinationPath || currentPath;
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
                },
            });
            await prisma.file.updateMany({
                where: { path: currentPath },
                data: { path: finalPath, status: 'TRASHED' },
            });
        } else {
            const finalPath = cdnResult.destination_path || cdnResult.path || destinationPath || currentPath;
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

        return NextResponse.json({
            success: true,
            action: operation.action,
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
