import Image from 'next/image';
import type { FileOrFolder } from '@/core/lib/types';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { FileIcon } from '@/components/file-icon';

export function FileGridView({
  data,
  onItemContextMenu,
}: {
  data: FileOrFolder[];
  onItemContextMenu?: (event: React.MouseEvent, item: FileOrFolder) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {data.map((item) => (
        <Card
          key={item.id}
          onContextMenu={(event) => onItemContextMenu?.(event, item)}
          className="cursor-default overflow-hidden transition-all hover:shadow-md"
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
            <p className="w-full truncate text-sm font-medium">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.size || '—'}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
