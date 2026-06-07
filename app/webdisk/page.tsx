'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ArrowLeft, Calendar, ExternalLink, FileCode, FileIcon, FileText, Folder, FolderInput, Globe, ImageIcon, MoreVertical, Pencil, Trash2, Upload, User, VideoIcon, AudioLines } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { handleClientError } from '@/core/lib/error-client';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
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

const WEBDISK_TYPES = [
  { id: 'assets', label: 'Assets' },
  { id: 'private', label: 'Private' },
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTypeParam = searchParams.get('type');
  const selectedType = WEBDISK_TYPES.some((type) => type.id === selectedTypeParam) ? selectedTypeParam : null;
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

  const topLevelFolders = React.useMemo<WebDiskFolder[]>(() => WEBDISK_TYPES.map((type) => ({
    name: type.label,
    type: type.id,
    path: '',
    count: filesByType.filter((item) => item.location.type === type.id).length,
  })), [filesByType]);

  const currentItems = React.useMemo(() => {
    if (!selectedType) return { folders: topLevelFolders, files: [] as WebDiskRecord[] };

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

    return {
      folders: Array.from(folders.values()).sort((a, b) => a.name.localeCompare(b.name)),
      files: currentFiles.sort((a, b) => a.filename.localeCompare(b.filename)),
    };
  }, [filesByType, selectedPath, selectedType, topLevelFolders]);

  const runOperation = React.useCallback(async (file: WebDiskRecord, action: 'rename' | 'move' | 'delete') => {
    if (!selectedType) return;

    let body: Record<string, string> = {
      action,
      cdn_path: file.cdn_path || file.id,
      type: selectedType,
    };

    if (action === 'rename') {
      const newName = window.prompt('Rename file', file.filename);
      if (!newName || newName.trim() === file.filename) return;
      body.new_name = newName.trim();
    }

    if (action === 'move') {
      const destinationType = window.prompt('Organize into type: assets, private, or signed', selectedType);
      if (!destinationType) return;

      const normalizedType = destinationType.trim();
      if (!WEBDISK_TYPES.some((type) => type.id === normalizedType)) {
        setError('Invalid type. Use assets, private, or signed.');
        return;
      }

      const destinationPath = window.prompt('Folder path inside that type', selectedPath);
      if (destinationPath === null) return;
      body.to_type = normalizedType;
      body.to_path = destinationPath.trim().replace(/^\/+/, '');
    }

    if (action === 'delete' && !window.confirm(`Delete ${file.filename} from WebDisk?`)) {
      return;
    }

    try {
      setOperatingPath(file.cdn_path || file.id);
      const response = await fetch('/bridge/api.v1/webdisk/files/operation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        let responseData: unknown = null;
        try {
          responseData = await response.json();
        } catch {
          responseData = await response.text().catch(() => '');
        }
        const operationError = new Error('WebDisk operation failed') as Error & { status?: number; response?: unknown };
        operationError.status = response.status;
        operationError.response = responseData;
        throw operationError;
      }

      await fetchFiles();
      setError(null);
    } catch (err) {
      const message = await handleClientError(err, 'WebDiskOperation', {
        status: typeof err === 'object' && err && 'status' in err ? (err as { status?: number }).status : undefined,
        response: typeof err === 'object' && err && 'response' in err ? (err as { response?: unknown }).response : undefined,
      });
      setError(message);
    } finally {
      setOperatingPath(null);
    }
  }, [fetchFiles, selectedPath, selectedType]);

  const heading = selectedType
    ? WEBDISK_TYPES.find((type) => type.id === selectedType)?.label || selectedType
    : 'WebDisk';

  return (
    <div className="space-y-8 p-1 sm:p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tight mb-1 text-slate-900 dark:text-white">
            {heading}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {selectedType ? `/${selectedType}${selectedPath ? `/${selectedPath}` : ''}` : 'Files looked up directly from the CDN API'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedType ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => selectedPath ? navigateTo(selectedType, dirname(selectedPath)) : router.push('/webdisk')}
              className="rounded-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : null}
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
      ) : selectedType && currentItems.folders.length === 0 && currentItems.files.length === 0 ? (
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
                currentType={selectedType || 'assets'}
                currentPath={selectedPath}
                onOperation={runOperation}
              />
            </div>
          ))}
        </div>
      )}
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
