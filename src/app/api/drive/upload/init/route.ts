import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from '@/lib/upload-client';
import type { UploadInitRequest, UploadInitResponse, UploadSignaturePayload } from '@/lib/upload-types';

// This should be stored securely in environment variables
const SECRET_KEY = process.env.UPLOAD_SECRET_KEY || 'your-secret-key-here';
const CDN_URL = process.env.CDN_URL || 'https://neupgroup.com/upload';

/**
 * Generate HMAC-SHA256 signature for the upload token
 */
async function createSignature(payload: UploadSignaturePayload, secretKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, data);
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { file_id, filename, size, mime, file_hash } = body as UploadInitRequest;

        // 1. Validate Input
        if (!file_id || !filename || !size || !mime || !file_hash) {
            return NextResponse.json(
                { error: 'Missing required metadata' },
                { status: 400 }
            );
        }

        // 2. Validate Authorization & Quota (Mocked)
        // In a real app:
        // - Get user session
        // - Check if user has permission to upload
        // - Check if user has enough storage quota
        // - Validate file type against allowed policy
        const userId = 'demo-user-123'; // Mocked user ID
        
        // 3. Generate Upload Session & Token
        const upload_session_id = crypto.randomUUID();
        const timestamp = Date.now();
        const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const destination_path = `uploads/${userId}/${timestamp}-${sanitizedName}`;
        const expires_at = Math.floor(Date.now() / 1000) + (15 * 60); // 15 minutes expiration

        const payload: UploadSignaturePayload = {
            path: destination_path,
            account_id: userId,
            method: 'PUT',
            max_size: size, // Strict size limit matching exact file size
            content_type: mime,
            expires_at,
            nonce: generateNonce(),
            key_id: 'demo-key', // Should come from config
        };

        const signature = await createSignature(payload, SECRET_KEY);

        const response: UploadInitResponse = {
            upload_session_id,
            destination_path,
            upload_endpoint: CDN_URL,
            signed_upload_token: {
                payload,
                signature
            },
            expires_at
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Upload init error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
