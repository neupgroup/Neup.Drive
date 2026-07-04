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
import { isActiveFileDetails, normalizeInternalPath } from '@/core/lib/bridge-api';
import { PlaceHolderImages } from '@/core/lib/placeholder-images';
import { storageTierFromStoredAs } from '@/core/lib/storage-tiers';
import type { FileOrFolder } from '@/core/lib/types';

export const DEFAULT_DRIVE_OWNER = process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';
export const DEFAULT_WEBDISK_OWNER = process.env.WEBDISK_ACCOUNT_ID || process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';

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

function formatRecentActivity(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 60) return `${Math.max(1, minutes)}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${Math.max(1, days)}d ago`;
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

function getDriveRelativePath(storagePath: string, owner: string) {
  const cleanPath = storagePath.replace(/^\/+/, '');
  const ownerPrefix = `${owner}/`;
  const ownerRelativePath = cleanPath.startsWith(ownerPrefix) ? cleanPath.slice(ownerPrefix.length) : cleanPath;
  const drivePrefix = 'drive/';

  if (ownerRelativePath === 'drive') return '';
  if (ownerRelativePath.startsWith(drivePrefix)) return ownerRelativePath.slice(drivePrefix.length);
  return ownerRelativePath;
}

function getRelativePathForStoredAs(storagePath: string, owner: string, storedAs: string) {
  const cleanPath = storagePath.replace(/^\/+/, '');
  const ownerPrefix = `${owner}/`;
  const ownerRelativePath = cleanPath.startsWith(ownerPrefix) ? cleanPath.slice(ownerPrefix.length) : cleanPath;

  if (storedAs === 'drivefile') {
    return getDriveRelativePath(storagePath, owner);
  }

  if (ownerRelativePath === 'assets' || ownerRelativePath === 'signed') return '';
  if (ownerRelativePath.startsWith('assets/')) return ownerRelativePath.slice('assets/'.length);
  if (ownerRelativePath.startsWith('signed/')) return ownerRelativePath.slice('signed/'.length);
  return ownerRelativePath;
}

function getLocationTypeFromRow(row: {
  stored_as: string;
  details: Prisma.JsonValue;
}): FileOrFolder['locationType'] {
  if (row.stored_as === 'drivefile') return 'drive';
  const details = getDetails(row.details);
  return typeof details.folder_type === 'string' && details.folder_type === 'signed' ? 'signed' : 'assets';
}

function locationLabel(locationType: FileOrFolder['locationType']) {
  if (locationType === 'signed') return 'Webdisk Signed';
  if (locationType === 'assets') return 'Webdisk';
  return 'Drive';
}

/*
::neup.documentation::recent-drive-files-helper
::function getRecentDriveFiles(options)
::title Get Recent Drive Files
::owner Neup Drive

::public

Returns the most recent active Drive and WebDisk items for the configured owner.

::param external options
::datatype object

Owner and result-limit options for the recent activity lookup.

::returns
::datatype Promise<FileOrFolder[]>

The mapped recent items ready for the homepage recent-items UI.

::public end

::private

Rows carry their surface and internal navigation path so the recent page can
route into Drive, WebDisk, or Signed folders while rendering a fixed
`Last opened ... From ...` message.

::private end

::end
*/
export async function getRecentDriveFiles({
  owner = DEFAULT_DRIVE_OWNER,
  webdiskOwner = DEFAULT_WEBDISK_OWNER,
  take = 100,
}: {
  owner?: string;
  webdiskOwner?: string;
  take?: number;
} = {}): Promise<FileOrFolder[]> {
  const rows = await prisma.fileFolder.findMany({
    where: {
      owner: {
        in: Array.from(new Set([owner, webdiskOwner])),
      },
      stored_as: {
        in: ['drivefile', 'webfile', 'webfile_signed'],
      },
    },
    orderBy: [
      { lastActivityOn: 'desc' },
      { updated_on: 'desc' },
    ],
    take,
  });

  return rows
    .filter((row) => isActiveFileDetails(row.details))
    .map((row) => {
      const details = getDetails(row.details);
      const ownerName = typeof details.uploaded_by === 'string' ? details.uploaded_by : row.owner;
      const locationType = getLocationTypeFromRow(row);
      const relativePath = getRelativePathForStoredAs(row.path, row.owner, row.stored_as);
      const activityAt = row.lastActivityOn || row.updated_on;
      const activityMessage = `Last opened ${formatRecentActivity(activityAt)} From ${locationLabel(locationType)}`;

      return {
        id: row.id,
        name: row.name,
        type: fileTypeFromRecord(row.type, row.name),
        size: formatBytes(row.size),
        storageTier: storageTierFromStoredAs(row.stored_as),
        lastModified: formatRecentActivity(activityAt),
        members: MEMBER_AVATAR
          ? [{ id: row.owner, name: ownerName, avatar: MEMBER_AVATAR }]
          : [],
        description: activityMessage,
        locationType,
        navigationPath: row.type === 'folder' ? relativePath : undefined,
      };
    });
}

export async function getDriveFiles({
  owner = DEFAULT_DRIVE_OWNER,
  query,
  internalPath,
  includeFolders = true,
  take = 100,
}: {
  owner?: string;
  query?: string;
  internalPath?: string;
  includeFolders?: boolean;
  take?: number;
} = {}): Promise<FileOrFolder[]> {
  const trimmedQuery = query?.trim();
  const currentPath = normalizeInternalPath(internalPath);

  const rows = await prisma.fileFolder.findMany({
    where: {
      owner,
      stored_as: 'drivefile',
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

  const activeRows = rows.filter((row) => isActiveFileDetails(row.details));
  const folders = new Map<string, number>();
  const explicitFolderPaths = new Set<string>();
  const files: FileOrFolder[] = [];
  const pathPrefix = currentPath ? `${currentPath}/` : '';

  for (const row of activeRows) {
    const relativePath = getDriveRelativePath(row.path, row.owner);
    if (currentPath && relativePath !== currentPath && !relativePath.startsWith(pathPrefix)) continue;

    const remainingPath = currentPath ? relativePath.slice(pathPrefix.length) : relativePath;
    if (!remainingPath) continue;

    const [nextSegment, ...rest] = remainingPath.split('/');
    if (!nextSegment) continue;

    if (rest.length > 0) {
      if (!includeFolders) continue;
      const folderPath = currentPath ? `${currentPath}/${nextSegment}` : nextSegment;
      folders.set(folderPath, (folders.get(folderPath) || 0) + 1);
      continue;
    }

    if (row.type === 'folder') {
      if (!includeFolders) continue;
      explicitFolderPaths.add(relativePath);
    }

    const details = getDetails(row.details);
    const ownerName = typeof details.uploaded_by === 'string' ? details.uploaded_by : row.owner;

    files.push({
      id: row.id,
      name: row.name,
      type: fileTypeFromRecord(row.type, row.name),
      size: formatBytes(row.size),
      storageTier: storageTierFromStoredAs(row.stored_as),
      lastModified: formatLastModified(row.updated_on),
      members: MEMBER_AVATAR
        ? [{ id: row.owner, name: ownerName, avatar: MEMBER_AVATAR }]
        : [],
    });
  }

  const folderItems: FileOrFolder[] = includeFolders ? Array.from(folders.entries())
    .filter(([folderPath]) => !explicitFolderPaths.has(folderPath))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([folderPath, count]) => ({
      id: `folder:${folderPath}`,
      name: folderPath.split('/').pop() || folderPath,
      type: 'folder',
      size: `${count} item${count === 1 ? '' : 's'}`,
      storageTier: 'cold',
      lastModified: `${count} item${count === 1 ? '' : 's'}`,
      members: [],
      locationType: 'drive' as const,
      navigationPath: folderPath,
    })) : [];

  return [...folderItems, ...files];
}
