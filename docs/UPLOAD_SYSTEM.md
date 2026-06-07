# File Upload System with Signed Requests

This implementation provides a secure file upload system using HMAC-SHA256 signatures to authenticate upload requests to `neupcdn.com/upload`.

## Architecture

### 1. **Client-Side** (`upload-client.ts`)
- Generates signed upload requests
- Creates HMAC-SHA256 signatures
- Handles file uploads with progress tracking
- Validates file size and expiration before upload

### 2. **Server-Side** (`upload-server.ts`)
- Verifies upload signatures
- Validates request parameters
- Prevents replay attacks using nonces
- Sanitizes file paths

### 3. **API Route** (`/bridge/api.v1/upload/init`)
- Handles POST and PUT upload requests
- Validates signatures and payloads
- Stores files to CDN storage
- Returns file URLs

### 4. **React Component** (`file-upload.tsx`)
- Drag-and-drop file upload interface
- Real-time progress tracking
- Visual feedback for upload status
- File type and size validation

## Setup

### 1. Environment Variables

Add to your `.env.local`:

```env
UPLOAD_SECRET_KEY=your-secure-secret-key-here
CDN_STORAGE_PATH=./uploads
```

### 2. Generate Secret Key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Usage

### Basic Upload Component

```tsx
import { FileUpload } from '@/components/prodrive/file-upload';

export default function UploadPage() {
  return (
    <FileUpload
      accountId="user-123"
      keyId="key-abc"
      secretKey={process.env.NEXT_PUBLIC_UPLOAD_SECRET!}
      uploadPath="user-uploads"
      maxSize={50 * 1024 * 1024} // 50MB
      acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
      onUploadComplete={(url, file) => {
        console.log('Upload complete:', url, file.name);
      }}
      onUploadError={(error, file) => {
        console.error('Upload error:', error, file.name);
      }}
    />
  );
}
```

### Manual Upload with Signing

```tsx
import { signAndUploadFile } from '@/lib/upload-client';

async function uploadFile(file: File) {
  const result = await signAndUploadFile(
    file,
    `uploads/user-123/${file.name}`,
    'user-123',
    'key-abc',
    'your-secret-key',
    {
      maxSize: 100 * 1024 * 1024,
      expiresInMinutes: 15,
      cdnUrl: '/bridge/api.v1/upload/init',
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
      },
    }
  );

  if (result.success) {
    console.log('File uploaded to:', result.url);
  } else {
    console.error('Upload failed:', result.error);
  }
}
```

### Server-Side Validation

```tsx
import { validateUploadWithReplayProtection } from '@/lib/upload-server';

// In your API route
const validation = await validateUploadWithReplayProtection(
  payload,
  signature,
  secretKey,
  fileSize
);

if (!validation.valid) {
  return Response.json({ error: validation.error }, { status: 403 });
}
```

## Signature Payload Structure

```typescript
{
  path: "uploads/user-123/document.pdf",
  account_id: "user-123",
  method: "PUT",
  max_size: 104857600, // 100MB in bytes
  content_type: "application/pdf",
  expires_at: 1705420800, // Unix timestamp
  nonce: "a1b2c3d4...", // Random 64-char hex string
  key_id: "key-abc"
}
```

## Security Features

### 1. **HMAC-SHA256 Signatures**
- Cryptographically secure request signing
- Prevents tampering with upload parameters

### 2. **Expiration Timestamps**
- Signatures expire after specified time (default: 15 minutes)
- Prevents use of old signatures

### 3. **Nonce-Based Replay Protection**
- Each signature includes a unique nonce
- Server tracks used nonces to prevent replay attacks

### 4. **File Size Validation**
- Client and server validate file sizes
- Prevents oversized uploads

### 5. **Path Sanitization**
- Prevents directory traversal attacks
- Validates file paths on server

### 6. **Content Type Verification**
- Ensures uploaded file matches declared type
- Prevents MIME type spoofing

## Implementation Notes

### Nonce Storage

The current implementation includes placeholder functions for nonce storage:

```typescript
// TODO: Implement with your database
export async function storeNonce(nonce: string, expiresAt: number): Promise<void>
export async function isNonceUsed(nonce: string): Promise<boolean>
```

Implement these using your preferred database (PostgreSQL, Redis, etc.):

```typescript
// Example with Redis
import { redis } from '@/lib/redis';

export async function storeNonce(nonce: string, expiresAt: number): Promise<void> {
  const ttl = expiresAt - Math.floor(Date.now() / 1000);
  await redis.setex(`nonce:${nonce}`, ttl, '1');
}

export async function isNonceUsed(nonce: string): Promise<boolean> {
  const exists = await redis.exists(`nonce:${nonce}`);
  return exists === 1;
}
```

### File Storage

The API route includes a placeholder for file storage. Implement based on your needs:

```typescript
// Example with AWS S3
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

await s3.send(new PutObjectCommand({
  Bucket: 'your-bucket',
  Key: payload.path,
  Body: Buffer.from(arrayBuffer),
  ContentType: payload.content_type,
}));
```

## Testing

### Test Upload Signature

```bash
curl -X GET http://localhost:3000/bridge/api.v1/upload/init \
  -F "file=@test.pdf" \
  -F "payload={...}" \
  -F "signature=abc123..."
```

## Best Practices

1. **Never expose secret keys in client code**
   - Use server-side signing for production
   - Client-side signing is for demonstration only

2. **Implement rate limiting**
   - Prevent abuse of upload endpoint
   - Use IP-based or account-based limits

3. **Scan uploaded files**
   - Implement virus scanning
   - Validate file contents match declared type

4. **Use HTTPS only**
   - Encrypt all upload traffic
   - Prevent man-in-the-middle attacks

5. **Monitor upload activity**
   - Log all upload attempts
   - Alert on suspicious patterns

## License

MIT
