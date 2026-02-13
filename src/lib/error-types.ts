/**
 * Error types that we want to specifically identify
 */
export enum ErrorType {
    DATABASE_NOT_SETUP = 'DATABASE_NOT_SETUP',
    DATABASE_READ_ONLY = 'DATABASE_READ_ONLY',
    CDN_UNREACHABLE = 'CDN_UNREACHABLE',
    UNKNOWN = 'UNKNOWN'
}

/**
 * Identify the type of error from its message or code
 */
export function identifyError(error: any): ErrorType {
    const message = error instanceof Error ? error.message : String(error);
    const code = error?.code;

    // Prisma Codes
    if (code === 'P1001' || code === 'P1002' || code === 'P1003' || message.includes('Can\'t reach database server')) {
        return ErrorType.DATABASE_NOT_SETUP;
    }

    // Read only errors
    if (message.includes('readonly') || message.includes('read-only') || message.includes('database is locked')) {
        return ErrorType.DATABASE_READ_ONLY;
    }

    // CDN errors
    if (message.includes('CDN unreachable') || message.includes('Network error during upload') || message.includes('Failed to fetch')) {
        return ErrorType.CDN_UNREACHABLE;
    }

    return ErrorType.UNKNOWN;
}

export const GENERIC_ERROR_MESSAGE = 'An internal error occurred. Our team has been notified and is working on a fix.';
