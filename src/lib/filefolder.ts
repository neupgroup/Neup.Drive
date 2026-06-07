import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export type FileFolderMode = 'drive' | 'webdisk';
export type WebdiskStoredType = 'assets' | 'private' | 'signed';
export type FileFolderStoredAs =
    | 'webfile'
    | 'webfile_signed'
    | 'webfile_private'
    | 'drivefile';

const WEBDISK_STORED_TYPES = new Set<WebdiskStoredType>(['assets', 'private', 'signed']);

export function parseFileFolderMode(mode: string | null): FileFolderMode {
    if (mode === 'webdisk' || mode === 'drive') return mode;
    return 'drive';
}

export function fileFolderTypeFromMime(mimeType?: string | null): string {
    if (!mimeType) return 'file:unknown';

    const [category, subtype] = mimeType.split('/');
    if (category === 'image' && subtype) return `file:${subtype}`;
    if (subtype) return `file:${subtype}`;
    return 'file:unknown';
}

export function normalizeWebdiskStoredType(value?: string | null): WebdiskStoredType {
    return WEBDISK_STORED_TYPES.has(value as WebdiskStoredType) ? value as WebdiskStoredType : 'assets';
}

export function webdiskStoredAs(folderType?: string | null): FileFolderStoredAs {
    const type = normalizeWebdiskStoredType(folderType);
    if (type === 'signed') return 'webfile_signed';
    if (type === 'private') return 'webfile_private';
    return 'webfile';
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

    return prisma.fileFolder.create({
        data: {
            name: params.name,
            path: params.path,
            type: fileFolderTypeFromMime(params.mimeType),
            owner: params.owner,
            stored_as: params.storedAs ?? (params.mode === 'drive' ? 'drivefile' : webdiskStoredAs()),
            size,
            details: {
                ...params.details,
                mode: params.mode,
                mimeType: params.mimeType ?? 'application/octet-stream',
            },
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
