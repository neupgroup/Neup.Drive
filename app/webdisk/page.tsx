'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Calendar, ExternalLink, FileCode, FileIcon, FileText, Folder, FolderInput, Globe, ImageIcon, MoreVertical, Pencil, Trash2, Upload, User, VideoIcon, AudioLines } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { handleClientError } from '@/core/lib/error-client';
import { toast } from '@/core/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storageTierBadgeClass, storageTierFromWebdiskType, storageTierLabel, type StorageTier } from '@/core/lib/storage-tiers';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WebDiskRecord {
  id: string;
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
  name: string;
  type: string;
  path: string;
  count: number;
}

type FileOperationDialogState =
  | {
      action: 'rename' | 'move';
      file: WebDiskRecord;
      newName: string;
      destinationType: string;
      destinationPath: string;
    }
  | null;

const WEBDISK_TYPES = [
  { id: 'assets', label: 'Assets' },
  { id: 'signed', label: 'Signed' },
];

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-10 w-10 text-blue-500" />;
  if (mimeType.startsWith('video/')) return <VideoIcon className="h-10 w-10 text-purple-500" />;
  if (mimeType.startsWith('audio/')) return <AudioLines className="h-10 w-10 text-pink-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-10 w-10 text-red-500" />;
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json')) return <FileCode className="h-10 w-10 text-yellow-500" />;
  return <FileIcon className="h-10 w-10 text-slate-400" />;
};

function getAccountRelativePath(file: WebDiskRecord) {
  const cleanPath = (file.cdn_path || file.id || '').replace(/^\/+/, '');
  const uploadsPrefix = 'uploads/';
  const withoutUploads = cleanPath.startsWith(uploadsPrefix) ? cleanPath.slice(uploadsPrefix.length) : cleanPath;
  const [, ...rest] = withoutUploads.split('/');
  return rest.join('/');
}

function getTypedRelativePath(file: WebDiskRecord) {
  const relativePath = getAccountRelativePath(file);
  const [maybeType, ...rest] = relativePath.split('/');
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

function FolderCard({ folder, onOpen }: { folder: WebDiskFolder; onOpen: (folder: WebDiskFolder) => void }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(folder)}
      className="text-left"
    >
      <Card className="h-full border-slate-200/60 transition-all duration-300 hover:shadow-lg dark:border-slate-800/60">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Folder className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900 dark:text-white">{folder.name}</h3>
            <p className="text-xs text-muted-foreground">{folder.count} item{folder.count === 1 ? '' : 's'}</p>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function FileCard({
  file,
  currentType,
  currentPath,
  onOperation,
}: {
  file: WebDiskRecord;
  currentType: string;
  currentPath: string;
  onOperation: (file: WebDiskRecord, action: 'rename' | 'move' | 'delete') => void;
}) {
  const [imgError, setImgError] = React.useState(false);
  const isImage = file.mimeType.startsWith('image/') && !imgError;

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200/60 dark:border-slate-800/60 h-full flex flex-col">
      <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img
            src={file.path}
            alt={file.filename}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            {getFileIcon(file.mimeType)}
          </div>
        )}

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm" asChild className="rounded-full shadow-lg">
            <a href={file.path} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-1.5" />
              View
            </a>
          </Button>
        </div>

        <Badge variant="secondary" className="absolute top-2 right-2 backdrop-blur-md bg-white/70 dark:bg-black/70 text-[10px] uppercase font-bold tracking-wider">
          {file.mimeType.split('/')[1] || 'FILE'}
        </Badge>
        <Badge
          variant="outline"
          className={`absolute left-2 top-2 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider ${storageTierBadgeClass(file.storageTier || storageTierFromWebdiskType(currentType))}`}
        >
          {storageTierLabel(file.storageTier || storageTierFromWebdiskType(currentType))}
        </Badge>
      </div>

      <CardHeader className="p-4 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-semibold truncate leading-tight flex-1" title={file.filename}>
            {file.filename}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onOperation(file, 'move')}>
                <FolderInput className="mr-2 h-4 w-4" />
                Organize
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onOperation(file, 'rename')}>
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onOperation(file, 'delete')} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="text-[12px] flex items-center gap-1.5 mt-1">
          <User className="h-3 w-3" />
          <span>{file.uploaded_by}</span>
        </CardDescription>
      </CardHeader>

      <CardFooter className="px-4 py-3 border-t bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center mt-auto">
        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Calendar className="h-3 w-3" />
          {format(new Date(file.uploaded_on), 'MMM d, yyyy')}
        </div>
        <Badge variant="outline" className="max-w-[120px] truncate text-[10px]" title={currentPath || currentType}>
          {currentPath || currentType}
        </Badge>
      </CardFooter>
    </Card>
  );
}

function WebdiskContent() {
  const [files, setFiles] = React.useState<WebDiskRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [operatingPath, setOperatingPath] = React.useState<string | null>(null);
  const [dialogState, setDialogState] = React.useState<FileOperationDialogState>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTypeParam = searchParams.get('type');
  const selectedType = WEBDISK_TYPES.some((type) => type.id === selectedTypeParam) ? selectedTypeParam || 'assets' : 'assets';
  const selectedPath = (searchParams.get('path') || '').replace(/^\/+/, '');

  const fetchFiles = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/bridge/api.v1/webdisk/files');
      if (!response.ok) {
        let responseData: unknown = null;
        try {
          responseData = await response.json();
        } catch {
          responseData = await response.text().catch(() => '');
        }
        const error = new Error('Failed to fetch files') as Error & {
          status?: number;
          response?: unknown;
        };
        error.status = response.status;
        error.response = responseData;
        throw error;
      }
      const data = await response.json();
      setFiles(data);
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
    fetchFiles();
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
        name: 'signed',
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
  }, [filesByType, selectedPath, selectedType]);

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
                void runOperation({
                  ...file,
                  cdn_path: trashPath,
                }, 'restore');
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
  }, [fetchFiles]);

  const openOperationDialog = React.useCallback((file: WebDiskRecord, action: 'rename' | 'move') => {
    const location = getTypedRelativePath(file);
    setDialogState({
      action,
      file,
      newName: file.filename,
      destinationType: location.type || selectedType,
      destinationPath: dirname(location.path),
    });
  }, [selectedType]);

  const runOperation = React.useCallback(async (file: WebDiskRecord, action: 'rename' | 'move' | 'delete' | 'restore') => {
    if (!selectedType) return;

    if (action === 'rename' || action === 'move') {
      openOperationDialog(file, action);
      return;
    }

    const body: Record<string, string> = {
      action,
      cdn_path: file.cdn_path || file.id,
      type: selectedType,
    };

    await performOperation(file, action, body);
  }, [openOperationDialog, performOperation, selectedType]);

  const submitDialogOperation = React.useCallback(async () => {
    if (!dialogState || !selectedType) return;

    const { action, file } = dialogState;
    const body: Record<string, string> = {
      action,
      cdn_path: file.cdn_path || file.id,
      type: selectedType,
    };

    if (action === 'rename') {
      const trimmedName = dialogState.newName.trim();
      if (!trimmedName) {
        setError('File name is required.');
        return;
      }
      if (trimmedName === file.filename) {
        setDialogState(null);
        return;
      }
      body.new_name = trimmedName;
    }

    if (action === 'move') {
      const normalizedType = dialogState.destinationType.trim();
      if (!WEBDISK_TYPES.some((type) => type.id === normalizedType)) {
        setError('Invalid type. Use assets or signed.');
        return;
      }

      body.to_type = normalizedType;
      body.to_path = dialogState.destinationPath.trim().replace(/^\/+/, '');
    }

    setDialogState(null);
    await performOperation(file, action, body);
  }, [dialogState, performOperation, selectedType]);

  const displayPath = selectedPath ? `/${selectedPath}` : '/';

  return (
    <div className="space-y-8 p-1 sm:p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tight mb-1 text-slate-900 dark:text-white">
            WebDisk
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {displayPath}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedPath ? navigateTo(selectedType, dirname(selectedPath)) : router.push(`/webdisk?type=${selectedType}`)}
            className="rounded-full"
            disabled={!selectedPath}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={fetchFiles} className="rounded-full">
            Refresh
          </Button>
          <Button asChild className="rounded-full shadow-indigo-500/20 shadow-lg">
            <Link href={webdiskUploadHref(selectedType, selectedPath)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload New File
            </Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-10 text-center">
            <p className="text-destructive font-semibold mb-2">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchFiles}>Try Again</Button>
          </CardContent>
        </Card>
      ) : currentItems.folders.length === 0 && currentItems.files.length === 0 ? (
        <Card className="flex h-[400px] flex-col items-center justify-center bg-slate-50/30 dark:bg-slate-900/30 border-dashed rounded-3xl">
          <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
            <Globe className="h-16 w-16 opacity-30 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">This folder is empty</h3>
          <p className="text-muted-foreground max-w-sm text-center mb-6">
            Files organized into this WebDisk location will appear here after the CDN API finds them.
          </p>
          <Button asChild className="rounded-full">
            <Link href={webdiskUploadHref(selectedType, selectedPath)}>Go to Upload Center</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {currentItems.folders.map((folder) => (
            <FolderCard
              key={`${folder.type}:${folder.path || folder.name}`}
              folder={folder}
              onOpen={() => navigateTo(folder.type, folder.path)}
            />
          ))}
          {currentItems.files.map((file) => (
            <div key={file.id} className={operatingPath === (file.cdn_path || file.id) ? 'pointer-events-none opacity-60' : ''}>
              <FileCard
                file={file}
                currentType={selectedType}
                currentPath={selectedPath}
                onOperation={runOperation}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogState !== null} onOpenChange={(open) => !open && setDialogState(null)}>
        <DialogContent className="max-w-md rounded-3xl border-slate-200/80 bg-white/95 p-0 shadow-2xl shadow-slate-900/10 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          {dialogState ? (
            <>
              <DialogHeader className="border-b border-slate-200/70 px-6 py-5 dark:border-slate-800">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
                  {dialogState.action === 'rename' ? <Pencil className="h-5 w-5" /> : <FolderInput className="h-5 w-5" />}
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  {dialogState.action === 'rename' ? 'Rename file' : 'Move file'}
                </DialogTitle>
                <DialogDescription className="text-sm leading-6">
                  {dialogState.action === 'rename'
                    ? `Update the display name for ${dialogState.file.filename}.`
                    : `Choose a destination for ${dialogState.file.filename}.`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 px-6 py-5">
                <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Current file
                  </p>
                  <p className="mt-2 truncate text-sm font-semibold text-slate-900 dark:text-white" title={dialogState.file.filename}>
                    {dialogState.file.filename}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground" title={dialogState.file.cdn_path || dialogState.file.id}>
                    {dialogState.file.cdn_path || dialogState.file.id}
                  </p>
                </div>

                {dialogState.action === 'rename' ? (
                  <div className="space-y-2">
                    <Label htmlFor="rename-file-name">New file name</Label>
                    <Input
                      id="rename-file-name"
                      value={dialogState.newName}
                      onChange={(event) => setDialogState((current) => current && current.action === 'rename'
                        ? { ...current, newName: event.target.value }
                        : current)}
                      placeholder="Enter a new file name"
                      className="h-12 rounded-2xl border-slate-200 px-4"
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="move-file-type">Destination type</Label>
                      <Select
                        value={dialogState.destinationType}
                        onValueChange={(value) => setDialogState((current) => current && current.action === 'move'
                          ? { ...current, destinationType: value }
                          : current)}
                      >
                        <SelectTrigger id="move-file-type" className="h-12 rounded-2xl border-slate-200 px-4">
                          <SelectValue placeholder="Choose a destination type" />
                        </SelectTrigger>
                        <SelectContent>
                          {WEBDISK_TYPES.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="move-file-path">Folder path</Label>
                      <Input
                        id="move-file-path"
                        value={dialogState.destinationPath}
                        onChange={(event) => setDialogState((current) => current && current.action === 'move'
                          ? { ...current, destinationPath: event.target.value.replace(/^\/+/, '') }
                          : current)}
                        placeholder="Optional folder path inside the selected type"
                        className="h-12 rounded-2xl border-slate-200 px-4"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave blank to move this file to the root of the selected type.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <DialogFooter className="border-t border-slate-200/70 px-6 py-5 dark:border-slate-800">
                <Button variant="outline" onClick={() => setDialogState(null)} className="rounded-full">
                  Cancel
                </Button>
                <Button onClick={() => void submitDialogOperation()} className="rounded-full shadow-lg shadow-indigo-500/20">
                  {dialogState.action === 'rename' ? 'Save Name' : 'Move File'}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
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
