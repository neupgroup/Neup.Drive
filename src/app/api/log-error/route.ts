import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logToDatabase } from '@/lib/error-server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { on_page, context } = body;

        if (!on_page || !context) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const errorMessage = typeof context?.message === 'string' ? context.message : 'Client Error Reported';
        const errorType = typeof context?.type === 'string' ? context.type : 'UNKNOWN';
        const clientError = new Error(errorMessage) as Error & { code?: string };
        clientError.code = errorType;

        // Preserve the client-reported error type/message so logs are usable.
        await logToDatabase(clientError, JSON.stringify(context), on_page);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Critical error in log-error API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const logs = await prisma.errorLog.findMany({
            orderBy: {
                created_on: 'desc'
            },
            take: 100 // Limit to last 100 errors
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Failed to fetch error logs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
