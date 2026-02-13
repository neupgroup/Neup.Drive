'use client';

import * as React from 'react';
import { FileUpload } from '@/components/prodrive/file-upload';
import { FileList } from '@/components/prodrive/file-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadPage() {
    // Demo credentials - in a real app these would come from an authenticated session
    const accountId = 'demo-account';
    const keyId = 'demo-key';
    const secretKey = process.env.NEXT_PUBLIC_UPLOAD_SECRET || 'demo-secret-key';
    // Use environment variable for CDN URL, fallback to localhost for development
    const cdnUrl = process.env.NEXT_PUBLIC_CDN_UPLOAD_URL || 'https://neupcdn.com/upload';

    const [refreshTrigger, setRefreshTrigger] = React.useState(0);

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

            <Card>
                <CardHeader>
                    <CardTitle>Upload Files</CardTitle>
                    <CardDescription>
                        Files will be uploaded to {cdnUrl}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUpload
                        accountId={accountId}
                        keyId={keyId}
                        secretKey={secretKey}
                        uploadPath="uploads"
                        cdnUrl={cdnUrl}
                        onUploadComplete={(url, file) => {
                            console.log('✅ Upload complete:', {
                                url,
                                fileName: file.name,
                            });
                            // Trigger file list refresh
                            setRefreshTrigger(prev => prev + 1);
                        }}
                        onUploadError={(error, file) => {
                            console.error('❌ Upload error:', {
                                error,
                                fileName: file.name,
                            });
                        }}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Files</CardTitle>
                    <CardDescription>
                        Files stored in the database
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FileList refreshTrigger={refreshTrigger} />
                </CardContent>
            </Card>
        </div>
    );
}
