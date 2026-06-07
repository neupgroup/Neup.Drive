import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
import { generateNonce } from '@/core/lib/upload-client';
import type { UploadInitRequest, UploadInitResponse, UploadSignaturePayload } from '@/core/lib/upload-types';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { parseFileFolderMode, recordFileFolderUpload, webdiskStoredAs } from '@/core/lib/filefolder';
import { signCdnPayloadBase64 } from '@/core/lib/cdn-token';

// This should be stored securely in environment variables
const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
// Production CDN URL
const CDN_URL = process.env.CDN_UPLOAD_URL || 'https://neupcdn.com/upload';
const WEBDISK_TYPES = ['assets', 'private', 'signed'];

async function createSignature(payloadBase64: string, privateKeyHex: string): Promise<string> {
    return signCdnPayloadBase64(payloadBase64, privateKeyHex);
}

function normalizeWebdiskType(value: string | null) {
    const type = value?.trim() || 'assets';
    if (!WEBDISK_TYPES.includes(type)) {
        throw new Error('Invalid webdisk type');
    }
    return type;
}

function normalizeWebdiskPath(value: string | null) {
    const cleaned = (value || '').trim().replace(/^\/+/, '');
    if (!cleaned) return '';

    const normalized = path.posix.normalize(cleaned);
    if (normalized === '.' || normalized === '..' || normalized.startsWith('../') || path.posix.isAbsolute(normalized)) {
        throw new Error('Invalid webdisk path');
    }
    return normalized;
}

export async function POST(request: NextRequest) {
    let body: any;
    try {
        const mode = parseFileFolderMode(request.nextUrl.searchParams.get('mode'));
        const saveTo = request.nextUrl.searchParams.get('saveto');

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
        const destination_path = mode === 'webdisk' && saveTo === 'webdisk'
            ? path.posix.join(
                'uploads',
                userId,
                normalizeWebdiskType(request.nextUrl.searchParams.get('type')),
                normalizeWebdiskPath(request.nextUrl.searchParams.get('path')),
                `${timestamp}-${sanitizedName}`,
            )
            : `uploads/${userId}/${timestamp}-${sanitizedName}`;
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

        await recordFileFolderUpload({
            name: filename,
            path: destination_path,
            mimeType: mime,
            owner: userId,
            size,
            mode,
            storedAs: mode === 'drive' ? 'drivefile' : webdiskStoredAs(request.nextUrl.searchParams.get('type')),
            details: {
                file_id,
                file_hash,
                upload_session_id,
                destination_path,
                status: 'PENDING',
                api_response: response as any,
            },
        });

        return NextResponse.json(response);

    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/drive/upload/init', { body: body ? { ...body, file_hash: 'REDACTED' } : undefined });
    }
}
