'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { FileManager } from '@/components/prodrive/file-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/core/hooks/use-toast';
import { handleClientError } from '@/core/lib/error-client';
import { PlaceHolderImages } from '@/core/lib/placeholder-images';
import { storageTierFromWebdiskType, type StorageTier } from '@/core/lib/storage-tiers';
import type { FileOrFolder } from '@/core/lib/types';

interface WebDiskRecord {
  id: string;
  filefolder_id?: string | null;
  filename: string;
  path: string;
  cdn_path?: string;
  mimeType: string;
  uploaded_by: string;
  uploaded_on: string;
  size?: number;
  storageTier?: StorageTier;
}

interface WebDiskFolder {
  id: string;
  name: string;
  type: string;
  path: string;
  count: number;
}

interface WebDiskFolderRecord {
  id: string;
  name: string;
  path: string;
  folder_type: string;
  type: string;
}

const WEBDISK_TYPES = [
  { id: 'assets', label: 'Assets' },
  { id: 'signed', label: 'Signed' },
];
const WEBDISK_SKELETON_ROWS = 8;

const MEMBER_AVATAR = PlaceHolderImages.find((image) => image.id === 'avatar1') || PlaceHolderImages[0];

function getAccountRelativePathFromStoragePath(storagePath: string) {
  const cleanPath = storagePath.replace(/^\/+/, '');
  const [, ...rest] = cleanPath.split('/');
  return rest.join('/');
}

function getAccountRelativePath(file: WebDiskRecord) {
  return getAccountRelativePathFromStoragePath(file.cdn_path || file.id || '');
}

function getTypedRelativePath(file: WebDiskRecord) {
  const relativePath = getAccountRelativePath(file);
  return getTypedRelativePathFromStoragePath(relativePath);
}

function getTypedRelativePathFromStoragePath(relativePath: string) {
  const [rawType, ...rest] = relativePath.split('/');
  const maybeType = rawType?.toLowerCase() || '';
  if (WEBDISK_TYPES.some((type) => type.id === maybeType)) {
    return {
      type: maybeType,
      path: rest.join('/'),
    };
  }

  return {
    type: 'assets',
    path: relativePath,
  };
}

function dirname(value: string) {
  const index = value.lastIndexOf('/');
  return index === -1 ? '' : value.slice(0, index);
}

function childPath(parentPath: string, childName: string) {
  return parentPath ? `${parentPath}/${childName}` : childName;
}

function webdiskUploadHref(type: string | null, folderPath: string) {
  const params = new URLSearchParams();
  params.set('type', type || 'assets');
  params.set('saveto', 'webdisk');
  if (folderPath) params.set('path', folderPath);
  return `/upload?${params.toString()}`;
}

function buildWebdiskBreadcrumbs(type: string, folderPath: string) {
  const segments = folderPath.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const breadcrumbs: Array<{ label: string; href?: string }> = [
    { label: 'WebDisk', href: '/webdisk?type=assets&path=' },
  ];

  if (type === 'signed') {
    breadcrumbs.push({ label: 'Signed', href: '/webdisk?type=signed&path=' });
  }

  let accumulatedPath = '';

  for (const segment of segments) {
    accumulatedPath = accumulatedPath ? `${accumulatedPath}/${segment}` : segment;
    breadcrumbs.push({
      label: segment,
      href: `/webdisk?type=${encodeURIComponent(type)}&path=${encodeURIComponent(accumulatedPath)}`,
    });
  }

  if (breadcrumbs.length > 0) {
    breadcrumbs[breadcrumbs.length - 1] = {
      ...breadcrumbs[breadcrumbs.length - 1],
      href: undefined,
    };
  }

  return breadcrumbs;
}

function formatBytes(size: number | null | undefined) {
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

function formatLastModified(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Unknown';

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

function fileTypeFromMime(mimeType: string, filename: string): FileOrFolder['type'] {
  if (mimeType.startsWith('image/')) {
    return filename.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
  }
  if (mimeType.startsWith('video/')) return 'mp4';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
  return 'unknown';
}

function WebdiskSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-headline tracking-tight">WebDisk</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse CDN-backed web files and manage public and signed storage.
        </p>
      </div>

      <div className="space-y-0">
        {Array.from({ length: WEBDISK_SKELETON_ROWS }).map((_, index) => (
          <div
            key={`webdisk-loading-row-${index}`}
            className={`border border-border/70 bg-background px-4 py-3 ${
              index === 0 ? 'rounded-t-3xl' : 'border-t-0'
            } ${index === WEBDISK_SKELETON_ROWS - 1 ? 'rounded-b-3xl' : ''}`}
          >
            <div className="flex min-h-20 items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-48 max-w-full" />
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebdiskContent() {
  const [files, setFiles] = React.useState<WebDiskRecord[]>([]);
  const [folderRecords, setFolderRecords] = React.useState<WebDiskFolderRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [operatingPath, setOperatingPath] = React.useState<string | null>(null);
  const [sortMode, setSortMode] = React.useState('name-asc');
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTypeParam = searchParams.get('type');
  const selectedType = WEBDISK_TYPES.some((type) => type.id === selectedTypeParam) ? selectedTypeParam || 'assets' : 'assets';
  const selectedPath = (searchParams.get('path') || '').replace(/^\/+/, '');

  const fetchFiles = React.useCallback(async () => {
    try {
      setLoading(true);
      const [fileResponse, assetsFolderResponse, signedFolderResponse] = await Promise.all([
        fetch('/bridge/api.v1/webdisk/files'),
        fetch('/bridge/api.v1/list?type=assets&limit=500'),
        fetch('/bridge/api.v1/list?type=signed&limit=500'),
      ]);

      const failedResponse = [fileResponse, assetsFolderResponse, signedFolderResponse].find((response) => !response.ok);
      if (failedResponse) {
        let responseData: unknown = null;
        try {
          responseData = await failedResponse.json();
        } catch {
          responseData = await failedResponse.text().catch(() => '');
        }
        const error = new Error('Failed to fetch files') as Error & {
          status?: number;
          response?: unknown;
        };
        error.status = failedResponse.status;
        error.response = responseData;
        throw error;
      }

      const [fileData, assetsFolderData, signedFolderData] = await Promise.all([
        fileResponse.json(),
        assetsFolderResponse.json(),
        signedFolderResponse.json(),
      ]);

      setFiles(fileData);
      setFolderRecords([
        ...((assetsFolderData?.files || []).filter((item: WebDiskFolderRecord) => item.type === 'folder')),
        ...((signedFolderData?.files || []).filter((item: WebDiskFolderRecord) => item.type === 'folder')),
      ]);
      setError(null);
    } catch (err) {
      const message = await handleClientError(err, 'WebDiskPage', {
        status: typeof err === 'object' && err && 'status' in err ? (err as { status?: number }).status : undefined,
        response: typeof err === 'object' && err && 'response' in err ? (err as { response?: unknown }).response : undefined,
      });
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchFiles();
  }, [fetchFiles]);

  const navigateTo = React.useCallback((type: string, nextPath = '') => {
    const params = new URLSearchParams();
    params.set('type', type);
    params.set('path', nextPath);
    router.push(`/webdisk?${params.toString()}`);
  }, [router]);

  const filesByType = React.useMemo(() => files.map((file) => ({
    file,
    location: getTypedRelativePath(file),
  })).map((item) => ({
    ...item,
    file: {
      ...item.file,
      storageTier: storageTierFromWebdiskType(item.location.type),
    },
  })), [files]);

  const currentItems = React.useMemo(() => {
    const folders = new Map<string, WebDiskFolder>();
    const currentFiles: WebDiskRecord[] = [];
    const pathPrefix = selectedPath ? `${selectedPath}/` : '';

    for (const folderRecord of folderRecords) {
      const location = getTypedRelativePathFromStoragePath(getAccountRelativePathFromStoragePath(folderRecord.path));
      if (location.type !== selectedType) continue;
      const relativeFolderPath = location.path;

      if (selectedPath && relativeFolderPath !== selectedPath && !relativeFolderPath.startsWith(pathPrefix)) continue;
      const remaining = selectedPath ? relativeFolderPath.slice(pathPrefix.length) : relativeFolderPath;
      const [nextSegment, ...rest] = remaining.split('/');

      if (!nextSegment) continue;
      if (rest.length === 0) {
        const folderPath = childPath(selectedPath, nextSegment);
        folders.set(folderPath, {
          id: folderRecord.id,
          name: folderRecord.name,
          type: location.type,
          path: folderPath,
          count: folders.get(folderPath)?.count || 0,
        });
      } else {
        const nextPath = childPath(selectedPath, nextSegment);
        const folder = folders.get(nextPath);
        folders.set(nextPath, {
          id: folder?.id || `folder:${location.type}:${nextPath || nextSegment}`,
          name: nextSegment,
          type: location.type,
          path: nextPath,
          count: folder?.count || 0,
        });
      }
    }

    for (const item of filesByType) {
      if (item.location.type !== selectedType) continue;
      const relativeFilePath = item.location.path;

      if (selectedPath && relativeFilePath !== selectedPath && !relativeFilePath.startsWith(pathPrefix)) continue;
      const remaining = selectedPath ? relativeFilePath.slice(pathPrefix.length) : relativeFilePath;
      const [nextSegment, ...rest] = remaining.split('/');

      if (!nextSegment) continue;
      if (rest.length === 0) {
        currentFiles.push(item.file);
      } else {
        const nextPath = childPath(selectedPath, nextSegment);
        const folder = folders.get(nextPath);
        folders.set(nextPath, {
          id: folder?.id || `folder:${selectedType}:${nextPath || nextSegment}`,
          name: nextSegment,
          type: selectedType,
          path: nextPath,
          count: (folder?.count || 0) + 1,
        });
      }
    }

    if (selectedType === 'assets' && !selectedPath) {
      const signedCount = filesByType.filter((item) => item.location.type === 'signed').length;
      folders.set('__signed_root__', {
        id: 'folder:signed:',
        name: 'Signed',
        type: 'signed',
        path: '',
        count: signedCount,
      });
    }

    const sortedFolders = Array.from(folders.values()).sort((a, b) => {
      if (a.type === 'signed' && !a.path) return -1;
      if (b.type === 'signed' && !b.path) return 1;
      return a.name.localeCompare(b.name);
    });

    return {
      folders: sortedFolders,
      files: currentFiles.sort((a, b) => a.filename.localeCompare(b.filename)),
    };
  }, [filesByType, folderRecords, selectedPath, selectedType]);

  const managerItems = React.useMemo<FileOrFolder[]>(() => {
    const folderItems = currentItems.folders.map((folder) => ({
      id: folder.id,
      name: folder.name,
      type: 'folder' as const,
      size: `${folder.count} item${folder.count === 1 ? '' : 's'}`,
      storageTier: storageTierFromWebdiskType(folder.type),
      lastModified: `${folder.count} item${folder.count === 1 ? '' : 's'}`,
      members: [],
      description: folder.type === 'signed' && !folder.path ? 'Private webdisk files.' : undefined,
      locationType: folder.type as 'assets' | 'signed',
      navigationPath: folder.path,
    }));

    const fileItems = currentItems.files.map((file) => ({
      id: file.filefolder_id || file.id,
      name: file.filename,
      type: fileTypeFromMime(file.mimeType, file.filename),
      size: formatBytes(file.size),
      storageTier: file.storageTier || storageTierFromWebdiskType(selectedType),
      lastModified: formatLastModified(file.uploaded_on),
      members: MEMBER_AVATAR
        ? [{ id: file.uploaded_by, name: file.uploaded_by, avatar: MEMBER_AVATAR }]
        : [],
    }));

    const combinedItems = [...folderItems, ...fileItems];
    return combinedItems.sort((left, right) => {
      const direction = sortMode === 'name-desc' ? -1 : 1;
      return left.name.localeCompare(right.name) * direction;
    });
  }, [currentItems.files, currentItems.folders, selectedType, sortMode]);

  const recordsById = React.useMemo(() => new Map(
    currentItems.files.map((file) => [file.filefolder_id || file.id, file])
  ), [currentItems.files]);

  const foldersById = React.useMemo(() => new Map(
    currentItems.folders.map((folder) => [folder.id, folder])
  ), [currentItems.folders]);

  const performOperation = React.useCallback(async (
    file: WebDiskRecord,
    action: 'rename' | 'move' | 'delete' | 'restore',
    body: Record<string, string>,
  ) => {
    try {
      setOperatingPath(file.cdn_path || file.id);
      const response = await fetch('/bridge/api.v1/webdisk/files/operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const operationError = new Error('WebDisk operation failed') as Error & { status?: number; response?: unknown };
        operationError.status = response.status;
        operationError.response = data;
        throw operationError;
      }

      await fetchFiles();
      setError(null);
      if (action === 'delete') {
        const trashPath = typeof data?.cdn?.destination_path === 'string'
          ? data.cdn.destination_path as string
          : '';
        const trashToast = toast({
          title: 'File moved to Trash.',
          hideClose: true,
          action: trashPath ? (
            <ToastAction
              altText={`Undo deleting ${file.filename}`}
              onClick={() => {
                trashToast.dismiss();
                void performOperation({
                  ...file,
                  cdn_path: trashPath,
                }, 'restore', {
                  action: 'restore',
                  cdn_path: trashPath,
                  type: selectedType,
                });
              }}
            >
              Undo
            </ToastAction>
          ) : undefined,
        });
        window.setTimeout(() => {
          trashToast.dismiss();
        }, 10000);
      } else if (action === 'restore') {
        toast({ title: 'File restored.' });
      } else if (action === 'rename') {
        toast({ title: 'File renamed.' });
      } else if (action === 'move') {
        toast({ title: 'File moved.' });
      }
    } catch (err) {
      const message = await handleClientError(err, 'WebDiskOperation', {
        status: typeof err === 'object' && err && 'status' in err ? (err as { status?: number }).status : undefined,
        response: typeof err === 'object' && err && 'response' in err ? (err as { response?: unknown }).response : undefined,
      });
      setError(message);
    } finally {
      setOperatingPath(null);
    }
  }, [fetchFiles, selectedType]);

  const handleOpenItem = React.useCallback((item: FileOrFolder) => {
    const folder = foldersById.get(item.id);
    if (folder) {
      if (folder.path) {
        void fetch('/bridge/api.v1/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'folder_opened',
            mode: 'webdisk',
            folder_type: folder.type,
            folder_path: folder.path,
          }),
        }).catch(() => undefined);
      }
      navigateTo(folder.type, folder.path);
      return;
    }

    const file = recordsById.get(item.id);
    if (file) {
      router.push(`/viewer/${encodeURIComponent(file.filefolder_id || file.id)}`);
    }
  }, [foldersById, navigateTo, recordsById, router]);

  const handleRenameItem = React.useCallback(async (item: FileOrFolder, newName: string) => {
    const file = recordsById.get(item.id);
    if (!file) return;

    await performOperation(file, 'rename', {
      action: 'rename',
      cdn_path: file.cdn_path || file.id,
      type: selectedType,
      new_name: newName,
    });
  }, [performOperation, recordsById, selectedType]);

  const handleMoveItem = React.useCallback(async (item: FileOrFolder, target: 'drive' | 'assets' | 'signed') => {
    const file = recordsById.get(item.id);
    if (!file || target === 'drive') return;

    await performOperation(file, 'move', {
      action: 'move',
      cdn_path: file.cdn_path || file.id,
      type: selectedType,
      to_type: target,
      to_path: '',
    });
  }, [performOperation, recordsById, selectedType]);

  const handleDeleteItem = React.useCallback(async (item: FileOrFolder) => {
    const file = recordsById.get(item.id);
    if (!file) return;

    await performOperation(file, 'delete', {
      action: 'delete',
      cdn_path: file.cdn_path || file.id,
      type: selectedType,
    });
  }, [performOperation, recordsById, selectedType]);

  const busyIds = operatingPath ? [operatingPath] : [];
  const breadcrumbs = React.useMemo(
    () => buildWebdiskBreadcrumbs(selectedType, selectedPath),
    [selectedPath, selectedType],
  );

  return (
    <div className="space-y-6">
      {loading ? (
        <WebdiskSkeleton />
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-10 text-center">
            <p className="mb-2 font-semibold text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchFiles()}
              className="hover:bg-blue-500/8 hover:text-blue-700 active:bg-blue-500/8"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={busyIds.length > 0 ? 'pointer-events-none opacity-70' : ''}>
          <FileManager
            initialFiles={managerItems}
            title="WebDisk"
            subtitle="Browse CDN-backed web files and manage public and signed storage."
            breadcrumbs={breadcrumbs}
            emptyMessage="This WebDisk location is empty."
            uploadActionHref={webdiskUploadHref(selectedType, selectedPath)}
            uploadActionDescription="Upload a file to this WebDisk location."
            sortOptions={[
              { value: 'name-asc', label: 'Name (A to Z)' },
              { value: 'name-desc', label: 'Name (Z to A)' },
            ]}
            selectedSort={sortMode}
            onOpenItem={handleOpenItem}
            onRenameItem={handleRenameItem}
            onMoveItem={handleMoveItem}
            onDeleteItem={handleDeleteItem}
            onCreateFolder={async (name) => {
              const response = await fetch('/bridge/api.v1/folders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  mode: 'webdisk',
                  folder_type: selectedType,
                  internal_path: selectedPath,
                  name,
                }),
              });
              const data = await response.json().catch(() => null);
              if (!response.ok || !data?.success) {
                throw new Error(data?.error || 'Failed to create folder');
              }
              await fetchFiles();
            }}
            onSortChange={setSortMode}
            getMoveTargets={(item) => item.type === 'folder' ? [] : ['assets', 'signed']}
            canManageItem={(item) => item.type !== 'folder'}
          />
        </div>
      )}
    </div>
  );
}

export default function WebdiskPage() {
  return (
    <React.Suspense fallback={null}>
      <WebdiskContent />
    </React.Suspense>
  );
}
