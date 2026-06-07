import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/lib/db';
import { logToDatabase } from '@/core/lib/error-server';
import { identifyError } from '@/core/lib/error-types';

function getSystemErrorAccount(context: Record<string, unknown>) {
    const value = context.accountId || context.account_id || context.owner || context.uploaded_by || context.on_account;
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

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

        if (errorType === 'UPLOAD_TRACE') {
            const detailError = typeof context?.error === 'string' ? new Error(context.error) : clientError;
            const systemErrorType = identifyError(detailError);
            await prisma.systemError.create({
                data: {
                    on_account: getSystemErrorAccount(context),
                    type: systemErrorType,
                    log: errorMessage,
                    details: context,
                },
            });

            console.log(`Error happened of type "${systemErrorType}": ${errorMessage}`);
            return NextResponse.json({ success: true });
        }

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
