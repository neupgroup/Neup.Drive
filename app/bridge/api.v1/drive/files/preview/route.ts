import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

import { createBridgeFileUrl, getFolderType, getParam, getRequestDeviceIp, isActiveFileDetails } from '@/core/lib/bridge-api';
import { parseDurationSeconds } from '@/core/lib/cdn-token';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';
import { appendBridgeFileAccessLog } from '@/core/lib/file-access-log';

/*
::neup.documentation::drive-files-preview-route
::api GET /bridge/api.v1/drive/files/preview
::title Drive File Preview Route

Returns a signed preview URL for a bridge-managed file.

::param filefolder_id
::location query

The file record to preview.

::details

Each successful preview request appends an audit entry to `uploads/<account>/.logs/2026jun25` so API-originated view access is preserved even before the viewer page renders.

::end
*/

const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';

function getDetails(details: Prisma.JsonValue): Prisma.JsonObject {
    return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
}

export async function GET(request: NextRequest) {
    try {
        const filefolderId = request.nextUrl.searchParams.get('filefolder_id');
        if (!filefolderId) {
            return NextResponse.json({ error: 'filefolder_id is required' }, { status: 400 });
        }

        const filefolder = await prisma.fileFolder.findUnique({
            where: { id: filefolderId },
        });

        if (!filefolder) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        const details = getDetails(filefolder.details);
        if (!isActiveFileDetails(filefolder.details)) {
            return NextResponse.json({ error: 'File is deleted' }, { status: 410 });
        }

        const folderType = getFolderType(filefolder);
        if (folderType !== 'assets' && !PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const expiresIn = getParam(request, 'expires_in') || getParam(request, 'expires');
        const expiresInSeconds = parseDurationSeconds(expiresIn, {
            min: 60,
            max: 24 * 60 * 60,
            fallback: 15 * 60,
        });

        const viewUrl = createBridgeFileUrl(filefolder, 'view', {
            expiresIn,
            expiresInSeconds,
            deviceIp: getParam(request, 'device_ip') || getRequestDeviceIp(request),
            userAgent: getParam(request, 'user_agent') || request.headers.get('user-agent') || '',
        });

        try {
            await appendBridgeFileAccessLog({
                owner: filefolder.owner,
                fileType: folderType,
                location: filefolder.path,
                sourcePage: request.headers.get('referer') || request.headers.get('origin') || 'bridge/api.v1/drive/files/preview',
                viewerInfo: {
                    filefolder_id: filefolder.id,
                    expires_in_seconds: expiresInSeconds,
                    device_ip: getParam(request, 'device_ip') || getRequestDeviceIp(request),
                    user_agent: getParam(request, 'user_agent') || request.headers.get('user-agent') || '',
                },
                action: 'preview_requested',
            });
        } catch {
            // A preview URL should still be returned if audit logging fails.
        }

        return NextResponse.json({
            success: true,
            filefolder_id: filefolder.id,
            expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
            view_url: viewUrl,
        });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/drive/files/preview');
    }
}
