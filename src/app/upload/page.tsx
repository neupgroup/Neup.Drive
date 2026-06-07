'use client';

import { FileUpload } from '@/components/prodrive/file-upload';

export default function UploadPage() {
    const accountId = 'demo-account';
    const keyId = 'demo-key';
    const secretKey = process.env.NEXT_PUBLIC_UPLOAD_SECRET || 'demo-secret-key';
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_UPLOAD_URL || 'https://neupcdn.com/upload';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight mb-2">
                    Upload Center
                </h1>
                <p className="text-muted-foreground">
                    Upload files directly to NeupCDN
                </p>
            </div>
            <FileUpload
                accountId={accountId}
                keyId={keyId}
                secretKey={secretKey}
                uploadPath="uploads"
                cdnUrl={cdnUrl}
                uploadMode="webdisk"
                onUploadComplete={async (url, file) => {
                    console.log('✅ Upload complete:', {
                        url,
                        fileName: file.name,
                    });

                    try {
                        await fetch('/api/webdisk/record', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                filename: file.name,
                                path: url,
                                mimeType: file.type,
                                size: file.size,
                                uploaded_by: 'Admin',
                            }),
                        });
                    } catch (e) {
                        console.error('Failed to record upload:', e);
                    }
                }}
                onUploadError={(error, file) => {
                    console.error('❌ Upload error:', {
                        error,
                        fileName: file.name,
                    });
                }}
            />
        </div>
    );
}
