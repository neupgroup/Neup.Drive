'use client';

import * as React from 'react';
import { Copy, Download, Edit3, Eye, FolderInput, Grid3x3, List, MoreHorizontal, Share2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FileOrFolder } from '@/core/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const files = initialFiles;

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

    setMenu({ item, x: Math.max(8, x), y: Math.max(8, y) });
  }, []);

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
        toast({
          title: 'File moved to Trash.',
          action: (
            <ToastAction
              altText={`Undo deleting ${item.name}`}
              onClick={() => {
                void runOperation(item, { action: 'restore' });
              }}
            >
              Undo
            </ToastAction>
          ),
        });
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
    const newName = window.prompt('Rename item', item.name)?.trim();
    if (!newName || newName === item.name) {
      setMenu(null);
      return;
    }
    void runOperation(item, { action: 'rename', new_name: newName });
  }, [runOperation]);

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
    <div className="space-y-4" onContextMenu={(event) => {
      if (event.target === event.currentTarget) event.preventDefault();
    }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
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
        <FileListView data={files} onItemContextMenu={openContextMenu} />
      ) : (
        <FileGridView data={files} onItemContextMenu={openContextMenu} />
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
