/*
::neup.documentation::drive-page-manager
::function DrivePageManager(props)
::title Drive Page Manager
::owner Neup Drive

::public

Renders the shared drive file manager with folder-aware breadcrumbs and
navigation for the homepage.

::param external props
::datatype object

The current folder path and preloaded drive file items for the homepage.

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

  const breadcrumbs = [{ label: 'Drive', href: '/' }];

  let accumulatedPath = '';
  for (const segment of segments) {
    accumulatedPath = accumulatedPath ? `${accumulatedPath}/${segment}` : segment;
    breadcrumbs.push({
      label: segment,
      href: `/?path=${encodeURIComponent(accumulatedPath)}`,
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
  const breadcrumbs = React.useMemo(() => buildDriveBreadcrumbs(currentPath), [currentPath]);
  const uploadActionHref = React.useMemo(() => buildDriveUploadHref(currentPath), [currentPath]);

  return (
    <FileManager
      initialFiles={files}
      subtitle="Browse your uploaded files and folders."
      breadcrumbs={breadcrumbs}
      uploadActionHref={uploadActionHref}
      uploadActionDescription="Upload a file to your drive."
      onOpenItem={(item) => {
        if (item.type !== 'folder') return;
        const nextPath = item.id.startsWith('folder:') ? item.id.slice('folder:'.length) : item.name;
        router.push(`/?path=${encodeURIComponent(nextPath)}`);
      }}
      getMoveTargets={(item) => item.type === 'folder' ? [] : ['drive', 'assets', 'signed']}
      canManageItem={(item) => item.type !== 'folder'}
    />
  );
}
