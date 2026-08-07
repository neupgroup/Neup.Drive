/**
 * Error types that we want to specifically identify
 */
export enum ErrorType {
    DATABASE_NOT_SETUP = 'DATABASE_NOT_SETUP',
    DATABASE_READ_ONLY = 'DATABASE_READ_ONLY',
    CDN_UNREACHABLE = 'CDN_UNREACHABLE',
    CERTIFICATE_EXPIRED = 'CERTIFICATE_EXPIRED',
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',
    FOLDER_NOT_FOUND = '404_folder_not_found',
    UNKNOWN = 'UNKNOWN'
}

/**
 * Identify the type of error from its message or code
 */
export function identifyError(error: any): ErrorType {
    const message = error instanceof Error ? error.message : String(error);
    const code = error?.code;

    if (
        code === ErrorType.DATABASE_NOT_SETUP ||
        code === ErrorType.DATABASE_READ_ONLY ||
        code === ErrorType.CDN_UNREACHABLE ||
        code === ErrorType.CERTIFICATE_EXPIRED ||
        code === ErrorType.FILE_NOT_FOUND ||
        code === ErrorType.FOLDER_NOT_FOUND
    ) {
        return code;
    }

    if (
        message.includes('file_not_found') ||
        message.includes('File not found')
    ) {
        return ErrorType.FILE_NOT_FOUND;
    }

    if (
        message.includes('folder_not_found') ||
        message.includes('Folder not found')
    ) {
        return ErrorType.FOLDER_NOT_FOUND;
    }

    // Prisma Codes
    if (code === 'P1001' || code === 'P1002' || code === 'P1003' || message.includes('Can\'t reach database server')) {
        return ErrorType.DATABASE_NOT_SETUP;
    }

    // Read only errors
    if (message.includes('readonly') || message.includes('read-only') || message.includes('database is locked')) {
        return ErrorType.DATABASE_READ_ONLY;
    }

    // CDN errors
    if (message.includes('CDN unreachable') || message.includes('Network error during upload') || message.includes('Failed to fetch files')) {
        return ErrorType.CDN_UNREACHABLE;
    }

    // Certificate / TLS expiry errors
    if (
        message.includes('certificate expired') ||
        message.includes('x509: certificate has expired') ||
        message.includes('SSL certificate problem: certificate has expired') ||
        message.includes('tls: failed to verify certificate') ||
        message.includes('x509: certificate signed by unknown authority')
    ) {
        return ErrorType.CERTIFICATE_EXPIRED;
    }

    // Generic network/API errors
    if (message.includes('Failed to fetch') || message.includes('NetworkError') || message.includes('fetch failed')) {
        return ErrorType.UNKNOWN; // Or we could add API_ERROR
    }

    return ErrorType.UNKNOWN;
}

export const GENERIC_ERROR_MESSAGE = 'An internal error occurred. Our team has been notified and is working on a fix.';
