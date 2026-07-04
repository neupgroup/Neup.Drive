/*
::neup.documentation::drive-page-manager
::function DrivePageManager(props)
::title Drive Page Manager
::owner Neup Drive

::public

Renders the shared drive file manager with folder-aware breadcrumbs and
navigation for the dedicated `/drive` route.

::param external props
::datatype object

The current folder path and preloaded drive file items for the main drive
browser.

::returns
::datatype JSX.Element

The drive manager UI for the root drive page.

::public end

::private

Folder rows are synthetic UI items derived from `filefolder.path`. This client
wrapper converts folder clicks into `?path=` navigation and keeps the upload
action scoped to the current drive folder.

::private end

::end
*/
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FileManager } from '@/components/prodrive/file-manager';
import type { FileOrFolder } from '@/core/lib/types';

function buildDriveUploadHref(currentPath: string) {
  const params = new URLSearchParams();
  if (currentPath) params.set('path', currentPath);
  const query = params.toString();
  return query ? `/upload?${query}` : '/upload';
}

function buildDriveBreadcrumbs(currentPath: string) {
  const segments = currentPath.split('/').filter(Boolean);
  if (segments.length === 0) return [];

  const breadcrumbs: Array<{ label: string; href?: string }> = [{ label: 'Drive', href: '/drive' }];

  let accumulatedPath = '';
  for (const segment of segments) {
    accumulatedPath = accumulatedPath ? `${accumulatedPath}/${segment}` : segment;
    breadcrumbs.push({
      label: segment,
      href: `/drive?path=${encodeURIComponent(accumulatedPath)}`,
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

export function DrivePageManager({
  currentPath,
  files,
}: {
  currentPath: string;
  files: FileOrFolder[];
}) {
  const router = useRouter();
  const trackFolderOpen = React.useCallback((folderPath: string) => {
    void fetch('/bridge/api.v1/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'folder_opened',
        mode: 'drive',
        folder_type: 'drive',
        folder_path: folderPath,
      }),
    }).catch(() => undefined);
  }, []);
  const [sortMode, setSortMode] = React.useState('name-asc');
  const breadcrumbs = React.useMemo(() => buildDriveBreadcrumbs(currentPath), [currentPath]);
  const uploadActionHref = React.useMemo(() => buildDriveUploadHref(currentPath), [currentPath]);
  const sortedFiles = React.useMemo(() => [...files].sort((left, right) => {
    const direction = sortMode === 'name-desc' ? -1 : 1;
    return left.name.localeCompare(right.name) * direction;
  }), [files, sortMode]);

  return (
    <FileManager
      initialFiles={sortedFiles}
      subtitle="Browse your uploaded files and folders."
      breadcrumbs={breadcrumbs}
      sortOptions={[
        { value: 'name-asc', label: 'Name (A to Z)' },
        { value: 'name-desc', label: 'Name (Z to A)' },
      ]}
      selectedSort={sortMode}
      uploadActionHref={uploadActionHref}
      uploadActionDescription="Upload a file to your drive."
      onOpenItem={(item) => {
        if (item.type !== 'folder') return;
        const nextPath = item.navigationPath || (item.id.startsWith('folder:') ? item.id.slice('folder:'.length) : item.name);
        trackFolderOpen(nextPath);
        router.push(`/drive?path=${encodeURIComponent(nextPath)}`);
      }}
      onCreateFolder={async (name) => {
        const response = await fetch('/bridge/api.v1/folders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'drive',
            folder_type: 'drive',
            internal_path: currentPath,
            name,
          }),
        });
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success) {
          throw new Error(data?.error || 'Failed to create folder');
        }
        router.refresh();
      }}
      onSortChange={setSortMode}
      getMoveTargets={(item) => item.type === 'folder' ? [] : ['drive', 'assets', 'signed']}
      canManageItem={(item) => item.type !== 'folder'}
    />
  );
}
