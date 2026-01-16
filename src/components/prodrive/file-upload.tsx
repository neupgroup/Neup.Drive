'use client';

import * as React from 'react';
import { Upload, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { signAndUploadFile } from '@/lib/upload-client';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    accountId: string;
    keyId: string;
    secretKey: string;
    uploadPath?: string; // Base path for uploads
    maxSize?: number; // Max file size in bytes
    acceptedTypes?: string[]; // Accepted MIME types
    onUploadComplete?: (url: string, file: File) => void;
    onUploadError?: (error: string, file: File) => void;
    className?: string;
}

interface UploadingFile {
    file: File;
    progress: number;
    status: 'uploading' | 'success' | 'error';
    url?: string;
    error?: string;
}

export function FileUpload({
    accountId,
    keyId,
    secretKey,
    uploadPath = 'uploads',
    maxSize = 100 * 1024 * 1024, // 100MB default
    acceptedTypes,
    onUploadComplete,
    onUploadError,
    className,
}: FileUploadProps) {
    const [uploadingFiles, setUploadingFiles] = React.useState<Map<string, UploadingFile>>(new Map());
    const [isDragging, setIsDragging] = React.useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const newFiles = Array.from(files);

        for (const file of newFiles) {
            // Validate file type if specified
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

            const fileId = `${file.name}-${Date.now()}`;

            // Add file to uploading state
            setUploadingFiles(prev => {
                const updated = new Map(prev);
                updated.set(fileId, {
                    file,
                    progress: 0,
                    status: 'uploading',
                });
                return updated;
            });

            // Generate unique path for the file
            const timestamp = Date.now();
            const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const filePath = `${uploadPath}/${accountId}/${timestamp}-${sanitizedName}`;

            try {
                // Upload the file
                const result = await signAndUploadFile(
                    file,
                    filePath,
                    accountId,
                    keyId,
                    secretKey,
                    {
                        maxSize,
                        cdnUrl: '/api/upload', // Use local API endpoint
                        onProgress: (progress) => {
                            setUploadingFiles(prev => {
                                const updated = new Map(prev);
                                const fileData = updated.get(fileId);
                                if (fileData) {
                                    updated.set(fileId, { ...fileData, progress });
                                }
                                return updated;
                            });
                        },
                    }
                );

                if (result.success && result.url) {
                    // Update to success state
                    setUploadingFiles(prev => {
                        const updated = new Map(prev);
                        updated.set(fileId, {
                            file,
                            progress: 100,
                            status: 'success',
                            url: result.url,
                        });
                        return updated;
                    });

                    onUploadComplete?.(result.url, file);

                    // Remove from list after 3 seconds
                    setTimeout(() => {
                        setUploadingFiles(prev => {
                            const updated = new Map(prev);
                            updated.delete(fileId);
                            return updated;
                        });
                    }, 3000);
                } else {
                    throw new Error(result.error || 'Upload failed');
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';

                // Update to error state
                setUploadingFiles(prev => {
                    const updated = new Map(prev);
                    updated.set(fileId, {
                        file,
                        progress: 0,
                        status: 'error',
                        error: errorMessage,
                    });
                    return updated;
                });

                onUploadError?.(errorMessage, file);
            }
        }
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

    const removeFile = (fileId: string) => {
        setUploadingFiles(prev => {
            const updated = new Map(prev);
            updated.delete(fileId);
            return updated;
        });
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
            {uploadingFiles.size > 0 && (
                <div className="space-y-2">
                    {Array.from(uploadingFiles.entries()).map(([fileId, uploadFile]) => (
                        <div
                            key={fileId}
                            className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium truncate">{uploadFile.file.name}</p>
                                    <div className="flex items-center gap-2">
                                        {uploadFile.status === 'uploading' && (
                                            <span className="text-xs text-muted-foreground">
                                                {uploadFile.progress.toFixed(0)}%
                                            </span>
                                        )}
                                        {uploadFile.status === 'success' && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                        {uploadFile.status === 'error' && (
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => removeFile(fileId)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                {uploadFile.status === 'uploading' && (
                                    <Progress value={uploadFile.progress} className="h-1" />
                                )}
                                {uploadFile.status === 'error' && (
                                    <p className="text-xs text-destructive">{uploadFile.error}</p>
                                )}
                                {uploadFile.status === 'success' && (
                                    <p className="text-xs text-green-600">Upload complete</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
