import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export type FileFolderMode = 'drive' | 'webdisk';

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
