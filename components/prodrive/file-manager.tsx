'use client';

import * as React from 'react';
import { Copy, Download, Edit3, Eye, FolderInput, Grid3x3, List, MoreHorizontal, Share2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FileOrFolder } from '@/core/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { ToastAction } from '@/components/ui/toast';
import { toast } from '@/core/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileListView } from './file-list-view';
import { FileGridView } from './file-grid-view';

type ViewMode = 'list' | 'grid';
type MoveTarget = 'drive' | 'assets' | 'signed';

type ContextMenuState = {
  item: FileOrFolder;
  x: number;
  y: number;
};

type RenameDialogState = {
  item: FileOrFolder;
  baseName: string;
  extension: string;
  extensionEditable: boolean;
  confirmExtensionChange: boolean;
} | null;

function splitEditableName(name: string) {
  const lastDotIndex = name.lastIndexOf('.');
  if (lastDotIndex <= 0 || lastDotIndex === name.length - 1) {
    return {
      baseName: name,
      extension: '',
    };
  }

  return {
    baseName: name.slice(0, lastDotIndex),
    extension: name.slice(lastDotIndex + 1),
  };
}

export function FileManager({
  initialFiles = [],
  title = 'My Drive',
  subtitle,
  emptyMessage = 'No files yet.',
}: {
  initialFiles?: FileOrFolder[];
  title?: string;
  subtitle?: string;
  emptyMessage?: string;
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [menu, setMenu] = React.useState<ContextMenuState | null>(null);
  const [busyItemId, setBusyItemId] = React.useState<string | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [lastSelectedId, setLastSelectedId] = React.useState<string | null>(null);
  const [renameDialog, setRenameDialog] = React.useState<RenameDialogState>(null);
  const files = initialFiles;

  React.useEffect(() => {
    setSelectedIds((current) => current.filter((id) => files.some((item) => item.id === id)));
    setLastSelectedId((current) => (current && files.some((item) => item.id === current) ? current : null));
  }, [files]);

  React.useEffect(() => {
    if (!menu) return;

    const close = () => setMenu(null);
    window.addEventListener('click', close);
    window.addEventListener('keydown', close);
    window.addEventListener('scroll', close, true);

    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('keydown', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [menu]);

  const openContextMenu = React.useCallback((event: React.MouseEvent, item: FileOrFolder) => {
    event.preventDefault();
    event.stopPropagation();

    const menuWidth = 224;
    const menuHeight = 360;
    const x = Math.min(event.clientX, window.innerWidth - menuWidth - 8);
    const y = Math.min(event.clientY, window.innerHeight - menuHeight - 8);

    setSelectedIds((current) => (current.includes(item.id) ? current : [item.id]));
    setLastSelectedId(item.id);
    setMenu({ item, x: Math.max(8, x), y: Math.max(8, y) });
  }, []);

  const selectItem = React.useCallback((item: FileOrFolder, index: number, event: React.MouseEvent) => {
    setMenu(null);

    if (event.shiftKey) {
      setSelectedIds((current) => {
        const anchorId = lastSelectedId ?? current[current.length - 1] ?? item.id;
        const anchorIndex = files.findIndex((entry) => entry.id === anchorId);
        if (anchorIndex === -1) return [item.id];

        const start = Math.min(anchorIndex, index);
        const end = Math.max(anchorIndex, index);
        return files.slice(start, end + 1).map((entry) => entry.id);
      });
      setLastSelectedId(item.id);
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      setSelectedIds((current) => (
        current.includes(item.id)
          ? current.filter((id) => id !== item.id)
          : [...current, item.id]
      ));
      setLastSelectedId(item.id);
      return;
    }

    setSelectedIds([item.id]);
    setLastSelectedId(item.id);
  }, [files, lastSelectedId]);

  const runOperation = React.useCallback(async (
    item: FileOrFolder,
    body: Record<string, string>
  ) => {
    setBusyItemId(item.id);
    setMenu(null);

    try {
      const response = await fetch('/bridge/api.v1/drive/files/operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filefolder_id: item.id, ...body }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || 'File operation failed');
      }

      if (body.action === 'delete') {
        const trashToast = toast({
          title: 'File moved to Trash.',
          hideClose: true,
          action: (
            <ToastAction
              altText={`Undo deleting ${item.name}`}
              onClick={() => {
                trashToast.dismiss();
                void runOperation(item, { action: 'restore' });
              }}
            >
              Undo
            </ToastAction>
          ),
        });
        window.setTimeout(() => {
          trashToast.dismiss();
        }, 10000);
      } else if (body.action === 'restore') {
        toast({
          title: 'File restored.',
        });
      } else {
        toast({
          title: 'Updated',
          description: `${item.name} was updated.`,
        });
      }
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Operation failed',
        description: error instanceof Error ? error.message : 'Something went wrong.',
      });
    } finally {
      setBusyItemId(null);
    }
  }, [router]);

  const renameItem = React.useCallback((item: FileOrFolder) => {
    const parts = splitEditableName(item.name);
    setMenu(null);
    setRenameDialog({
      item,
      baseName: parts.baseName,
      extension: parts.extension,
      extensionEditable: false,
      confirmExtensionChange: false,
    });
  }, []);

  const submitRename = React.useCallback(() => {
    if (!renameDialog) return;

    const trimmedBaseName = renameDialog.baseName.trim();
    const trimmedExtension = renameDialog.extension.trim().replace(/^\./, '');
    const originalParts = splitEditableName(renameDialog.item.name);
    const newName = trimmedExtension ? `${trimmedBaseName}.${trimmedExtension}` : trimmedBaseName;

    if (!trimmedBaseName) return;
    if (!newName) return;

    if (newName === renameDialog.item.name) {
      setRenameDialog(null);
      return;
    }

    if (trimmedExtension !== originalParts.extension && !renameDialog.confirmExtensionChange) {
      setRenameDialog((current) => current ? { ...current, confirmExtensionChange: true } : current);
      return;
    }

    void runOperation(renameDialog.item, { action: 'rename', new_name: newName });
    setRenameDialog(null);
  }, [renameDialog, runOperation]);

  const moveItem = React.useCallback((item: FileOrFolder, target: MoveTarget) => {
    void runOperation(item, { action: 'move', to_folder_type: target });
  }, [runOperation]);

  const deleteItem = React.useCallback((item: FileOrFolder) => {
    void runOperation(item, { action: 'delete' });
  }, [runOperation]);

  const openItem = React.useCallback((item: FileOrFolder) => {
    setMenu(null);
    router.push(`/viewer/${encodeURIComponent(item.id)}`);
  }, [router]);

  return (
    <div
      className="space-y-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          setSelectedIds([]);
          setMenu(null);
        }
      }}
      onContextMenu={(event) => {
        if (event.target === event.currentTarget) event.preventDefault();
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
          {selectedIds.length > 0 ? (
            <p className="mt-1 text-sm font-medium text-primary">
              {selectedIds.length} item{selectedIds.length === 1 ? '' : 's'} selected
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  aria-label="List View"
                >
                  <List className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid View"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid View</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {files.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center p-6 text-sm text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <FileListView
          data={files}
          selectedIds={selectedIds}
          onItemClick={selectItem}
          onItemContextMenu={openContextMenu}
        />
      ) : (
        <FileGridView
          data={files}
          selectedIds={selectedIds}
          onItemClick={selectItem}
          onItemContextMenu={openContextMenu}
        />
      )}
      {menu ? (
        <div
          role="menu"
          aria-label={`${menu.item.name} actions`}
          className="fixed z-50 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-lg"
          style={{ left: menu.x, top: menu.y }}
          onClick={(event) => event.stopPropagation()}
          onContextMenu={(event) => event.preventDefault()}
        >
          <div className="truncate px-2 py-1.5 text-xs font-medium text-muted-foreground">
            {menu.item.name}
          </div>
          <ContextMenuButton icon={Eye} label="Open" onClick={() => openItem(menu.item)} disabled={busyItemId === menu.item.id} />
          <div className="-mx-1 my-1 h-px bg-muted" />
          <ContextMenuButton icon={Edit3} label="Rename" onClick={() => renameItem(menu.item)} disabled={busyItemId === menu.item.id} />
          <ContextMenuButton icon={FolderInput} label="Move to Drive" onClick={() => moveItem(menu.item, 'drive')} disabled={busyItemId === menu.item.id} />
          <ContextMenuButton icon={FolderInput} label="Move to Assets" onClick={() => moveItem(menu.item, 'assets')} disabled={busyItemId === menu.item.id} />
          <ContextMenuButton icon={FolderInput} label="Move to Signed" onClick={() => moveItem(menu.item, 'signed')} disabled={busyItemId === menu.item.id} />
          <div className="-mx-1 my-1 h-px bg-muted" />
          <ContextMenuButton icon={Share2} label="Share" onClick={() => setMenu(null)} disabled />
          <ContextMenuButton icon={Copy} label="Make a copy" onClick={() => setMenu(null)} disabled />
          <ContextMenuButton icon={Download} label="Download" onClick={() => setMenu(null)} disabled />
          <div className="-mx-1 my-1 h-px bg-muted" />
          <ContextMenuButton
            icon={Trash2}
            label="Delete"
            onClick={() => deleteItem(menu.item)}
            disabled={busyItemId === menu.item.id}
            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
          />
          <ContextMenuButton icon={MoreHorizontal} label="Properties" onClick={() => setMenu(null)} disabled />
        </div>
      ) : null}

      <Dialog open={renameDialog !== null} onOpenChange={(open) => !open && setRenameDialog(null)}>
        <DialogContent className="max-w-md rounded-3xl border-slate-200/80 bg-white/95 p-0 shadow-2xl shadow-slate-900/10 backdrop-blur">
          {renameDialog ? (
            <>
              <DialogHeader className="border-b border-slate-200/70 px-6 py-5">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Edit3 className="h-5 w-5" />
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Rename item
                </DialogTitle>
                <DialogDescription className="text-sm leading-6">
                  Update the name for:
                </DialogDescription>
                <p className="truncate text-sm font-semibold text-slate-900" title={renameDialog.item.name}>
                  {renameDialog.item.name}
                </p>
              </DialogHeader>

              <div className="space-y-4 px-6 py-5">
                <div className="space-y-2">
                  <Label htmlFor="drive-rename-name">New name</Label>
                  <div className="relative">
                    <Input
                      id="drive-rename-name"
                      value={renameDialog.baseName}
                      onChange={(event) => setRenameDialog((current) => (
                        current ? {
                          ...current,
                          baseName: event.target.value,
                          confirmExtensionChange: false,
                        } : current
                      ))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') submitRename();
                      }}
                      placeholder="Enter a new name"
                      className="h-12 rounded-2xl border-slate-200 px-4 pr-28"
                      autoFocus
                    />
                    {renameDialog.extension ? (
                      renameDialog.extensionEditable ? (
                        <Input
                          value={renameDialog.extension}
                          onChange={(event) => setRenameDialog((current) => (
                            current ? {
                              ...current,
                              extension: event.target.value.replace(/^\./, ''),
                              confirmExtensionChange: false,
                            } : current
                          ))}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') submitRename();
                          }}
                          className="absolute right-2 top-1.5 h-9 w-24 rounded-xl border-slate-200 px-3 text-right"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setRenameDialog((current) => (
                            current ? { ...current, extensionEditable: true } : current
                          ))}
                          className="absolute right-2 top-1.5 inline-flex h-9 min-w-16 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600"
                        >
                          .{renameDialog.extension}
                        </button>
                      )
                    ) : null}
                  </div>
                </div>

                {renameDialog.confirmExtensionChange ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Are you sure you want to change the file type for this file?
                  </div>
                ) : null}

                {renameDialog.extension && !renameDialog.extensionEditable ? (
                  <p className="text-xs text-muted-foreground">
                    Click the extension chip to edit the file type.
                  </p>
                ) : null}
                {renameDialog.extensionEditable ? (
                  <p className="text-xs text-muted-foreground">
                    Editing the extension will change the file type and requires confirmation.
                  </p>
                ) : null}
                {!renameDialog.extension ? (
                  <p className="text-xs text-muted-foreground">
                    This item does not currently have a file extension.
                  </p>
                ) : null}
                <div className="hidden">
                </div>
              </div>

              <DialogFooter className="border-t border-slate-200/70 px-6 py-5">
                <Button variant="outline" onClick={() => setRenameDialog(null)} className="rounded-full">
                  Cancel
                </Button>
                <Button onClick={submitRename} className="rounded-full shadow-lg shadow-indigo-500/20">
                  {renameDialog.confirmExtensionChange ? 'Confirm Rename' : 'Save Name'}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ContextMenuButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 ${className ?? ''}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}
