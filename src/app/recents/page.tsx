'use client';

import * as React from 'react';
import { List, Grid3x3, Clock } from 'lucide-react';
import { files } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { FileListView } from '@/components/prodrive/file-list-view';
import { FileGridView } from '@/components/prodrive/file-grid-view';

type ViewMode = 'list' | 'grid';

export default function RecentsPage() {
    const [viewMode, setViewMode] = React.useState<ViewMode>('list');

    // Sort files by last modified (most recent first)
    // In a real app, this would filter by actual recent activity
    const recentFiles = [...files].sort((a, b) => {
        // Simple sorting based on the lastModified string
        // In production, you'd use actual timestamps
        const timeUnits: Record<string, number> = {
            'minutes': 1,
            'hours': 60,
            'day': 1440,
            'days': 1440,
            'week': 10080,
            'weeks': 10080,
        };

        const getMinutes = (str: string) => {
            const match = str.match(/(\d+)\s+(\w+)/);
            if (!match) return Infinity;
            const [, num, unit] = match;
            const unitKey = unit.toLowerCase();
            return parseInt(num) * (timeUnits[unitKey] || 1440);
        };

        return getMinutes(a.lastModified) - getMinutes(b.lastModified);
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                        <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold font-headline tracking-tight">Recent</h1>
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

            <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground mb-4">
                    Files and folders you've recently opened or modified
                </p>
                {viewMode === 'list' ? (
                    <FileListView data={recentFiles} />
                ) : (
                    <FileGridView data={recentFiles} />
                )}
            </div>
        </div>
    );
}
