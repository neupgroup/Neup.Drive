'use client';

import * as React from 'react';
import { files } from '@/core/lib/data';
import { FileManager } from '@/components/prodrive/file-manager';

export default function RecentsPage() {
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
        <FileManager
            initialFiles={recentFiles}
            title="Recent"
            subtitle="Files and folders you've recently opened or modified."
            emptyMessage="No recent files yet."
        />
    );
}
