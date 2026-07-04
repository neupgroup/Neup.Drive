/*
::neup.documentation::recent-page-manager
::function RecentPageManager(props)
::title Recent Page Manager
::owner Neup Drive

::public

Renders the recent-items file manager with recency-aware sorting and folder
navigation back into the main drive surface.

::param external props
::datatype object

The preloaded recent items plus optional heading copy for the current recent
surface.

::returns
::datatype JSX.Element

The interactive recent-items manager.

::public end

::private

Recent rows carry their surface and internal navigation path so this client
wrapper can route folders into Drive or WebDisk while leaving file rows to the
shared viewer flow.

::private end

::end
*/
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FileManager } from '@/components/prodrive/file-manager';
import type { FileOrFolder } from '@/core/lib/types';

type SortMode = 'recent-desc' | 'recent-asc' | 'name-asc' | 'name-desc';

function recencyRank(label: string) {
  const normalized = label.trim().toLowerCase();

  const shorthandMatch = normalized.match(/^(\d+)([mhd])\s+ago$/);
  if (shorthandMatch) {
    const value = Number.parseInt(shorthandMatch[1], 10);
    const unit = shorthandMatch[2];
    if (unit === 'm') return value;
    if (unit === 'h') return value * 60;
    return value * 1440;
  }

  if (normalized === 'just now') return 0;

  const match = normalized.match(/^(\d+)\s+(\w+)/);
  if (!match) return Number.MAX_SAFE_INTEGER;

  const value = Number.parseInt(match[1], 10);
  const unit = match[2];
  const unitMinutes: Record<string, number> = {
    minute: 1,
    minutes: 1,
    hour: 60,
    hours: 60,
    day: 1440,
    days: 1440,
    week: 10080,
    weeks: 10080,
  };

  return value * (unitMinutes[unit] || 525600);
}

export function RecentPageManager({
  files,
  title = 'Recent',
  subtitle = 'Recent activity across Drive, WebDisk, and Signed files.',
  showHeader = true,
}: {
  files: FileOrFolder[];
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}) {
  const router = useRouter();
  const trackFolderOpen = React.useCallback((item: FileOrFolder) => {
    if (item.type !== 'folder' || !item.navigationPath || !item.locationType) return;

    void fetch('/bridge/api.v1/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'folder_opened',
        mode: item.locationType === 'drive' ? 'drive' : 'webdisk',
        folder_type: item.locationType,
        folder_path: item.navigationPath,
      }),
    }).catch(() => undefined);
  }, []);
  const [sortMode, setSortMode] = React.useState<SortMode>('recent-desc');
  const sortedFiles = React.useMemo(() => [...files].sort((left, right) => {
    if (sortMode === 'name-asc') return left.name.localeCompare(right.name);
    if (sortMode === 'name-desc') return right.name.localeCompare(left.name);

    const leftRank = recencyRank(left.lastModified);
    const rightRank = recencyRank(right.lastModified);
    if (leftRank !== rightRank) {
      return sortMode === 'recent-asc' ? rightRank - leftRank : leftRank - rightRank;
    }

    return left.name.localeCompare(right.name);
  }), [files, sortMode]);

  return (
    <FileManager
      initialFiles={sortedFiles}
      title={title}
      subtitle={subtitle}
      showHeader={showHeader}
      emptyMessage="No recent files yet."
      sortOptions={[
        { value: 'recent-desc', label: 'Recently updated' },
        { value: 'recent-asc', label: 'Least recently updated' },
        { value: 'name-asc', label: 'Name (A to Z)' },
        { value: 'name-desc', label: 'Name (Z to A)' },
      ]}
      selectedSort={sortMode}
      uploadActionHref="/upload"
      uploadActionDescription="Upload a file to your drive."
      onOpenItem={(item) => {
        if (item.type === 'folder') {
          if (!item.navigationPath || !item.locationType) return;
          trackFolderOpen(item);

          if (item.locationType === 'drive') {
            router.push(`/drive?path=${encodeURIComponent(item.navigationPath)}`);
            return;
          }

          const params = new URLSearchParams();
          params.set('type', item.locationType);
          params.set('path', item.navigationPath);
          router.push(`/webdisk?${params.toString()}`);
          return;
        }

        router.push(`/viewer/${encodeURIComponent(item.id)}`);
      }}
      onSortChange={(value) => {
        setSortMode(value as SortMode);
      }}
      canManageItem={(item) => item.type !== 'folder'}
    />
  );
}
