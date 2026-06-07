import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleServerError } from '@/lib/error-server';

export async function GET() {
    try {
        const files = await prisma.fileFolder.findMany({
            where: {
                details: {
                    path: ['mode'],
                    equals: 'webdisk',
                },
            },
            orderBy: {
                created_on: 'desc'
            }
        });

        const mappedFiles = files.map(file => ({
            id: file.id,
            filename: file.name,
            path: file.path,
            mimeType: typeof file.details === 'object' && file.details && !Array.isArray(file.details) && typeof file.details.mimeType === 'string'
                ? file.details.mimeType
                : 'application/octet-stream',
            uploaded_by: file.owner,
            uploaded_on: file.created_on,
            size: Number(file.size),
            type: file.type,
            details: file.details,
        }));

        return NextResponse.json(mappedFiles);
    } catch (error) {
        return handleServerError(error, '/api/webdisk/files', { method: 'GET' });
    }
}
