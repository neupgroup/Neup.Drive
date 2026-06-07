'use client';

import { FileUpload } from '@/components/prodrive/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadTestPage() {
    // In production, these should come from environment variables or API
    // NEVER expose secret keys in client code - this is for demonstration only
    const accountId = 'demo-account';
    const keyId = 'demo-key';
    const secretKey = process.env.NEXT_PUBLIC_UPLOAD_SECRET || 'demo-secret-key';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight mb-2">
                    File Upload Test
                </h1>
                <p className="text-muted-foreground">
                    Test the secure file upload system with signed requests
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Upload Files</CardTitle>
                    <CardDescription>
                        Drag and drop files or click to browse. Files are uploaded with HMAC-SHA256 signatures.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <FileUpload
                        accountId={accountId}
                        keyId={keyId}
                        secretKey={secretKey}
                        uploadPath="test-uploads"
                        maxSize={50 * 1024 * 1024} // 50MB
                        acceptedTypes={[
                            'image/jpeg',
                            'image/png',
                            'image/gif',
                            'application/pdf',
                            'text/plain',
                        ]}
                        onUploadComplete={(url, file) => {
                            console.log('✅ Upload complete:', {
                                url,
                                fileName: file.name,
                                fileSize: file.size,
                                fileType: file.type,
                            });
                        }}
                        onUploadError={(error) => {
                            console.log(error);
                        }}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Security Features</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>HMAC-SHA256 signature verification</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>Expiration timestamp validation (15 minutes)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>Nonce-based replay attack prevention</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>File size validation (client & server)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>Path sanitization (prevents directory traversal)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-primary">✓</span>
                            <span>Content type verification</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
                <CardHeader>
                    <CardTitle className="text-amber-900 dark:text-amber-100">
                        ⚠️ Security Warning
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="mb-2">
                        This is a demonstration page. In production:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Never expose secret keys in client-side code</li>
                        <li>Implement server-side signing endpoints</li>
                        <li>Use environment variables for sensitive data</li>
                        <li>Implement proper authentication and authorization</li>
                        <li>Add rate limiting to prevent abuse</li>
                        <li>Scan uploaded files for malware</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
