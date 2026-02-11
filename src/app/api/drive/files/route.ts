import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Base URL for serving files. In production, this would be your CDN domain.
const CDN_HOST = process.env.CDN_HOST || 'http://localhost:3001';

export async function GET(request: NextRequest) {
    try {
        const userId = 'demo-user-123'; // Mocked user ID

        const files = await prisma.file.findMany({
            where: {
                userId: userId,
                status: 'VERIFIED'
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Map files to include full URL and handle BigInt
        const mappedFiles = files.map(file => ({
            ...file,
            size: Number(file.size), // Convert BigInt to Number for JSON
            url: `${CDN_HOST}/${file.path}`
        }));

        return NextResponse.json(mappedFiles);
    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
