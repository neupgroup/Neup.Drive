import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleServerError } from '@/lib/error-server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { filename, path, uploaded_by, mimeType } = body;

        if (!filename || !path || !uploaded_by) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const record = await prisma.webDisk.create({
            data: {
                filename,
                path,
                mimeType: mimeType || 'application/octet-stream',
                uploaded_by,
                uploaded_on: new Date()
            }
        });

        return NextResponse.json({ success: true, id: record.id });
    } catch (error) {
        return handleServerError(error, '/api/webdisk/record', { method: 'POST' });
    }
}
