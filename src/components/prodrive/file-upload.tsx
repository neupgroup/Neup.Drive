'use client';

import * as React from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { signAndUploadFile, initializeUpload } from '@/lib/upload-client';
import { cn } from '@/lib/utils';
import { hashFile } from '@/lib/sha256';
import type { UploadInitResponse } from '@/lib/upload-types';
import { uploadFileChunks } from '@/lib/chunked-upload';
import { saveUpload, getUploads, deleteUpload, type UploadQueueItem } from '@/lib/upload-persistence';

interface FileUploadProps {
    accountId: string;
    keyId: string;
    secretKey: string;
    uploadPath?: string; // Base path for uploads
    maxSize?: number; // Max file size in bytes
    acceptedTypes?: string[]; // Accepted MIME types
    cdnUrl?: string; // CDN API endpoint URL
    onUploadComplete?: (url: string, file: File) => void;
    onUploadError?: (error: string, file: File) => void;
    className?: string;
}

export function FileUpload({
    accountId,
    keyId,
    secretKey,
    uploadPath = 'uploads',
    maxSize = 6000 * 1024 * 1024, // 100MB default
    acceptedTypes,
    cdnUrl = '/api/upload', // Default to local API endpoint
    onUploadComplete,
    onUploadError,
    className,
}: FileUploadProps) {
    const [queue, setQueue] = React.useState<UploadQueueItem[]>([]);
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const processingRef = React.useRef(false);

    // Step 7: Load persisted uploads on mount
    React.useEffect(() => {
        getUploads().then(persistedUploads => {
            // Filter out old completed/failed items or handle resume logic
            // For now, we load everything that isn't DONE
            const activeItems = persistedUploads.filter(item => item.status !== 'DONE');
            if (activeItems.length > 0) {
                setQueue(activeItems);
            }
        });
    }, []);

    // Helper to update queue and persist
    const updateQueueItem = (id: string, updates: Partial<UploadQueueItem>) => {
        setQueue(prev => {
            const newQueue = prev.map(item => {
                if (item.id === id) {
                    const updatedItem = { ...item, ...updates };
                    // Persist change
                    saveUpload(updatedItem).catch(console.error);
                    return updatedItem;
                }
                return item;
            });
            return newQueue;
        });
    };

    // Helper to log errors to the database
    const logError = async (context: any) => {
        try {
            await fetch('/api/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    on_page: 'FileUpload',
                    context
                }),
            });
        } catch (e) {
            console.error('Failed to log error to DB:', e);
        }
    };

    // ========Step 2 Starts, Hashing ==============
    // Processing loop to handle queue transitions
    React.useEffect(() => {
        const processQueue = async () => {
            if (processingRef.current) return;

            // Find files that need processing (limit concurrency if needed, here we process one by one or all pending)
            // User requested: "Hashing worker pool starts (2–4 concurrent workers)"
            // We'll implement a simple concurrency limit of 2 for hashing
            const activeHashing = queue.filter(item => item.status === 'HASHING').length;
            if (activeHashing >= 2) return;

            const pendingItem = queue.find(item => item.status === 'PENDING');
            if (!pendingItem) return;

            processingRef.current = true;

            try {
                // Update state to HASHING
                updateQueueItem(pendingItem.id, { status: 'HASHING' });

                // Process hashing
                console.log(`Starting hash for ${pendingItem.metadata.name}`);

                const hash = await hashFile(pendingItem.file, (progress) => {
                    updateQueueItem(pendingItem.id, { progress });
                });

                // Update state to HASHED
                updateQueueItem(pendingItem.id, { status: 'HASHED', hash, progress: 100 });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Hashing failed';
                console.error('Hashing failed:', error);

                logError({
                    action: 'hashing',
                    fileId: pendingItem.id,
                    fileName: pendingItem.metadata.name,
                    error: errorMessage
                });

                updateQueueItem(pendingItem.id, {
                    status: 'ERROR',
                    error: errorMessage
                });
            } finally {
                processingRef.current = false;
            }
        };

        // Run the processor whenever queue changes
        processQueue();

        // Also set an interval to check for free slots if multiple files are pending
        const interval = setInterval(processQueue, 500);
        return () => clearInterval(interval);
    }, [queue]);
    // =========Step2 Ends, Hashing =============

    // ======= Step 3 Starts, Authorization ===============
    // Process files that are HASHED and need authorization
    React.useEffect(() => {
        const authorizeFile = async () => {
            const hashedItem = queue.find(item => item.status === 'HASHED');
            if (!hashedItem || !hashedItem.hash) return;

            try {
                const initResponse = await initializeUpload({
                    file_id: hashedItem.id,
                    filename: hashedItem.metadata.name,
                    size: hashedItem.metadata.size,
                    mime: hashedItem.metadata.type,
                    file_hash: hashedItem.hash,
                });

                // Update state to TOKEN_ISSUED
                updateQueueItem(hashedItem.id, {
                    status: 'TOKEN_ISSUED',
                    uploadInit: initResponse
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Authorization failed';
                console.error('Authorization failed:', error);

                logError({
                    action: 'authorization',
                    fileId: hashedItem.id,
                    fileName: hashedItem.metadata.name,
                    error: errorMessage
                });

                updateQueueItem(hashedItem.id, {
                    status: 'ERROR',
                    error: errorMessage
                });
            }
        };

        // Check for hashed files periodically or when queue changes
        // Since we modify queue in the effect, we need to be careful not to create infinite loops
        // The condition `queue.find(item => item.status === 'HASHED')` ensures we only act when there is work
        authorizeFile();
    }, [queue]);
    // ======== Step 3 Ends, Authorization ==============

    // ======= Step 4 Starts, Uploading ===============
    // Process files that have TOKEN_ISSUED and are ready to upload
    React.useEffect(() => {
        const processUploads = async () => {
            // Limit concurrent uploads (3-5 max)
            const activeUploads = queue.filter(item => item.status === 'UPLOADING').length;
            if (activeUploads >= 3) return;

            const readyItem = queue.find(item => item.status === 'TOKEN_ISSUED');
            if (!readyItem || !readyItem.uploadInit || !readyItem.hash) return;

            // Update state to UPLOADING
            updateQueueItem(readyItem.id, { status: 'UPLOADING', progress: 0 });

            try {
                await uploadFileChunks(
                    readyItem.file,
                    readyItem.uploadInit,
                    readyItem.hash,
                    (progress) => {
                        updateQueueItem(readyItem.id, { progress });
                    }
                );

                // Update state to VERIFIED (Step 5)
                updateQueueItem(readyItem.id, { status: 'VERIFIED', progress: 100 });

                // Step 6: Finalization - wait for callback or immediate completion
                // In a real scenario, we might poll for status or wait for socket event
                // Here we assume if chunk upload succeeded, we are verified
                setTimeout(() => {
                    updateQueueItem(readyItem.id, { status: 'DONE' });
                    onUploadComplete?.(readyItem.uploadInit!.destination_path, readyItem.file);
                }, 1000);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';
                console.error('Upload failed:', error);

                logError({
                    action: 'uploading',
                    fileId: readyItem.id,
                    fileName: readyItem.metadata.name,
                    error: errorMessage
                });

                updateQueueItem(readyItem.id, {
                    status: 'ERROR',
                    error: errorMessage
                });

                onUploadError?.(errorMessage, readyItem.file);
            }
        };

        // Check for ready files periodically or when queue changes
        processUploads();

        // Also set an interval to check for free slots
        const interval = setInterval(processUploads, 1000);
        return () => clearInterval(interval);
    }, [queue, onUploadComplete, onUploadError]);
    // ======== Step 4 Ends, Uploading ==============

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        // ======= Step 1 Starts, Pending ===============
        const newItems: UploadQueueItem[] = [];

        for (const file of Array.from(files)) {
            // Validate file type
            if (acceptedTypes && acceptedTypes.length > 0) {
                if (!acceptedTypes.includes(file.type)) {
                    console.error(`File type ${file.type} not accepted`);
                    continue;
                }
            }

            // Validate file size
            if (file.size > maxSize) {
                console.error(`File ${file.name} exceeds maximum size`);
                continue;
            }

            // Generate Client-side UUID
            const id = crypto.randomUUID();

            // Create queue item in PENDING state
            newItems.push({
                id,
                file,
                metadata: {
                    name: file.name,
                    size: file.size,
                    type: file.type || 'application/octet-stream', // Default to octet-stream if undefined
                },
                status: 'PENDING',
                progress: 0,
                createdAt: Date.now(),
            });
        }

        // Add to queue and persist
        const newQueue = [...queue, ...newItems];
        setQueue(newQueue);
        newItems.forEach(item => saveUpload(item).catch(console.error));
        // ======== Step 1 Ends, Pending ==============
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const removeFile = (id: string) => {
        setQueue(prev => prev.filter(item => item.id !== id));
    };

    const getStatusText = (item: UploadQueueItem) => {
        switch (item.status) {
            case 'PENDING': return 'Pending...';
            case 'HASHING': return `Hashing... ${item.progress.toFixed(0)}%`;
            case 'HASHED': return 'Ready (Hashed)';
            case 'TOKEN_ISSUED': return 'Authorized';
            case 'UPLOADING': return `Uploading... ${item.progress.toFixed(0)}%`;
            case 'VERIFIED': return 'Verified (Processing)';
            case 'DONE': return 'Complete';
            case 'ERROR': return 'Error';
            default: return '';
        }
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Drop zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/25 hover:border-primary/50'
                )}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
                <p className="text-sm text-muted-foreground">
                    Maximum file size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
                </p>
                {acceptedTypes && acceptedTypes.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                        Accepted types: {acceptedTypes.join(', ')}
                    </p>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes?.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
            />

            {/* Upload progress list */}
            {queue.length > 0 && (
                <div className="space-y-2">
                    {queue.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium truncate">{item.metadata.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {getStatusText(item)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {item.status === 'HASHING' && (
                                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        )}
                                        {item.status === 'HASHED' && (
                                            <CheckCircle2 className="h-4 w-4 text-blue-500" />
                                        )}
                                        {(item.status === 'VERIFIED' || item.status === 'DONE') && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                        {item.status === 'ERROR' && (
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => removeFile(item.id)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                {(item.status === 'HASHING' || item.status === 'UPLOADING') && (
                                    <Progress value={item.progress} className="h-1" />
                                )}
                                {item.status === 'ERROR' && (
                                    <p className="text-xs text-destructive">{item.error}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
