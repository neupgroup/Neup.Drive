/*
::neup.documentation::error-log-report-route
::api POST /bridge/api.v1/log-error
::title Record Error Log
::owner Neup Drive
::authentication none

::public

Records a client-reported application error for later debugging.

::param on_page
::location body
::datatype string
::required true

The page or component that reported the error.

::param context
::location body
::datatype object
::required true

The structured error details supplied by the client.

::response 200

The error was logged successfully.

::response 400

The request body is missing required fields.

::response 500

The server failed to record the error.

::public end

::private

Upload trace payloads are normalized into `system_error`; all other payloads are
forwarded to the shared `logToDatabase` helper.

::private end

::end
*/
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

/*
::neup.documentation::error-log-route
::api GET /bridge/api.v1/log-error
::title List Error Logs
::owner Neup Drive
::authentication none

::public

Returns paginated application error logs ordered from newest to oldest.

::param page
::location query
::datatype number
::required false
::default 1

The 1-based page number to fetch.

::param pagesize
::location query
::datatype number
::required false
::default 10

The number of error records to include per page. Valid values range from 10 to
100; out-of-range values are ignored and default to 10.

::response 200

Paginated error logs were returned successfully.

::response 500

The server failed to load the error logs.

::public end

::private

The route clamps invalid query values and uses Prisma `findMany` plus `count`
to return page metadata alongside the error records.

::private end

::end
*/
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const rawPage = Number(searchParams.get('page') ?? '1');
        const rawPageSize = Number(
            searchParams.get('pagesize')
            ?? searchParams.get('pageSize')
            ?? '10'
        );
        const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
        const normalizedPageSize = Number.isFinite(rawPageSize) ? Math.floor(rawPageSize) : 10;
        const pageSize = normalizedPageSize >= 10 && normalizedPageSize <= 100
            ? normalizedPageSize
            : 10;
        const total = await prisma.errorLog.count();
        const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
        const currentPage = Math.min(page, totalPages);
        const skip = (currentPage - 1) * pageSize;
        const items = await prisma.errorLog.findMany({
            orderBy: {
                created_on: 'desc'
            },
            skip,
            take: pageSize
        });

        return NextResponse.json({
            items,
            page: currentPage,
            pageSize,
            total,
            totalPages
        });
    } catch (error) {
        console.error('Failed to fetch error logs:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
