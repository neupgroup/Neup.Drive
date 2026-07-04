/*
::neup.documentation::folders-create-route
::api POST /bridge/api.v1/folders/create
::title Folder Create Route
::owner Neup Drive

Creates metadata-backed folders for Drive and WebDisk views.

::param mode
::location body

The folder surface to create into: `drive` or `webdisk`.

::param name
::location body

The new folder name.

::param folder_type
::location body

The target folder type: `drive`, `assets`, or `signed`.

::param internal_path
::location body

The parent relative path within the target surface.

::end
*/
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { createFileFolderLog, webdiskStoredAs } from '@/core/lib/filefolder';
import { isActiveFileDetails, isReservedWebdiskRootFolder, normalizeInternalPath } from '@/core/lib/bridge-api';

type FolderMode = 'drive' | 'webdisk';
type FolderType = 'drive' | 'assets' | 'signed';

interface CreateFolderRequest {
    mode?: FolderMode;
    name?: string;
    folder_type?: FolderType;
    internal_path?: string;
}

const DRIVE_OWNER = process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';
const WEBDISK_ACCOUNT_ID = process.env.WEBDISK_ACCOUNT_ID || process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';
const FOLDER_TYPES = new Set<FolderType>(['drive', 'assets', 'signed']);

function assertSafePathSegment(value: string, label: string) {
    if (!value || value.includes('\0') || value.includes('/') || value.includes('\\') || value === '.' || value === '..') {
        throw new Error(`Invalid ${label}`);
    }
    return value;
}

function normalizeMode(value?: string): FolderMode {
    return value === 'webdisk' ? 'webdisk' : 'drive';
}

function normalizeFolderType(value: string | undefined, mode: FolderMode): FolderType {
    const fallback = mode === 'drive' ? 'drive' : 'assets';
    const safeType = assertSafePathSegment((value || fallback).trim(), 'folder_type') as FolderType;
    if (!FOLDER_TYPES.has(safeType)) {
        throw new Error('Invalid folder_type');
    }
    return safeType;
}

function buildStoragePath(owner: string, folderType: FolderType, internalPath: string, name: string) {
    const segments = [owner, folderType];
    if (internalPath) segments.push(internalPath);
    segments.push(name);
    return path.posix.join(...segments);
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json() as CreateFolderRequest;
        const mode = normalizeMode(body.mode);
        const folderType = normalizeFolderType(body.folder_type, mode);
        const internalPath = normalizeInternalPath(body.internal_path);
        const name = assertSafePathSegment((body.name || '').trim(), 'name');

        if (mode === 'drive' && folderType !== 'drive') {
            return NextResponse.json({ error: 'Drive folders must use the drive folder type' }, { status: 400 });
        }

        if (mode === 'webdisk' && folderType === 'drive') {
            return NextResponse.json({ error: 'WebDisk folders must use assets or signed' }, { status: 400 });
        }

        if (isReservedWebdiskRootFolder(folderType, internalPath ? path.posix.join(internalPath, name) : name)) {
            return NextResponse.json({ error: 'The "signed" folder name is reserved at the top level of assets' }, { status: 400 });
        }

        const owner = mode === 'drive' ? DRIVE_OWNER : WEBDISK_ACCOUNT_ID;
        const storagePath = buildStoragePath(owner, folderType, internalPath, name);

        const existingFolder = await prisma.fileFolder.findFirst({
            where: { path: storagePath },
            orderBy: { created_on: 'desc' },
        });

        if (existingFolder && isActiveFileDetails(existingFolder.details)) {
            return NextResponse.json({ error: 'A folder with this name already exists' }, { status: 409 });
        }

        const folder = existingFolder
            ? await prisma.fileFolder.update({
                where: { id: existingFolder.id },
                data: {
                    name,
                    path: storagePath,
                    type: 'folder',
                    owner,
                    stored_as: mode === 'drive' ? 'drivefile' : webdiskStoredAs(folderType),
                    size: BigInt(0),
                    details: {
                        ...(existingFolder.details && typeof existingFolder.details === 'object' && !Array.isArray(existingFolder.details)
                            ? existingFolder.details
                            : {}),
                        mode,
                        folder_type: folderType,
                        mimeType: 'inode/directory',
                        status: 'VERIFIED',
                    },
                },
            })
            : await prisma.fileFolder.create({
                data: {
                    name,
                    path: storagePath,
                    type: 'folder',
                    owner,
                    stored_as: mode === 'drive' ? 'drivefile' : webdiskStoredAs(folderType),
                    size: BigInt(0),
                    details: {
                        mode,
                        folder_type: folderType,
                        mimeType: 'inode/directory',
                        status: 'VERIFIED',
                    },
                },
            });

        await createFileFolderLog({
            filefolderId: folder.id,
            action: 'create_folder',
            details: {
                mode,
                folder_type: folderType,
                internal_path: internalPath,
            },
            doneBy: owner,
        });

        return NextResponse.json({
            success: true,
            folder: {
                id: folder.id,
                name: folder.name,
                path: folder.path,
                type: folder.type,
            },
        }, { status: 201 });
    } catch (error) {
        return handleServerError(error, '/bridge/api.v1/folders/create', { method: 'POST' });
    }
}
