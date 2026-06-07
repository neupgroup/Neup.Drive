import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleServerError } from '@/lib/error-server';

// Base URL for serving files. In production, this would be your CDN domain.
const CDN_HOST = process.env.CDN_HOST || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    try {
        const userId = 'demo-user-123'; // Mocked user ID

        const files = await prisma.fileFolder.findMany({
            where: {
                owner: userId,
                details: {
                    path: ['mode'],
                    equals: 'drive',
                },
            },
            orderBy: {
                created_on: 'desc'
            }
        });

        // Map files to include full URL and handle BigInt
        const visibleFiles = files.filter((file) => {
            const details = typeof file.details === 'object' && file.details && !Array.isArray(file.details) ? file.details : {};
            return details.status !== 'DELETED';
        });

        const mappedFiles = visibleFiles.map(file => ({
            id: file.id,
            name: file.name,
            size: Number(file.size), // Convert BigInt to Number for JSON
            mimeType: typeof file.details === 'object' && file.details && !Array.isArray(file.details) && typeof file.details.mimeType === 'string'
                ? file.details.mimeType
                : 'application/octet-stream',
            path: file.path,
            status: typeof file.details === 'object' && file.details && !Array.isArray(file.details) && typeof file.details.status === 'string'
                ? file.details.status
                : 'PENDING',
            userId,
            createdAt: file.created_on,
            updatedAt: file.updated_on,
            url: `${CDN_HOST}/${file.path}`,
            details: file.details,
        }));

        return NextResponse.json(mappedFiles);
    } catch (error) {
        return handleServerError(error, 'api/drive/files');
    }
}
