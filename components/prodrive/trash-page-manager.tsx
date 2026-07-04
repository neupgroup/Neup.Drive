/*
::neup.documentation::trash-page-manager
::function TrashPageManager(props)
::title Trash Page Manager
::owner Neup Drive

::public

Renders the trash page with the same file-list presentation used by the recent
page and exposes inline restore actions for trashed items.

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
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [sortMode, setSortMode] = React.useState('recent-desc');
  const [restoreToDialogItem, setRestoreToDialogItem] = React.useState<FileOrFolder | null>(null);
  const [restoreDestinationType, setRestoreDestinationType] = React.useState<'drive' | 'assets' | 'signed'>('drive');
  const [restoreDestinationPath, setRestoreDestinationPath] = React.useState('');
  const openOriginalFolder = React.useCallback((item: FileOrFolder) => {
    if (!item.secondaryNavigationPath || !item.locationType) return;

    if (item.locationType === 'drive') {
      router.push(item.secondaryNavigationPath ? `/?path=${encodeURIComponent(item.secondaryNavigationPath)}` : '/');
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
      setBusyId(item.id);

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
      setBusyId(null);
    }
  }, [busyId, router]);

  const deletePermanently = React.useCallback(async (item: FileOrFolder) => {
    if (busyId) return;

    try {
      setBusyId(item.id);

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
      setBusyId(null);
    }
  }, [busyId, router]);

  const submitRestoreTo = React.useCallback(async () => {
    if (!restoreToDialogItem) return;

    try {
      setBusyId(restoreToDialogItem.id);

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
      setBusyId(null);
    }
  }, [restoreDestinationPath, restoreDestinationType, restoreToDialogItem, router]);

  const items = React.useMemo(() => files.map((item) => ({
    ...item,
    secondaryActionLabel: busyId === item.id ? 'Restoring...' : 'Restore',
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
  }), [busyId, files, sortMode]);

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
        getItemContextMenuSections={(item) => [
          {
            actions: [
              {
                icon: RotateCcw,
                label: busyId === item.id ? 'Restoring...' : 'Restore',
                onClick: () => {
                  void restoreItem(item);
                },
                disabled: busyId === item.id,
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
                disabled: busyId === item.id,
              },
            ],
          },
          {
            actions: [
              {
                icon: Trash2,
                label: busyId === item.id ? 'Deleting...' : 'Delete permanently',
                onClick: () => {
                  void deletePermanently(item);
                },
                disabled: busyId === item.id,
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
