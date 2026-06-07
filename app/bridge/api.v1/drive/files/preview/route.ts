import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

import { createBridgeFileUrl, getFolderType, getParam, getRequestDeviceIp } from '@/core/lib/bridge-api';
import { parseDurationSeconds } from '@/core/lib/cdn-token';
import { prisma } from '@/core/lib/db';
import { handleServerError } from '@/core/lib/error-server';

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
        if (details.status === 'DELETED') {
            return NextResponse.json({ error: 'File is deleted' }, { status: 410 });
        }

        const folderType = getFolderType(filefolder);
        if (folderType !== 'assets' && !PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

        const expiresIn = getParam(request, 'expires_in') || getParam(request, 'expires');
        const expiresInSeconds = parseDurationSeconds(expiresIn, {
            min: 60,
            max: folderType === 'private' ? 60 * 60 : 24 * 60 * 60,
            fallback: 15 * 60,
        });

        return NextResponse.json({
            success: true,
            filefolder_id: filefolder.id,
            expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
            view_url: createBridgeFileUrl(filefolder, 'view', {
                expiresIn,
                expiresInSeconds,
                deviceIp: getParam(request, 'device_ip') || getRequestDeviceIp(request),
                userAgent: getParam(request, 'user_agent') || request.headers.get('user-agent') || '',
            }),
        });
    } catch (error) {
        return handleServerError(error, 'bridge/api.v1/drive/files/preview');
    }
}
