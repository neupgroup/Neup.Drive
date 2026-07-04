/*
::neup.documentation::trash-page-manager
::function TrashPageManager(props)
::title Trash Page Manager
::owner Neup Drive

::public

Renders the trash page with the same file-list presentation used by the recent
page and exposes inline restore actions for trashed items.

::details

When a trash operation is pending, the item keeps its original filename and
shows a rotating status indicator ahead of the name instead of swapping the
label text to a restore message during permanent delete. Multi-selection
context menus expose only bulk restore and bulk permanent delete actions.

::param external props
::datatype object

The preloaded trash items ready for display.

::returns
::datatype JSX.Element

The interactive trash manager UI.

::public end

::end
*/
'use client';

import * as React from 'react';
import { FolderInput, RotateCcw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { FileManager } from '@/components/prodrive/file-manager';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/core/hooks/use-toast';
import type { FileOrFolder } from '@/core/lib/types';

export function TrashPageManager({
  files,
}: {
  files: FileOrFolder[];
}) {
  const router = useRouter();
  const [pendingOperation, setPendingOperation] = React.useState<{
    ids: string[];
    action: 'restore' | 'restore_to' | 'delete_permanently';
  } | null>(null);
  const [sortMode, setSortMode] = React.useState('recent-desc');
  const [restoreToDialogItem, setRestoreToDialogItem] = React.useState<FileOrFolder | null>(null);
  const [restoreDestinationType, setRestoreDestinationType] = React.useState<'drive' | 'assets' | 'signed'>('drive');
  const [restoreDestinationPath, setRestoreDestinationPath] = React.useState('');
  const busyIds = pendingOperation?.ids ?? [];
  const busyId = busyIds[0] ?? null;
  const openOriginalFolder = React.useCallback((item: FileOrFolder) => {
    if (!item.secondaryNavigationPath || !item.locationType) return;

    if (item.locationType === 'drive') {
      router.push(item.secondaryNavigationPath ? `/drive?path=${encodeURIComponent(item.secondaryNavigationPath)}` : '/drive');
      return;
    }

    const params = new URLSearchParams();
    params.set('type', item.locationType);
    params.set('path', item.secondaryNavigationPath);
    router.push(`/webdisk?${params.toString()}`);
  }, [router]);

  const restoreItem = React.useCallback(async (item: FileOrFolder) => {
    if (busyId) return;

    try {
      setPendingOperation({ ids: [item.id], action: 'restore' });

      const response = await fetch('/bridge/api.v1/trash/operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filefolder_id: item.id,
          action: 'restore',
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to restore file');
      }

      toast({ title: 'File restored.' });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Restore failed',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      });
    } finally {
      setPendingOperation(null);
    }
  }, [busyId, router]);

  const deletePermanently = React.useCallback(async (item: FileOrFolder) => {
    if (busyId) return;

    try {
      setPendingOperation({ ids: [item.id], action: 'delete_permanently' });

      const response = await fetch('/bridge/api.v1/trash/operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filefolder_id: item.id,
          action: 'delete_permanently',
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to delete file permanently');
      }

      toast({ title: 'File deleted permanently.' });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      });
    } finally {
      setPendingOperation(null);
    }
  }, [busyId, router]);

  const runBulkTrashOperation = React.useCallback(async (
    items: FileOrFolder[],
    action: 'restore' | 'delete_permanently',
  ) => {
    if (busyId || items.length === 0) return;

    try {
      setPendingOperation({ ids: items.map((item) => item.id), action });

      const results = await Promise.allSettled(items.map(async (item) => {
        const response = await fetch('/bridge/api.v1/trash/operation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filefolder_id: item.id,
            action,
          }),
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.success) {
          throw new Error(data?.error || `Failed to ${action === 'restore' ? 'restore' : 'delete'} file`);
        }
      }));

      const failed = results.filter((result) => result.status === 'rejected');
      if (failed.length > 0) {
        const firstError = failed[0];
        toast({
          variant: 'destructive',
          title: `${failed.length} item${failed.length === 1 ? '' : 's'} failed`,
          description: firstError.status === 'rejected' && firstError.reason instanceof Error
            ? firstError.reason.message
            : 'Something went wrong.',
        });
      }

      const succeeded = results.length - failed.length;
      if (succeeded > 0) {
        toast({
          title: action === 'restore'
            ? `${succeeded} item${succeeded === 1 ? '' : 's'} restored.`
            : `${succeeded} item${succeeded === 1 ? '' : 's'} deleted permanently.`,
        });
        router.refresh();
      }
    } finally {
      setPendingOperation(null);
    }
  }, [busyId, router]);

  const submitRestoreTo = React.useCallback(async () => {
    if (!restoreToDialogItem) return;

    try {
      setPendingOperation({ ids: [restoreToDialogItem.id], action: 'restore_to' });

      const response = await fetch('/bridge/api.v1/trash/operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filefolder_id: restoreToDialogItem.id,
          action: 'restore_to',
          destination_type: restoreDestinationType,
          destination_path: restoreDestinationPath,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to restore file');
      }

      toast({ title: 'File restored.' });
      setRestoreToDialogItem(null);
      setRestoreDestinationPath('');
      setRestoreDestinationType('drive');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Restore failed',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      });
    } finally {
      setPendingOperation(null);
    }
  }, [restoreDestinationPath, restoreDestinationType, restoreToDialogItem, router]);

  const items = React.useMemo(() => files.map((item) => ({
    ...item,
    isPending: busyIds.includes(item.id),
    secondaryActionLabel: busyIds.includes(item.id) && pendingOperation?.action !== 'delete_permanently' ? 'Restoring...' : 'Restore',
  })).sort((left, right) => {
    if (sortMode === 'name-asc') return left.name.localeCompare(right.name);
    if (sortMode === 'name-desc') return right.name.localeCompare(left.name);

    const leftValue = left.lastModified;
    const rightValue = right.lastModified;
    const parseRecent = (value: string) => {
      const match = value.match(/^(\d+)([mhd])\s+ago$/);
      if (!match) return 0;
      const amount = Number.parseInt(match[1], 10);
      if (match[2] === 'm') return amount;
      if (match[2] === 'h') return amount * 60;
      return amount * 1440;
    };

    const diff = parseRecent(leftValue) - parseRecent(rightValue);
    return sortMode === 'recent-asc' ? diff * -1 : diff;
  }), [busyIds, files, pendingOperation, sortMode]);

  return (
    <>
      <FileManager
        initialFiles={items}
        title="Trash"
        subtitle="Items stay here for 30 days before permanent deletion."
        emptyMessage="Your trash is empty."
        sortOptions={[
          { value: 'recent-desc', label: 'Recently trashed' },
          { value: 'recent-asc', label: 'Least recently trashed' },
          { value: 'name-asc', label: 'Name (A to Z)' },
          { value: 'name-desc', label: 'Name (Z to A)' },
        ]}
        selectedSort={sortMode}
        onOpenItem={() => undefined}
        onSecondaryAction={restoreItem}
        onSecondaryNavigation={openOriginalFolder}
        onSortChange={setSortMode}
        canManageItem={() => false}
        getSelectionContextMenuSections={(selectedItems) => [
          {
            actions: [
              {
                icon: RotateCcw,
                label: 'Restore',
                onClick: () => {
                  void runBulkTrashOperation(selectedItems, 'restore');
                },
                disabled: busyIds.length > 0,
              },
              {
                icon: Trash2,
                label: 'Delete permanently',
                onClick: () => {
                  void runBulkTrashOperation(selectedItems, 'delete_permanently');
                },
                disabled: busyIds.length > 0,
                className: 'text-destructive focus:bg-destructive focus:text-destructive-foreground',
              },
            ],
          },
        ]}
        getItemContextMenuSections={(item) => [
          {
            actions: [
              {
                icon: RotateCcw,
                label: busyIds.includes(item.id) && pendingOperation?.action !== 'delete_permanently' ? 'Restoring...' : 'Restore',
                onClick: () => {
                  void restoreItem(item);
                },
                disabled: busyIds.length > 0,
              },
            ],
          },
          {
            title: 'Restore to',
            actions: [
              {
                icon: FolderInput,
                label: 'Choose destination',
                onClick: () => {
                  setRestoreToDialogItem(item);
                  setRestoreDestinationType(item.locationType === 'signed' ? 'signed' : item.locationType === 'assets' ? 'assets' : 'drive');
                  setRestoreDestinationPath(item.secondaryNavigationPath || '');
                },
                disabled: busyIds.length > 0,
              },
            ],
          },
          {
            actions: [
              {
                icon: Trash2,
                label: busyIds.includes(item.id) && pendingOperation?.action === 'delete_permanently' ? 'Deleting...' : 'Delete permanently',
                onClick: () => {
                  void deletePermanently(item);
                },
                disabled: busyIds.length > 0,
                className: 'text-destructive focus:bg-destructive focus:text-destructive-foreground',
              },
            ],
          },
        ]}
      />

      <Dialog open={restoreToDialogItem !== null} onOpenChange={(open) => !open && setRestoreToDialogItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Restore To</DialogTitle>
            <DialogDescription>
              Choose where this trashed item should be restored.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restore-destination-type">Destination</Label>
              <Select
                value={restoreDestinationType}
                onValueChange={(value) => setRestoreDestinationType(value as 'drive' | 'assets' | 'signed')}
              >
                <SelectTrigger id="restore-destination-type">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="drive">Drive</SelectItem>
                  <SelectItem value="assets">Webdisk</SelectItem>
                  <SelectItem value="signed">Webdisk Signed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="restore-destination-path">Folder path</Label>
              <Input
                id="restore-destination-path"
                value={restoreDestinationPath}
                onChange={(event) => setRestoreDestinationPath(event.target.value)}
                placeholder="Optional folder path"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreToDialogItem(null)}>
              Cancel
            </Button>
            <Button onClick={() => void submitRestoreTo()}>
              Restore
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
