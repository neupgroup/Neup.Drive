import { NextRequest, NextResponse } from 'next/server';
import nodeCrypto from 'node:crypto';
import { generateNonce } from '@/lib/upload-client';
import type { UploadInitRequest, UploadInitResponse, UploadSignaturePayload } from '@/lib/upload-types';
import { prisma } from '@/lib/db';
import { handleServerError } from '@/lib/error-server';

// This should be stored securely in environment variables
const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
// Production CDN URL
const CDN_URL = process.env.CDN_UPLOAD_URL || 'https://neupcdn.com/upload';

/**
 * Generate Ed25519 signature for the upload token
 */
/**
 * Generate Ed25519 signature using Node.js native crypto
 */
async function createSignature(payloadBase64: string, privateKeyHex: string): Promise<string> {
    const data = payloadBase64; // Sign the raw base64 string directly for consistency

    // Convert hex string to Buffer
    const privateKeyBytes = Buffer.from(privateKeyHex, 'hex');

    let dBuffer: Buffer;
    let xBuffer: Buffer | undefined;

    // Handle 64-byte key (32-byte seed + 32-byte public key)
    if (privateKeyBytes.length === 64) {
        dBuffer = privateKeyBytes.subarray(0, 32);
        xBuffer = privateKeyBytes.subarray(32, 64);
    } else if (privateKeyBytes.length === 32) {
        dBuffer = privateKeyBytes;
        // Fallback for 32-byte keys (missing x)
    } else {
        throw new Error(`Invalid private key length: ${privateKeyBytes.length} bytes. Expected 64 bytes (seed+pub) or 32 bytes.`);
    }

    try {
        // Helper for Base64URL
        const toBase64Url = (buf: Buffer) => buf.toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        const jwk: any = {
            kty: "OKP",
            crv: "Ed25519",
            d: toBase64Url(dBuffer)
        };

        // Add public key 'x' if available (Node.js may require it)
        if (xBuffer) {
            jwk.x = toBase64Url(xBuffer);
        }

        const privateKey = nodeCrypto.createPrivateKey({
            key: jwk,
            format: 'jwk'
        });

        // Sign data (null algorithm for Ed25519)
        const signature = nodeCrypto.sign(null, Buffer.from(data), privateKey);

        return signature.toString('hex');
    } catch (error) {
        console.error('❌ Ed25519 signing error:', error);
        throw new Error(`Ed25519 signing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}

export async function POST(request: NextRequest) {
    let body: any;
    try {
        // Validate private key exists
        if (!PRIVATE_KEY) {
            console.error('❌ UPLOAD_SECRET_PRIVATE_KEY is not configured');
            return NextResponse.json(
                { error: 'Server configuration error: Missing private key' },
                { status: 500 }
            );
        }

        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }
        const { file_id, filename, size, mime, file_hash } = body as UploadInitRequest;

        console.log('📤 Upload init request:', { file_id, filename, size, mime });

        // 1. Validate Input
        if (!file_id || !filename || !size || !mime || !file_hash) {
            console.error('❌ Missing required metadata:', { file_id, filename, size, mime, file_hash });
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

        // Create Base64URL encoded payload string
        const payloadStr = JSON.stringify(payload);
        const payloadBase64 = Buffer.from(payloadStr).toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');

        console.log('📝 Payload Base64:', payloadBase64);
        console.log('🔐 Signing payload...');

        // Sign the Base64 string directly
        const signature = await createSignature(payloadBase64, PRIVATE_KEY);
        console.log('✅ Signature created successfully');

        const response: UploadInitResponse = {
            upload_session_id,
            destination_path,
            upload_endpoint: CDN_URL,
            signed_upload_token: {
                payload: payloadBase64, // Send Base64 string
                signature
            },
            expires_at
        };

        return NextResponse.json(response);

    } catch (error) {
        return handleServerError(error, 'api/drive/upload/init', { body: body ? { ...body, file_hash: 'REDACTED' } : undefined });
    }
}
