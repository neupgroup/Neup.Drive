'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Globe, Upload, FileIcon, ExternalLink, Calendar, User, FileText, ImageIcon, VideoIcon, AudioLines, FileCode, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { handleClientError } from '@/lib/error-client';
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";

interface WebDiskRecord {
  id: string;
  filename: string;
  path: string;
  cdn_path?: string;
  mimeType: string;
  uploaded_by: string;
  uploaded_on: string;
  size?: number;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) return <ImageIcon className="h-10 w-10 text-blue-500" />;
  if (mimeType.startsWith('video/')) return <VideoIcon className="h-10 w-10 text-purple-500" />;
  if (mimeType.startsWith('audio/')) return <AudioLines className="h-10 w-10 text-pink-500" />;
  if (mimeType === 'application/pdf') return <FileText className="h-10 w-10 text-red-500" />;
  if (mimeType.includes('javascript') || mimeType.includes('typescript') || mimeType.includes('json')) return <FileCode className="h-10 w-10 text-yellow-500" />;
  return <FileIcon className="h-10 w-10 text-slate-400" />;
};

function FileCard({ file }: { file: WebDiskRecord }) {
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
      </div>

      <CardHeader className="p-4 flex-grow">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-semibold truncate leading-tight flex-1" title={file.filename}>
            {file.filename}
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1">
            <MoreVertical className="h-4 w-4" />
          </Button>
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
      </CardFooter>
    </Card>
  );
}

export default function WebdiskPage() {
  const [files, setFiles] = React.useState<WebDiskRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchFiles = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/webdisk/files');
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

  return (
    <div className="space-y-8 p-1 sm:p-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tight mb-1 text-slate-900 dark:text-white">
            WebDisk
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            Files looked up directly from the CDN API
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchFiles} className="rounded-full">
            Refresh
          </Button>
          <Button asChild className="rounded-full shadow-indigo-500/20 shadow-lg">
            <Link href="/upload">
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
      ) : files.length === 0 ? (
        <Card className="flex h-[400px] flex-col items-center justify-center bg-slate-50/30 dark:bg-slate-900/30 border-dashed rounded-3xl">
          <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-6">
            <Globe className="h-16 w-16 opacity-30 text-indigo-500" />
          </div>
          <h3 className="text-xl font-bold mb-2">No CDN files found</h3>
          <p className="text-muted-foreground max-w-sm text-center mb-6">
            Any files you upload through the Upload Center will appear here after the CDN API finds them.
          </p>
          <Button asChild className="rounded-full">
            <Link href="/upload">Go to Upload Center</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}
    </div>
  );
}
