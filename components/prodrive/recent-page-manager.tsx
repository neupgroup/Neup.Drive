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

The preloaded recent drive items to show in the recent page.

::returns
::datatype JSX.Element

The interactive recent-items manager.

::public end

::private

Folder items carry their internal drive path in `description` so this client
wrapper can navigate to the correct `?path=` destination while leaving file
rows to the shared viewer flow.

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
}: {
  files: FileOrFolder[];
}) {
  const router = useRouter();
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
      title="Recent"
      subtitle="Recently modified files and folders across your drive."
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
          const folderPath = item.description?.trim();
          if (!folderPath) return;
          router.push(`/?path=${encodeURIComponent(folderPath)}`);
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
