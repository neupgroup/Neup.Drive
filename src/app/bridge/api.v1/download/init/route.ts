import { NextRequest, NextResponse } from 'next/server';

import {
    BRIDGE_PRIVATE_KEY,
    createBridgeFileUrl,
    createBridgeViewToken,
    findBridgeFile,
    getBridgeOwner,
    getDetails,
    getFolderType,
    getParam,
    getRequestDeviceIp,
} from '@/lib/bridge-api';
import { parseDurationSeconds } from '@/lib/cdn-token';
import { handleServerError } from '@/lib/error-server';

export async function GET(request: NextRequest) {
    try {
        const owner = getBridgeOwner(request);
        const filefolderId = getParam(request, 'filefolder_id');
        const fileId = getParam(request, 'file_id');
        const filePath = getParam(request, 'path');
        const mode = getParam(request, 'mode') === 'download' ? 'download' : 'view';
        const expiresIn = getParam(request, 'expires_in') || getParam(request, 'expires');

        if (!filefolderId && !fileId && !filePath) {
            return NextResponse.json({ error: 'filefolder_id, file_id, or path is required' }, { status: 400 });
        }

        const file = await findBridgeFile({ owner, filefolderId, fileId, filePath });
        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const details = getDetails(file.details);
        if (details.status === 'DELETED') {
            return NextResponse.json({ error: 'File is deleted' }, { status: 410 });
        }

        const folderType = getFolderType(file);
        if (folderType !== 'assets' && !BRIDGE_PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const expiresInSeconds = parseDurationSeconds(expiresIn, {
            min: 60,
            max: folderType === 'private' ? 60 * 60 : 24 * 60 * 60,
            fallback: 15 * 60,
        });
        const tokenOptions = {
            expiresInSeconds,
            deviceIp: getParam(request, 'device_ip') || getRequestDeviceIp(request),
            userAgent: getParam(request, 'user_agent') || request.headers.get('user-agent') || '',
        };

        return NextResponse.json({
            success: true,
            filefolder_id: file.id,
            token: folderType === 'assets' ? null : createBridgeViewToken(file, mode, tokenOptions),
            expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
            view_url: createBridgeFileUrl(file, 'view', { ...tokenOptions, expiresIn }),
            download_url: createBridgeFileUrl(file, 'download', { ...tokenOptions, expiresIn }),
            file: {
                id: file.id,
                name: file.name,
                path: file.path,
                size: Number(file.size),
                owner: file.owner,
                details: file.details,
            },
        });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/download/init');
    }
}
