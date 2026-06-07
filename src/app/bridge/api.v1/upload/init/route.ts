import { NextRequest, NextResponse } from 'next/server';

import {
    BRIDGE_PRIVATE_KEY,
    createBridgeUploadInit,
    DEFAULT_BRIDGE_OWNER,
    getBridgeOwner,
    getParam,
} from '@/lib/bridge-api';
import { handleServerError } from '@/lib/error-server';
import type { UploadInitRequest } from '@/lib/upload-types';

function getBodyValue(body: Partial<UploadInitRequest> & Record<string, unknown>, name: string) {
    const value = body[name];
    return typeof value === 'string' ? value : undefined;
}

function getBodyNumber(body: Partial<UploadInitRequest> & Record<string, unknown>, name: string) {
    const value = body[name];
    return typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
}

function getBridgeOwnerFromBody(request: NextRequest, body: Record<string, unknown>) {
    const bodyOwner = body.account_id || body.owner;
    return (typeof bodyOwner === 'string' && bodyOwner.trim() ? bodyOwner.trim() : getBridgeOwner(request)) || DEFAULT_BRIDGE_OWNER;
}

export async function GET(request: NextRequest) {
    try {
        if (!BRIDGE_PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const owner = getBridgeOwner(request);
        const fileId = getParam(request, 'file_id') || crypto.randomUUID();
        const filename = getParam(request, 'filename');
        const sizeValue = getParam(request, 'size');
        const mime = getParam(request, 'mime') || getParam(request, 'content_type') || 'application/octet-stream';
        const fileHash = getParam(request, 'file_hash') || getParam(request, 'hash');
        const folderType = getParam(request, 'folder_type') || getParam(request, 'type');
        const internalPath = getParam(request, 'path') || getParam(request, 'folder_path');

        const size = Number(sizeValue);
        if (!filename || !sizeValue || !Number.isFinite(size) || size <= 0 || !fileHash) {
            return NextResponse.json({
                error: 'filename, size, and file_hash are required',
            }, { status: 400 });
        }

        const response = await createBridgeUploadInit({
            owner,
            fileId,
            filename,
            size,
            mime,
            fileHash,
            folderType,
            internalPath,
        });

        return NextResponse.json({
            success: true,
            token: response.signed_upload_token,
            ...response,
        });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/upload/init');
    }
}

export async function POST(request: NextRequest) {
    let body: Record<string, unknown> = {};

    try {
        if (!BRIDGE_PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        try {
            body = await request.json();
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        const owner = getBridgeOwnerFromBody(request, body);
        const fileId = getBodyValue(body, 'file_id') || crypto.randomUUID();
        const filename = getBodyValue(body, 'filename');
        const size = getBodyNumber(body, 'size');
        const mime = getBodyValue(body, 'mime') || getBodyValue(body, 'content_type') || 'application/octet-stream';
        const fileHash = getBodyValue(body, 'file_hash') || getBodyValue(body, 'hash');
        const folderType = getParam(request, 'folder_type') || getParam(request, 'type') || getBodyValue(body, 'folder_type') || getBodyValue(body, 'type');
        const internalPath = getParam(request, 'path') || getParam(request, 'folder_path') || getBodyValue(body, 'path') || getBodyValue(body, 'folder_path');

        if (!filename || !Number.isFinite(size) || size <= 0 || !fileHash) {
            return NextResponse.json({
                error: 'filename, size, and file_hash are required',
            }, { status: 400 });
        }

        const response = await createBridgeUploadInit({
            owner,
            fileId,
            filename,
            size,
            mime,
            fileHash,
            folderType,
            internalPath,
        });

        return NextResponse.json({
            success: true,
            token: response.signed_upload_token,
            ...response,
        });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/upload/init', { body: { ...body, file_hash: 'REDACTED', hash: 'REDACTED' } });
    }
}
