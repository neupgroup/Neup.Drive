import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleServerError } from '@/lib/error-server';

export async function GET() {
    try {
        const files = await prisma.webDisk.findMany({
            orderBy: {
                uploaded_on: 'desc'
            }
        });

        return NextResponse.json(files);
    } catch (error) {
        return handleServerError(error, '/api/webdisk/files', { method: 'GET' });
    }
}
