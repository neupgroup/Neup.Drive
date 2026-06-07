import { NextRequest, NextResponse } from 'next/server';

import {
    BRIDGE_PRIVATE_KEY,
    createBridgeFileUrl,
    createBridgeViewToken,
    findBridgeFile,
    getBridgeOwner,
    getDetails,
    getParam,
} from '@/lib/bridge-api';
import { handleServerError } from '@/lib/error-server';

export async function GET(request: NextRequest) {
    try {
        if (!BRIDGE_PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const owner = getBridgeOwner(request);
        const filefolderId = getParam(request, 'filefolder_id');
        const fileId = getParam(request, 'file_id');
        const filePath = getParam(request, 'path');
        const mode = getParam(request, 'mode') === 'download' ? 'download' : 'view';

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

        return NextResponse.json({
            success: true,
            filefolder_id: file.id,
            token: createBridgeViewToken(file, mode),
            expires_at: Math.floor(Date.now() / 1000) + 15 * 60,
            view_url: createBridgeFileUrl(file, 'view'),
            download_url: createBridgeFileUrl(file, 'download'),
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
