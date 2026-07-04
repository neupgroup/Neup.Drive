/*
::neup.documentation::drive-files-helper
::function getDriveFiles(options)
::title Get Drive Files
::owner Neup Drive

::public

Returns mapped drive files for the configured owner, optionally filtered by a
search query.

::param external options
::datatype object

Query and owner options for the drive file lookup.

::returns
::datatype Promise<FileOrFolder[]>

The mapped drive file records ready for UI rendering.

::public end

::private

The helper reads `fileFolder` rows from Prisma, filters inactive entries, and
maps them into the `FileOrFolder` UI shape used by the drive pages.

::private end

::end
*/
import type { Prisma } from '@prisma/client';
import { prisma } from '@/core/lib/db';
import { isActiveFileDetails } from '@/core/lib/bridge-api';
import { PlaceHolderImages } from '@/core/lib/placeholder-images';
import { storageTierFromStoredAs } from '@/core/lib/storage-tiers';
import type { FileOrFolder } from '@/core/lib/types';

export const DEFAULT_DRIVE_OWNER = process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';

const MEMBER_AVATAR = PlaceHolderImages.find((image) => image.id === 'avatar1') || PlaceHolderImages[0];

function getDetails(details: Prisma.JsonValue): Prisma.JsonObject {
  return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
}

function formatBytes(size: bigint | number | null | undefined) {
  const bytes = Number(size ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return null;

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function formatLastModified(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString();
}

function fileTypeFromRecord(type: string, name: string): FileOrFolder['type'] {
  if (type === 'folder') return 'folder';

  const extension = name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (extension === 'jpg' || extension === 'jpeg') return 'jpg';
  if (extension === 'png') return 'png';
  if (extension === 'mp4') return 'mp4';
  if (extension === 'mp3' || extension === 'wav' || extension === 'm4a' || extension === 'aac' || extension === 'ogg') return 'audio';
  if (extension === 'doc' || extension === 'docx') return 'doc';

  if (type.startsWith('file:')) {
    const subtype = type.slice('file:'.length);
    if (subtype === 'pdf') return 'pdf';
    if (subtype === 'jpeg' || subtype === 'jpg') return 'jpg';
    if (subtype === 'png') return 'png';
    if (subtype === 'mp4') return 'mp4';
    if (subtype === 'mpeg' || subtype === 'mp3' || subtype === 'wav' || subtype === 'ogg' || subtype === 'aac') return 'audio';
  }

  return 'unknown';
}

export async function getDriveFiles({
  owner = DEFAULT_DRIVE_OWNER,
  query,
  take = 100,
}: {
  owner?: string;
  query?: string;
  take?: number;
} = {}): Promise<FileOrFolder[]> {
  const trimmedQuery = query?.trim();

  const rows = await prisma.fileFolder.findMany({
    where: {
      owner,
      ...(trimmedQuery
        ? {
            name: {
              contains: trimmedQuery,
              mode: 'insensitive',
            },
          }
        : {}),
    },
    orderBy: { updated_on: 'desc' },
    take,
  });

  return rows.filter((row) => isActiveFileDetails(row.details)).map((row) => {
    const details = getDetails(row.details);
    const ownerName = typeof details.uploaded_by === 'string' ? details.uploaded_by : row.owner;

    return {
      id: row.id,
      name: row.name,
      type: fileTypeFromRecord(row.type, row.name),
      size: formatBytes(row.size),
      storageTier: storageTierFromStoredAs(row.stored_as),
      lastModified: formatLastModified(row.updated_on),
      members: MEMBER_AVATAR
        ? [{ id: row.owner, name: ownerName, avatar: MEMBER_AVATAR }]
        : [],
    };
  });
}
