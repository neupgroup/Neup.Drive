import { NextRequest, NextResponse } from 'next/server';
import { validateUploadWithReplayProtection } from '@/lib/upload-server';
import type { UploadSignaturePayload } from '@/lib/upload-types';
import { handleServerError } from '@/lib/error-server';
import { parseFileFolderMode, recordFileFolderUpload } from '@/lib/filefolder';

// This should be stored securely in environment variables
const PUBLIC_KEY = process.env.UPLOAD_SECRET_PUBLIC_KEY || '';
const CDN_STORAGE_PATH = process.env.CDN_STORAGE_PATH || './uploads';

function parseUploadPayload(payloadStr: string): UploadSignaturePayload {
    try {
        return JSON.parse(payloadStr);
    } catch {
        const normalized = payloadStr.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(Buffer.from(normalized, 'base64').toString('utf8'));
    }
}

export async function POST(request: NextRequest) {
    try {
        const mode = parseFileFolderMode(request.nextUrl.searchParams.get('mode'));
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const payloadStr = formData.get('payload') as string;
        const signature = formData.get('signature') as string;

        if (!file || !payloadStr || !signature) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Parse payload
        const payload = parseUploadPayload(payloadStr);

        // Validate the upload request
        const validation = await validateUploadWithReplayProtection(
            payload,
            signature,
            PUBLIC_KEY,
            file.size
        );

        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 403 }
            );
        }

        // Validate content type matches
        if (file.type !== payload.content_type) {
            return NextResponse.json(
                { success: false, error: 'Content type mismatch' },
                { status: 400 }
            );
        }

        // In a real implementation, you would:
        // 1. Save the file to your CDN storage (S3, GCS, local filesystem, etc.)
        // 2. Use the payload.path as the storage location
        // 3. Return the URL where the file can be accessed

        // Example: Save to local filesystem (for development)
        // const fs = require('fs').promises;
        // const path = require('path');
        // const filePath = path.join(CDN_STORAGE_PATH, payload.path);
        // const arrayBuffer = await file.arrayBuffer();
        // await fs.writeFile(filePath, Buffer.from(arrayBuffer));

        // For now, we'll simulate a successful upload
        const fileUrl = `https://neupcdn.com/${payload.path}`;
        const apiResponse = {
            success: true,
            url: fileUrl,
            message: 'File uploaded successfully',
        };

        await recordFileFolderUpload({
            name: file.name,
            path: payload.path,
            mimeType: file.type || payload.content_type,
            owner: payload.account_id,
            size: file.size,
            mode,
            details: {
                upload_payload: payload as any,
                api_response: apiResponse,
            },
        });

        return NextResponse.json(apiResponse);
    } catch (error) {
        return handleServerError(error, 'api/upload:POST');
    }
}

// Optional: Handle direct PUT requests
export async function PUT(request: NextRequest) {
    try {
        const mode = parseFileFolderMode(request.nextUrl.searchParams.get('mode'));
        // Extract signature and payload from headers
        const signature = request.headers.get('x-upload-signature');
        const payloadStr = request.headers.get('x-upload-payload');

        if (!signature || !payloadStr) {
            return NextResponse.json(
                { success: false, error: 'Missing signature or payload headers' },
                { status: 400 }
            );
        }

        const payload = parseUploadPayload(payloadStr);
        const contentLength = parseInt(request.headers.get('content-length') || '0');

        // Validate the upload request
        const validation = await validateUploadWithReplayProtection(
            payload,
            signature,
            PUBLIC_KEY,
            contentLength
        );

        if (!validation.valid) {
            return NextResponse.json(
                { success: false, error: validation.error },
                { status: 403 }
            );
        }

        // Get file data from request body
        const arrayBuffer = await request.arrayBuffer();

        // Save file to storage
        // Implementation depends on your storage solution
        const fileUrl = `https://neupcdn.com/${payload.path}`;
        const apiResponse = {
            success: true,
            url: fileUrl,
            message: 'File uploaded successfully',
        };

        await recordFileFolderUpload({
            name: payload.path.split('/').pop() || payload.path,
            path: payload.path,
            mimeType: payload.content_type,
            owner: payload.account_id,
            size: contentLength,
            mode,
            details: {
                upload_payload: payload as any,
                api_response: apiResponse,
            },
        });

        return NextResponse.json(apiResponse);
    } catch (error) {
        return handleServerError(error, 'api/upload:PUT');
    }
}
