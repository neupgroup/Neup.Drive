/*
::neup.documentation::trash-page
::route /trash
::title Trash Page
::owner Neup Drive

::public

Shows trashed Drive and WebDisk items using the same list design as the recent
page, with inline restore actions.

::returns
::datatype Promise<JSX.Element>

The trash page for the configured owner.

::public end

::end
*/
import type { Prisma } from '@prisma/client';
import path from 'node:path';

import { TrashPageManager } from '@/components/prodrive/trash-page-manager';
import { prisma } from '@/core/lib/db';
import type { FileOrFolder } from '@/core/lib/types';

const TRASH_OWNER = process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';

function getDetails(details: Prisma.JsonValue): Prisma.JsonObject {
  return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
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

function formatBytes(size: bigint | number | null | undefined) {
  const bytes = Number(size ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function fileTypeFromRecord(type: string, name: string): FileOrFolder['type'] {
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

function relativePathFromStoragePath(storagePath: string, owner: string, mode: string) {
  const cleanPath = storagePath.replace(/^\/+/, '');
  const ownerPrefix = `${owner}/`;
  const ownerRelativePath = cleanPath.startsWith(ownerPrefix) ? cleanPath.slice(ownerPrefix.length) : cleanPath;

  if (mode === 'drive') {
    if (ownerRelativePath === 'drive') return '';
    if (ownerRelativePath.startsWith('drive/')) return ownerRelativePath.slice('drive/'.length);
    return ownerRelativePath;
  }

  if (ownerRelativePath === mode) return '';
  if (ownerRelativePath.startsWith(`${mode}/`)) return ownerRelativePath.slice(`${mode}/`.length);
  return ownerRelativePath;
}

function getOriginalFolderInfo(previousPath: string, previousMode: string, owner: string) {
  const relativePath = relativePathFromStoragePath(previousPath, owner, previousMode);
  const folderPath = path.posix.dirname(relativePath);

  if (!folderPath || folderPath === '.') {
    return {
      folderLabel: previousMode === 'signed' ? 'Webdisk Signed' : previousMode === 'assets' ? 'Webdisk' : 'Drive',
      folderPath: '',
    };
  }

  return {
    folderLabel: folderPath.split('/').pop() || folderPath,
    folderPath,
  };
}

async function getTrashItems() {
  const rows = await prisma.fileFolder.findMany({
    where: {
      owner: TRASH_OWNER,
      stored_as: 'trash',
    },
    orderBy: { updated_on: 'desc' },
    take: 100,
  });

  return rows.map((row) => {
    const details = getDetails(row.details);
    const previousMode = typeof details.previous_mode === 'string' ? details.previous_mode : 'drive';
    const previousPath = typeof details.previous_path === 'string' ? details.previous_path : '';
    const originalFolder = getOriginalFolderInfo(previousPath, previousMode, row.owner);
    const activityAt = row.lastActivityOn || row.updated_on;
    return {
      id: row.id,
      name: row.name,
      type: fileTypeFromRecord(row.type, row.name),
      size: formatBytes(row.size),
      storageTier: 'cold' as const,
      lastModified: formatRecentActivity(activityAt),
      members: [],
      description: `Trashed ${formatRecentActivity(activityAt)}`,
      locationType: previousMode === 'assets' || previousMode === 'signed' ? previousMode : 'drive',
      navigationPath: row.path,
      secondaryNavigationPrefix: 'From',
      secondaryNavigationLabel: originalFolder.folderLabel,
      secondaryNavigationPath: originalFolder.folderPath,
    } satisfies FileOrFolder;
  });
}

export default async function TrashPage() {
  const items = await getTrashItems();
  return <TrashPageManager files={items} />;
}
