import Image from 'next/image';
import type { FileOrFolder } from '@/core/lib/types';
import { LoaderCircle } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileIcon } from '@/components/file-icon';
import { Badge } from '@/components/ui/badge';
import { storageTierBadgeClass, storageTierLabel } from '@/core/lib/storage-tiers';

export function FileGridView({
  data,
  selectedIds,
  onItemClick,
  onItemContextMenu,
}: {
  data: FileOrFolder[];
  selectedIds?: string[];
  onItemClick?: (item: FileOrFolder, index: number, event: React.MouseEvent) => void;
  onItemContextMenu?: (event: React.MouseEvent, item: FileOrFolder) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {data.map((item, index) => {
        const isSelected = selectedIds?.includes(item.id) ?? false;

        return (
        <Card
          key={item.id}
          onClick={(event) => onItemClick?.(item, index, event)}
          onContextMenu={(event) => onItemContextMenu?.(event, item)}
          aria-selected={isSelected}
          className={`select-none cursor-default overflow-hidden border-border/70 transition-colors hover:border-primary/20 hover:bg-primary/[0.02] ${
            isSelected ? 'border-primary bg-primary/[0.08] ring-2 ring-primary/20' : ''
          }`}
        >
          <CardContent className="p-0">
            <div className="relative aspect-video">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  data-ai-hint={item.thumbnail.imageHint}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-secondary">
                  <FileIcon type={item.type} className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start p-3">
            <div className="flex w-full items-center gap-2">
              {item.isPending ? (
                <LoaderCircle className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              ) : null}
              <p className="w-full truncate text-sm font-medium">{item.name}</p>
            </div>
            <div className="mt-1 flex w-full items-center justify-between gap-2">
              <p className="truncate text-xs text-muted-foreground">{item.size || '—'}</p>
              <Badge variant="outline" className={storageTierBadgeClass(item.storageTier)}>
                {storageTierLabel(item.storageTier)}
              </Badge>
            </div>
          </CardFooter>
        </Card>
        );
      })}
    </div>
  );
}
