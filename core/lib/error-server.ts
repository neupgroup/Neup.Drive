import { appendFileSync } from 'node:fs';
import { join } from 'node:path';
import { NextResponse } from 'next/server';
import { prisma } from './db';
import { ErrorType, identifyError, GENERIC_ERROR_MESSAGE } from './error-types';

const LOG_FILE_PATH = join(process.cwd(), 'errors.log');

/**
 * Log to errors.log file in the specified format
 */
export function logToFile(data: {
    timestamp: string;
    on_page: string;
    type: string;
    message: string;
    context: string;
    stack?: string;
    response?: unknown;
}) {
    const entry = `[${data.timestamp}]
page: ${data.on_page}
type: ${data.type}
message: ${data.message}
context: ${data.context}
${data.response !== undefined ? `response: ${JSON.stringify(data.response, null, 2)}\n` : ''}
${data.stack ? `stack: ${data.stack}` : ''}



`;

    try {
        appendFileSync(LOG_FILE_PATH, entry, 'utf8');
        console.log(`Successfully logged error to ${LOG_FILE_PATH}`);
    } catch (err) {
        console.error('FAILED TO WRITE TO LOG FILE:', err);
    }
}

/**
 * Log error to database if possible, otherwise fallback to file
 */
export async function logToDatabase(error: any, context: string, onPage: string) {
    const errorType = identifyError(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const timestamp = new Date().toISOString();
    let parsedContext: any = context;

    if (typeof context === 'string') {
        try {
            parsedContext = JSON.parse(context);
        } catch {
            parsedContext = { raw: context };
        }
    }

    const response = parsedContext && typeof parsedContext === 'object'
        ? parsedContext.response ?? parsedContext.apiResponse ?? parsedContext.cdnResponse
        : undefined;

    const logData = {
        type: errorType,
        originalError: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        context: parsedContext,
        response,
    };

    console.error(`[${onPage}] ${errorType}: ${errorMessage}`, logData);

    try {
        // Attempt to log to DB
        await prisma.errorLog.create({
            data: {
                on_page: onPage,
                context: JSON.stringify(logData),
            }
        });
    } catch (dbError) {
        console.error('Failed to log error to database, falling back to file:', dbError);

        // Final fallback: Log to file
        logToFile({
            timestamp,
            on_page: onPage,
            type: errorType,
            message: errorMessage,
            context: typeof context === 'string' ? context : JSON.stringify(context),
            stack: error instanceof Error ? error.stack : undefined,
            response,
        });
    }
}

/**
 * Handles server-side errors in API routes
 */
export async function handleServerError(error: any, onPage: string, context: any = {}) {
    await logToDatabase(error, JSON.stringify(context), onPage);

    return NextResponse.json(
        {
            error: GENERIC_ERROR_MESSAGE,
            type: identifyError(error)
        },
        { status: 500 }
    );
}
