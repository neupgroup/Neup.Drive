import { NextRequest, NextResponse } from 'next/server';
import { generateNonce } from '@/lib/upload-client';
import type { UploadInitRequest, UploadInitResponse, UploadSignaturePayload } from '@/lib/upload-types';
import { prisma } from '@/lib/db';

// This should be stored securely in environment variables
const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
// Hardcoded CDN URL as per requirement
const CDN_URL = 'https://neupcdn.com/upload';

/**
 * Generate Ed25519 signature for the upload token
 */
async function createSignature(payload: UploadSignaturePayload, privateKeyHex: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    
    // Convert hex string to Uint8Array
    const privateKeyBytes = new Uint8Array(
        privateKeyHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
    );

    if (privateKeyBytes.length !== 32 && privateKeyBytes.length !== 64) {
        throw new Error("Invalid private key length");
    }

    const key = await crypto.subtle.importKey(
        'raw',
        privateKeyBytes,
        { name: 'Ed25519' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('Ed25519', key, data);
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
        
        // Ensure user exists (Mock logic)
        await prisma.user.upsert({
            where: { id: userId },
            create: { id: userId, email: 'demo@neupgroup.com', name: 'Demo User' },
            update: {},
        });

        // 3. Generate Upload Session & Token
        const upload_session_id = crypto.randomUUID();
        const timestamp = Date.now();
        const sanitizedName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
        const destination_path = `uploads/${userId}/${timestamp}-${sanitizedName}`;
        const expires_at = Math.floor(Date.now() / 1000) + (15 * 60); // 15 minutes expiration

        // Create Pending File Record
        await prisma.file.create({
            data: {
                name: filename,
                size: BigInt(size),
                mimeType: mime,
                hash: file_hash,
                path: destination_path,
                status: 'PENDING',
                userId: userId,
            }
        });

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

        const signature = await createSignature(payload, PRIVATE_KEY);

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
