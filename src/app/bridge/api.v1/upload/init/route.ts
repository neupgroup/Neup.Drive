import { NextRequest, NextResponse } from 'next/server';

import {
    BRIDGE_PRIVATE_KEY,
    createBridgeUploadInit,
    getBridgeOwner,
    getParam,
} from '@/lib/bridge-api';
import { handleServerError } from '@/lib/error-server';

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
