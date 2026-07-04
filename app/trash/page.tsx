import Link from 'next/link';
import type { Prisma } from '@prisma/client';
import {
  ArrowLeft,
  FileQuestion,
  FileText,
  Music,
  Play,
  Trash2,
  Folder,
  FileImage,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { prisma } from '@/core/lib/db';
import type { FileOrFolder } from '@/core/lib/types';
import { cn } from '@/core/lib/utils';

const TRASH_OWNER = process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';

function getDetails(details: Prisma.JsonValue): Prisma.JsonObject {
  return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
}

function deletedDaysAgo(value?: string | null) {
  if (!value) return 'Unknown';
  const deletedAt = new Date(value).getTime();
  if (Number.isNaN(deletedAt)) return 'Unknown';
  const diff = Date.now() - deletedAt;
  if (diff <= 0) return 'Today';
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  if (days === 0) return 'Today';
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function formatBytes(size: bigint | number | null | undefined) {
  const bytes = Number(size ?? 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value >= 10 || unitIndex === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[unitIndex]}`;
}

function fileTypeFromRecord(type: string, name: string): FileOrFolder['type'] {
  const extension = name.split('.').pop()?.toLowerCase();
  if (extension === 'pdf') return 'pdf';
  if (extension === 'jpg' || extension === 'jpeg') return 'jpg';
  if (extension === 'png') return 'png';
  if (extension === 'mp4') return 'mp4';
  if (extension === 'mp3' || extension === 'wav' || extension === 'm4a' || extension === 'aac' || extension === 'ogg') return 'audio';
  if (extension === 'doc' || extension === 'docx') return 'doc';

  if (type.startsWith('file:')) {
    const subtype = type.slice('file:'.length);
    if (subtype === 'pdf') return 'pdf';
    if (subtype === 'jpeg' || subtype === 'jpg') return 'jpg';
    if (subtype === 'png') return 'png';
    if (subtype === 'mp4') return 'mp4';
    if (subtype === 'mpeg' || subtype === 'mp3' || subtype === 'wav' || subtype === 'ogg' || subtype === 'aac') return 'audio';
  }

  return 'unknown';
}

function FileTypeTile({ type }: { type: FileOrFolder['type'] }) {
  const iconClass = 'h-5 w-5 text-white drop-shadow-sm';

  if (type === 'folder') {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-sm">
        <Folder className={iconClass} />
      </span>
    );
  }

  if (type === 'jpg' || type === 'png') {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-300 to-cyan-600 shadow-sm">
        <FileImage className={iconClass} />
      </span>
    );
  }

  if (type === 'mp4') {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-red-600 shadow-sm">
        <Play className="ml-0.5 h-5 w-5 fill-white text-white drop-shadow-sm" />
      </span>
    );
  }

  if (type === 'audio') {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-400 to-purple-700 shadow-sm">
        <Music className={iconClass} />
      </span>
    );
  }

  if (type === 'doc' || type === 'pdf') {
    return (
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-orange-600 shadow-sm">
        <FileText className={iconClass} />
      </span>
    );
  }

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-300 to-slate-600 shadow-sm">
      <FileQuestion className={iconClass} />
    </span>
  );
}

async function getTrashItems() {
  const rows = await prisma.fileFolder.findMany({
    where: {
      owner: TRASH_OWNER,
      stored_as: 'trash',
    },
    orderBy: { updated_on: 'desc' },
    take: 100,
  });

  return rows.map((row) => {
    const details = getDetails(row.details);
    const previousPath = typeof details.previous_path === 'string' ? details.previous_path : row.path;
    const deletedOn = typeof details.deleted_on === 'string' ? details.deleted_on : null;
    return {
      id: row.id,
      name: row.name,
      type: fileTypeFromRecord(row.type, row.name),
      size: formatBytes(row.size),
      previousPath,
      deletedOn,
    };
  });
}

export default async function TrashPage() {
  const items = await getTrashItems();

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-headline tracking-tight">Trash</h1>
            <p className="text-sm text-muted-foreground">Items stay here for 30 days before permanent deletion.</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Drive
            </Link>
          </Button>
        </div>

        <Card className="flex h-72 items-center justify-center">
          <CardContent className="pt-6 text-center text-muted-foreground">
            <Trash2 className="mx-auto h-12 w-12" />
            <p className="mt-4">Your trash is empty.</p>
            <p className="text-sm">Deleted files will appear here after you move them to trash.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-headline tracking-tight">Trash</h1>
          <p className="text-sm text-muted-foreground">Items stay here for 30 days before permanent deletion.</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Drive
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200/70">
        {items.map((item, index) => (
          <Card
            key={item.id}
            className={cn(
              'rounded-none border-0 shadow-none',
              index !== items.length - 1 && 'border-b border-slate-200/70',
              index === 0 && 'rounded-t-xl',
              index === items.length - 1 && 'rounded-b-xl'
            )}
          >
            <CardHeader className="flex flex-row items-start gap-3 pb-3">
              <FileTypeTile type={item.type} />
              <div className="min-w-0 flex-1">
                <CardTitle className="truncate text-base" title={item.name}>
                  {item.name}
                </CardTitle>
                <CardDescription>{deletedDaysAgo(item.deletedOn)}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>{item.size}</span>
                <span aria-hidden="true">.</span>
                <span className="break-all">{item.previousPath}</span>
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
