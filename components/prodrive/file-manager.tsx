'use client';

import * as React from 'react';
import { List, Grid3x3 } from 'lucide-react';
import type { FileOrFolder } from '@/core/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileListView } from './file-list-view';
import { FileGridView } from './file-grid-view';

type ViewMode = 'list' | 'grid';

export function FileManager({ initialFiles = [] }: { initialFiles?: FileOrFolder[] }) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const files = initialFiles;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline tracking-tight">My Drive</h1>
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
            No files yet.
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <FileListView data={files} />
      ) : (
        <FileGridView data={files} />
      )}
    </div>
  );
}
