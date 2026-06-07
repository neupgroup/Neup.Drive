'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { FileUpload } from '@/components/prodrive/file-upload';

const WEBDISK_TYPES = ['assets', 'private', 'signed'];

function normalizeWebdiskType(value: string | null) {
    return value && WEBDISK_TYPES.includes(value) ? value : 'assets';
}

function normalizeUploadPath(value: string | null) {
    return (value || '').trim().replace(/^\/+/, '');
}

function UploadContent() {
    const accountId = process.env.NEXT_PUBLIC_ACCOUNT_ID || 'demo-user-123';
    const keyId = 'demo-key';
    const secretKey = process.env.NEXT_PUBLIC_UPLOAD_SECRET || 'demo-secret-key';
    const searchParams = useSearchParams();
    const saveTo = searchParams.get('saveto');
    const webdiskType = normalizeWebdiskType(searchParams.get('type'));
    const webdiskPath = normalizeUploadPath(searchParams.get('path'));
    const uploadMode = saveTo === 'webdisk' ? 'webdisk' as const : 'drive' as const;
    const uploadInitEndpoint = React.useMemo(() => {
        const params = new URLSearchParams();
        params.set('folder_type', saveTo === 'webdisk' ? webdiskType : uploadMode);

        if (saveTo === 'webdisk') {
            params.set('saveto', 'webdisk');
            if (webdiskPath) params.set('path', webdiskPath);
        }

        return `/bridge/api.v1/upload/init?${params.toString()}`;
    }, [saveTo, uploadMode, webdiskPath, webdiskType]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight mb-2">
                    Upload Center
                </h1>
                <p className="text-muted-foreground">
                    {saveTo === 'webdisk'
                        ? `Uploading to WebDisk /${webdiskType}${webdiskPath ? `/${webdiskPath}` : ''}`
                        : 'Upload files directly to NeupCDN'}
                </p>
            </div>
            <FileUpload
                accountId={accountId}
                keyId={keyId}
                secretKey={secretKey}
                uploadPath="uploads"
                uploadMode={uploadMode}
                uploadInitEndpoint={uploadInitEndpoint}
                onUploadComplete={(url, file) => {
                    console.log('✅ Upload complete:', {
                        url,
                        fileName: file.name,
                    });
                }}
                onUploadError={(error) => {
                    console.log(error);
                }}
            />
        </div>
    );
}

export default function UploadPage() {
    return (
        <React.Suspense fallback={null}>
            <UploadContent />
        </React.Suspense>
    );
}
