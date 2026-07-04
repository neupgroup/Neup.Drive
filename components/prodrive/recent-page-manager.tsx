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
import { Eye, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FileManager } from '@/components/prodrive/file-manager';
import { toast } from '@/core/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
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
  const deleteItem = React.useCallback(async (item: FileOrFolder, action: 'delete' | 'restore' = 'delete') => {
    const isDriveItem = item.locationType === 'drive';
    const endpoint = isDriveItem
      ? '/bridge/api.v1/drive/files/operation'
      : '/bridge/api.v1/webdisk/files/operation';
    const body = isDriveItem
      ? { filefolder_id: item.id, action }
      : { filefolder_id: item.id, action };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.success) {
      throw new Error(data?.error || 'Failed to update item');
    }

    if (action === 'delete') {
      const trashToast = toast({
        title: item.type === 'folder' ? 'Folder moved to Trash.' : 'File moved to Trash.',
        hideClose: true,
        action: (
          <ToastAction
            altText={`Undo deleting ${item.name}`}
            onClick={() => {
              trashToast.dismiss();
              void deleteItem(item, 'restore');
            }}
          >
            Undo
          </ToastAction>
        ),
      });
      window.setTimeout(() => {
        trashToast.dismiss();
      }, 10000);
    } else {
      toast({ title: item.type === 'folder' ? 'Folder restored.' : 'File restored.' });
    }

    router.refresh();
  }, [router]);
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
      onDeleteItem={(item) => deleteItem(item, 'delete')}
      onSortChange={(value) => {
        setSortMode(value as SortMode);
      }}
      canManageItem={(item) => item.locationType === 'drive' || item.locationType === 'assets' || item.locationType === 'signed'}
      getMoveTargets={(item) => item.type === 'folder' ? [] : ['drive', 'assets', 'signed']}
      getItemContextMenuSections={(item) => {
        if (item.type !== 'folder') return [];
        return [
          {
            actions: [
              {
                icon: Eye,
                label: 'Open',
                onClick: () => {
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
                },
              },
              {
                icon: Trash2,
                label: 'Delete',
                onClick: () => {
                  void deleteItem(item, 'delete');
                },
                className: 'text-destructive focus:bg-destructive focus:text-destructive-foreground',
              },
            ],
          },
        ];
      }}
    />
  );
}
