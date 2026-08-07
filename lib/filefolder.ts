/*
::neup.documentation::filefolder-helpers
::title Filefolder Helpers
::owner Neup Drive

::public

Shared helpers for filefolder storage surfaces, upload metadata persistence,
audit logs, and last-activity counters used by Drive and WebDisk flows.

::public end

::end
*/
import path from 'node:path';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/core/lib/db';

export type FileFolderMode = 'drive' | 'webdisk';
export type FileFolderStoredAs = 'drive' | 'assets' | 'signed';
export type FileFolderActivityAction =
    | 'uploaded'
    | 'folder_opened'
    | 'viewed'
    | 'renamed'
    | 'moved'
    | 'changed'
    | 'deleted'
    | 'restored';

const FILE_FOLDER_STORED_AS = new Set<FileFolderStoredAs>(['drive', 'assets', 'signed']);
const ACTIVITY_COUNTER_KEYS: Record<FileFolderActivityAction, string> = {
    uploaded: 'uploads',
    folder_opened: 'folderOpens',
    viewed: 'views',
    renamed: 'renames',
    moved: 'moves',
    changed: 'changes',
    deleted: 'deletes',
    restored: 'restores',
};

export function parseFileFolderMode(mode: string | null): FileFolderMode {
    if (mode === 'webdisk' || mode === 'drive') return mode;
    return 'drive';
}

export function normalizeFileFolderStoredAs(value?: string | null): FileFolderStoredAs {
    if (FILE_FOLDER_STORED_AS.has(value as FileFolderStoredAs)) {
        return value as FileFolderStoredAs;
    }
    return 'drive';
}

export function webdiskStoredAs(folderType?: string | null): Extract<FileFolderStoredAs, 'assets' | 'signed'> {
    return folderType === 'signed' ? 'signed' : 'assets';
}

export function fileFolderStoredAsForMode(
    mode: FileFolderMode,
    folderType?: string | null,
): FileFolderStoredAs {
    if (mode === 'drive') return 'drive';
    return webdiskStoredAs(folderType);
}

export function isDirectoryMimeType(mimeType?: string | null) {
    return mimeType === 'inode/directory';
}

export function isDirectoryDetails(details: Prisma.JsonValue | Prisma.InputJsonValue | undefined) {
    if (!details || typeof details !== 'object' || Array.isArray(details)) return false;
    return (details as Record<string, unknown>).mimeType === 'inode/directory';
}

function parseLastActivity(
    lastActivity: Prisma.JsonValue | Prisma.InputJsonValue | undefined,
) {
    if (!lastActivity || typeof lastActivity !== 'object' || Array.isArray(lastActivity)) {
        return {};
    }

    return lastActivity as Record<string, unknown>;
}

function normalizeDetailsForActivity(details?: Record<string, unknown>) {
    if (!details) return undefined;
    return JSON.parse(JSON.stringify(details)) as Prisma.InputJsonValue;
}

export function buildFileFolderActivityUpdate(params: {
    currentActivity?: Prisma.JsonValue | Prisma.InputJsonValue;
    action: FileFolderActivityAction;
    at?: Date;
    details?: Record<string, unknown>;
}) {
    const at = params.at || new Date();
    const currentActivity = parseLastActivity(params.currentActivity);
    const counts = currentActivity.counts && typeof currentActivity.counts === 'object' && !Array.isArray(currentActivity.counts)
        ? currentActivity.counts as Record<string, unknown>
        : {};
    const counterKey = ACTIVITY_COUNTER_KEYS[params.action];
    const currentCount = typeof counts[counterKey] === 'number' ? counts[counterKey] as number : 0;
    const currentTotal = typeof currentActivity.total === 'number' ? currentActivity.total as number : 0;
    const nextTotal = currentTotal + 1;
    const normalizedDetails = normalizeDetailsForActivity(params.details);

    return {
        last_activity: {
            ...currentActivity,
            lastAction: params.action,
            lastActionOn: at.toISOString(),
            total: nextTotal,
            counts: {
                ...counts,
                [counterKey]: currentCount + 1,
            } as Prisma.InputJsonObject,
            ...(normalizedDetails ? { lastDetails: normalizedDetails } : {}),
        } satisfies Prisma.InputJsonObject,
        lastActivityOn: at,
        totalActivity: nextTotal,
    };
}

export async function recordFileFolderActivity(params: {
    filefolderId: string;
    action: FileFolderActivityAction;
    at?: Date;
    details?: Record<string, unknown>;
}) {
    const filefolder = await prisma.fileFolder.findUnique({
        where: { id: params.filefolderId },
        select: {
            id: true,
            last_activity: true,
        },
    });

    if (!filefolder) return null;

    const update = buildFileFolderActivityUpdate({
        currentActivity: filefolder.last_activity,
        action: params.action,
        at: params.at,
        details: params.details,
    });

    return prisma.fileFolder.update({
        where: { id: params.filefolderId },
        data: {
            last_activity: update.last_activity,
            lastActivityOn: update.lastActivityOn,
            totalActivity: update.totalActivity,
        },
    });
}

function normalizeFolderPath(value?: string | null) {
    const cleaned = (value || '').trim().replace(/^\/+/, '');
    if (!cleaned) return '';

    const normalized = path.posix.normalize(cleaned);
    if (normalized === '.' || normalized === '..' || normalized.startsWith('../') || path.posix.isAbsolute(normalized)) {
        throw new Error('Invalid folder path');
    }
    return normalized;
}

export async function upsertFolderActivity(params: {
    owner: string;
    mode: FileFolderMode;
    folderType: 'drive' | 'assets' | 'signed';
    folderPath: string;
    action?: Extract<FileFolderActivityAction, 'folder_opened' | 'changed'>;
}) {
    const normalizedFolderPath = normalizeFolderPath(params.folderPath);
    const folderName = normalizedFolderPath.split('/').filter(Boolean).pop() || params.folderType;
    const storagePath = path.posix.join(params.owner, params.folderType, normalizedFolderPath);
    const existingFolder = await prisma.fileFolder.findFirst({
        where: { owner: params.owner, path: storagePath },
        orderBy: { created_on: 'desc' },
    });

    const action = params.action || 'folder_opened';

    if (!existingFolder) {
        const createdAt = new Date();
        const activity = buildFileFolderActivityUpdate({
            action,
            at: createdAt,
            details: {
                mode: params.mode,
                folder_type: params.folderType,
                path: normalizedFolderPath,
            },
        });

        return prisma.fileFolder.create({
            data: {
                name: folderName,
                path: storagePath,
                type: fileFolderStoredAsForMode(params.mode, params.folderType),
                owner: params.owner,
                stored_as: fileFolderStoredAsForMode(params.mode, params.folderType),
                size: BigInt(0),
                last_activity: activity.last_activity,
                lastActivityOn: activity.lastActivityOn,
                totalActivity: activity.totalActivity,
                details: {
                    mode: params.mode,
                    folder_type: params.folderType,
                    mimeType: 'inode/directory',
                    status: 'VERIFIED',
                },
            },
        });
    }

    const update = buildFileFolderActivityUpdate({
        currentActivity: existingFolder.last_activity,
        action,
        details: {
            mode: params.mode,
            folder_type: params.folderType,
            path: normalizedFolderPath,
        },
    });

    return prisma.fileFolder.update({
        where: { id: existingFolder.id },
        data: {
            last_activity: update.last_activity,
            lastActivityOn: update.lastActivityOn,
            totalActivity: update.totalActivity,
        },
    });
}

export async function createFileFolderLog(params: {
    filefolderId: string;
    action: string;
    details: Prisma.InputJsonValue;
    doneBy: string;
}) {
    return prisma.fileFolderLog.create({
        data: {
            filefolder_id: params.filefolderId,
            action: params.action,
            details: params.details,
            done_by: params.doneBy,
        },
    });
}

export async function recordFileFolderUpload(params: {
    name: string;
    path: string;
    mimeType?: string | null;
    owner: string;
    size?: number | bigint | null;
    mode: FileFolderMode;
    storedAs?: FileFolderStoredAs;
    details: Prisma.InputJsonObject;
    doneBy?: string;
}) {
    const size = typeof params.size === 'bigint'
        ? params.size
        : BigInt(params.size ?? 0);
    const uploadedAt = new Date();
    const uploadActivity = buildFileFolderActivityUpdate({
        action: 'uploaded',
        at: uploadedAt,
        details: {
            mode: params.mode,
            path: params.path,
        },
    });
    const storedAs = params.storedAs ?? fileFolderStoredAsForMode(params.mode);

    return prisma.fileFolder.create({
        data: {
            name: params.name,
            path: params.path,
            type: storedAs,
            owner: params.owner,
            stored_as: storedAs,
            size,
            details: {
                ...params.details,
                mode: params.mode,
                mimeType: params.mimeType ?? 'application/octet-stream',
            },
            last_activity: uploadActivity.last_activity,
            lastActivityOn: uploadActivity.lastActivityOn,
            totalActivity: uploadActivity.totalActivity,
            logs: {
                create: {
                    action: 'upload',
                    details: {
                        ...params.details,
                        mode: params.mode,
                    },
                    done_by: params.doneBy ?? params.owner,
                },
            },
        },
    });
}
