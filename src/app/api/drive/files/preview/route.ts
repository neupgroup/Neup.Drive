import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@prisma/client';

import { createExpiringOperationPayload, createSignedCdnToken, encodeSignedCdnToken } from '@/lib/cdn-token';
import { prisma } from '@/lib/db';
import { handleServerError } from '@/lib/error-server';

const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
const CDN_BASE_URL = (process.env.CDN_BASE_URL || process.env.CDN_HOST || 'http://localhost:3001').replace(/\/$/, '');

function getDetails(details: Prisma.JsonValue): Prisma.JsonObject {
    return details && typeof details === 'object' && !Array.isArray(details) ? details : {};
}

export async function GET(request: NextRequest) {
    try {
        if (!PRIVATE_KEY) {
            return NextResponse.json({ error: 'Server configuration error: Missing private key' }, { status: 500 });
        }

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

        const folderType = typeof details.mode === 'string' ? details.mode : 'drive';
        const signedToken = createSignedCdnToken(createExpiringOperationPayload({
            action: 'view',
            account_id: filefolder.owner,
            account_folder: filefolder.owner,
            folder_type: folderType,
            path: filefolder.path,
            method: 'GET',
        }), PRIVATE_KEY);
        const token = encodeSignedCdnToken(signedToken);

        return NextResponse.json({
            success: true,
            filefolder_id: filefolder.id,
            expires_at: Math.floor(Date.now() / 1000) + 15 * 60,
            view_url: `${CDN_BASE_URL}/api/files/view?token=${encodeURIComponent(token)}`,
        });
    } catch (error) {
        return handleServerError(error, 'api/drive/files/preview');
    }
}
