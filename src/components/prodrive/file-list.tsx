'use client';

import * as React from 'react';
import { FileIcon, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleClientError } from '@/lib/error-client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

interface FileRecord {
    id: string;
    name: string;
    size: number;
    mimeType: string;
    path: string;
    url: string;
    createdAt: string;
}

interface FileListProps {
    refreshTrigger?: number;
}

export function FileList({ refreshTrigger = 0 }: FileListProps) {
    const [files, setFiles] = React.useState<FileRecord[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const fetchFiles = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/drive/files');
            if (res.ok) {
                const data = await res.json();
                setFiles(data);
            } else {
                let errorData: unknown = null;
                try {
                    errorData = await res.json();
                } catch {
                    errorData = await res.text().catch(() => '');
                }
                const message = await handleClientError(
                    new Error('Failed to fetch files'),
                    'FileList',
                    {
                        status: res.status,
                        response: errorData,
                    }
                );
                setError(message);
            }
        } catch (error) {
            const userMessage = await handleClientError(error, 'FileList');
            setError(userMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchFiles();
    }, [fetchFiles, refreshTrigger]);

    function formatSize(bytes: number) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Your Files</h3>
                <Button variant="outline" size="sm" onClick={fetchFiles} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 flex items-center gap-3 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <p>{error}</p>
                </div>
            )}

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Size</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Uploaded</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {files.length === 0 && !loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No files uploaded yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            files.map((file) => (
                                <TableRow key={file.id}>
                                    <TableCell>
                                        <FileIcon className="h-4 w-4 text-muted-foreground" />
                                    </TableCell>
                                    <TableCell className="font-medium">{file.name}</TableCell>
                                    <TableCell>{formatSize(file.size)}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">{file.mimeType}</TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                        {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => window.open(file.url, '_blank')}
                                        >
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            View
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
