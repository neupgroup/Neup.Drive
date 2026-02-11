'use client';

import { FileUpload } from '@/components/prodrive/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function WebDiskUploadPage() {
    // Demo credentials - in a real app these would come from an authenticated session
    const accountId = 'demo-account';
    const keyId = 'demo-key';
    const secretKey = process.env.NEXT_PUBLIC_UPLOAD_SECRET || 'demo-secret-key';
    const cdnUrl = 'https://neupcdn.com/upload';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight mb-2">
                    WebDisk Upload
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
                        uploadPath="webdisk"
                        cdnUrl={cdnUrl}
                        onUploadComplete={(url, file) => {
                            console.log('✅ Upload complete:', {
                                url,
                                fileName: file.name,
                            });
                            // You might want to show a toast notification here
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
        </div>
    );
}
