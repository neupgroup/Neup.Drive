import type { FileOrFolder } from '@/core/lib/types';
import {
  FileImage,
  FileQuestion,
  FileText,
  Folder,
  Music,
  Play,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { storageTierDotClass, storageTierLabel } from '@/core/lib/storage-tiers';

export function FileListView({
  data,
  onItemContextMenu,
}: {
  data: FileOrFolder[];
  onItemContextMenu?: (event: React.MouseEvent, item: FileOrFolder) => void;
}) {
  return (
    <div className="space-y-0">
      {data.map((item, index) => {
        const uploader = item.members[0]?.name || 'Unknown';

        return (
          <Card
            key={item.id}
            onContextMenu={(event) => onItemContextMenu?.(event, item)}
            className={`cursor-default rounded-none border-b-0 shadow-none transition-colors hover:border-primary/20 hover:bg-primary/[0.03] ${
              index === 0 ? 'rounded-t-3xl' : ''
            } ${index === data.length - 1 ? 'rounded-b-3xl border-b' : ''}`}
          >
            <div className="flex min-h-20 items-center gap-4 px-4 py-3">
              <FileTypeTile type={item.type} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className={`h-2 w-2 rounded-full ${storageTierDotClass(item.storageTier)}`}
                          aria-label={storageTierLabel(item.storageTier)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>{storageTierLabel(item.storageTier)} Storage</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <span className="truncate">Uploaded by {uploader}</span>
                  <span aria-hidden="true">.</span>
                  <span>{item.lastModified}</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
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
