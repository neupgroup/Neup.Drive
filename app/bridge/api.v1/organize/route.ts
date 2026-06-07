import { NextRequest, NextResponse } from 'next/server';

import {
    BRIDGE_PRIVATE_KEY,
    type BridgeOrganizeType,
    findBridgeFile,
    getBridgeOwner,
    getParam,
    organizeBridgeFile,
} from '@/core/lib/bridge-api';
import { handleServerError } from '@/core/lib/error-server';

function getOrganizeType(request: NextRequest): BridgeOrganizeType | null {
    const value = (
        request.headers.get('x-organize-type') ||
        getParam(request, 'organize_type') ||
        getParam(request, 'action') ||
        ''
    ).trim();

    if (value === 'rename' || value === 'move' || value === 'delete') return value;
    return null;
}

export async function GET(request: NextRequest) {
    try {
        if (!BRIDGE_PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const action = getOrganizeType(request);
        if (!action) {
            return NextResponse.json({ error: 'x-organize-type must be rename, move, or delete' }, { status: 400 });
        }

        const owner = getBridgeOwner(request);
        const filefolderId = getParam(request, 'filefolder_id');
        const fileId = getParam(request, 'file_id');
        const filePath = getParam(request, 'path');

        if (!filefolderId && !fileId && !filePath) {
            return NextResponse.json({ error: 'filefolder_id, file_id, or path is required' }, { status: 400 });
        }

        const file = await findBridgeFile({ owner, filefolderId, fileId, filePath });

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const { updatedFilefolder, cdnResult } = await organizeBridgeFile({
            filefolder: file,
            action,
            newName: getParam(request, 'new_name'),
            toFolderType: getParam(request, 'to_folder_type') || getParam(request, 'folder_type') || getParam(request, 'type'),
            destinationInternalPath: getParam(request, 'destination_internal_path') || getParam(request, 'destination_path'),
        });

        return NextResponse.json({
            success: true,
            action,
            file: {
                id: updatedFilefolder.id,
                name: updatedFilefolder.name,
                path: updatedFilefolder.path,
                type: updatedFilefolder.type,
                owner: updatedFilefolder.owner,
                size: Number(updatedFilefolder.size),
                details: updatedFilefolder.details,
            },
            cdn: cdnResult,
        });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/organize');
    }
}
