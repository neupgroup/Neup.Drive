/*
::neup.documentation::drive-upload-init-route
::api POST /bridge/api.v1/drive/upload/init
::title Drive Upload Init Route
::owner Neup Drive

::public

Initializes Drive and WebDisk uploads and returns the signed CDN upload token.

::response 200

The upload token and destination metadata were created successfully.

::response 409

The requested WebDisk filename already exists in the target folder.

::private

Drive uploads now store a logical folder path in `filefolder.path` and a
separate randomized physical file path in `details.storage_path`.

::private end

::end
*/
import { NextRequest, NextResponse } from 'next/server';

import {
    BRIDGE_PRIVATE_KEY,
    createBridgeUploadInit,
    DEFAULT_BRIDGE_OWNER,
    getDuplicateWebdiskFilename,
    getBridgeOwner,
    isReservedWebdiskRootFolder,
    normalizeFolderType,
} from '@/core/lib/bridge-api';
import { handleServerError } from '@/core/lib/error-server';
import type { UploadInitRequest } from '@/core/lib/upload-types';

function getBodyValue(body: Partial<UploadInitRequest> & Record<string, unknown>, name: string) {
    const value = body[name];
    return typeof value === 'string' ? value : undefined;
}

function getBodyNumber(body: Partial<UploadInitRequest> & Record<string, unknown>, name: string) {
    const value = body[name];
    return typeof value === 'number' || typeof value === 'string' ? Number(value) : NaN;
}

function getOwnerFromBody(request: NextRequest, body: Record<string, unknown>) {
    const bodyOwner = body.account_id || body.owner;
    return (typeof bodyOwner === 'string' && bodyOwner.trim() ? bodyOwner.trim() : getBridgeOwner(request)) || DEFAULT_BRIDGE_OWNER;
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

        const owner = getOwnerFromBody(request, body);
        const fileId = getBodyValue(body, 'file_id') || crypto.randomUUID();
        const filename = getBodyValue(body, 'filename');
        const size = getBodyNumber(body, 'size');
        const mime = getBodyValue(body, 'mime') || 'application/octet-stream';
        const fileHash = getBodyValue(body, 'file_hash') || getBodyValue(body, 'hash');
        const requestedFolderType = request.nextUrl.searchParams.get('type') || getBodyValue(body, 'type') || 'drive';
        const requestedPath = request.nextUrl.searchParams.get('path') || getBodyValue(body, 'path');
        const folderType = normalizeFolderType(requestedFolderType);

        if (isReservedWebdiskRootFolder(folderType, requestedPath)) {
            return NextResponse.json({ error: 'The "signed" folder name is reserved at the top level of assets' }, { status: 400 });
        }

        if (!filename || !Number.isFinite(size) || size <= 0 || !fileHash) {
            return NextResponse.json({ error: 'filename, size, and file_hash are required' }, { status: 400 });
        }

        if (folderType !== 'drive') {
            const duplicate = await getDuplicateWebdiskFilename({
                owner,
                folderType,
                filename,
                internalPath: requestedPath,
            });
            if (duplicate) {
                return NextResponse.json({
                    success: false,
                    code: 'duplicate_webdisk_filename',
                    error: `A file named "${filename}" already exists in this WebDisk folder.`,
                    filename,
                    suggested_filename: duplicate.suggestedFilename,
                }, { status: 409 });
            }
        }

        const response = await createBridgeUploadInit({
            owner,
            fileId,
            filename,
            size,
            mime,
            fileHash,
            folderType,
            internalPath: requestedPath,
        });

        return NextResponse.json({
            success: true,
            token: response.signed_upload_token,
            ...response,
        }, { status: 200 });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/drive/upload/init', {
            body: { ...body, file_hash: 'REDACTED', hash: 'REDACTED' },
        });
    }
}
