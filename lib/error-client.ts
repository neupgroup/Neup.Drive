import { toast } from '@/core/hooks/use-toast';
import { ErrorType, identifyError } from './error-types';

type ErrorContext = {
    status?: number;
    response?: unknown;
    apiResponse?: unknown;
    cdnResponse?: unknown;
    [key: string]: unknown;
};

function getResponseFromContext(context: ErrorContext) {
    return context.response ?? context.apiResponse ?? context.cdnResponse;
}

function getAttachedStatus(error: any) {
    return typeof error?.status === 'number' ? error.status : undefined;
}

function getAttachedResponse(error: any) {
    return error?.response ?? error?.apiResponse ?? error?.cdnResponse;
}

function extractResponseErrorCode(response: unknown): string | undefined {
    if (!response || typeof response !== 'object') return undefined;
    const maybeResponse = response as { error?: unknown; code?: unknown; message?: unknown };
    if (typeof maybeResponse.error === 'string' && maybeResponse.error) return maybeResponse.error;
    if (typeof maybeResponse.code === 'string' && maybeResponse.code) return maybeResponse.code;
    if (typeof maybeResponse.code === 'number') return String(maybeResponse.code);
    if (typeof maybeResponse.message === 'string' && maybeResponse.message) return maybeResponse.message;
    return undefined;
}

function isNotFoundError(error: any, context: ErrorContext, response: unknown) {
    if (context.status === 404 || getAttachedStatus(error) === 404) return true;
    const message = error instanceof Error ? error.message : String(error);
    const responseCode = extractResponseErrorCode(response);

    return (
        message.includes('404') ||
        message.toLowerCase().includes('not found') ||
        responseCode === '404_not_found' ||
        responseCode === 'not_found'
    );
}

function isChunkUploadError(onPage: string, error: any, context: ErrorContext, status?: number) {
    const message = error instanceof Error ? error.message : String(error);
    return (
        onPage === 'FileUpload:Uploading' ||
        context.stage === 'chunk_upload' ||
        status === 413 ||
        message.includes('upload_failed_413')
    );
}

/**
 * Handles client-side errors
 */
export async function handleClientError(error: any, onPage: string, context: ErrorContext = {}) {
    const errorType = identifyError(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const response = getResponseFromContext(context) ?? getAttachedResponse(error);
    const status = context.status ?? getAttachedStatus(error);
    const chunkUploadError = isChunkUploadError(onPage, error, context, status);

    if (!chunkUploadError) {
        console.error(`[Client: ${onPage}] ${errorType}: ${errorMessage}`, {
            error,
            status,
            context,
            response,
        });
    }

    // Try to notify the server about this client error
    if (!chunkUploadError) {
        try {
            await fetch('/bridge/api.v1/log-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    on_page: onPage,
                    context: {
                        type: errorType,
                        message: errorMessage,
                        status,
                        response,
                        ...context
                    }
                }),
            });
        } catch (e) {
            console.error('Failed to report client error to server:', e);
        }
    }

    if (chunkUploadError) {
        const uploadErrorMessage = 'Wait a while, something went wrong. The error has been reported to the management.';
        console.log(uploadErrorMessage);
        toast({
            variant: 'destructive',
            title: 'Wait a while, something went wrong.',
            description: 'The error has been reported to the management.',
        });
        return uploadErrorMessage;
    }

    if (isNotFoundError(error, { ...context, status }, response)) {
        toast({
            variant: 'destructive',
            title: 'Not found',
            description: 'The requested item was not found.',
        });
        return 'The requested item was not found.';
    }

    toast({
        variant: 'destructive',
        title: 'Something went wrong.',
        description: 'The team has been notified.',
    });
    return 'Something went wrong. The team has been notified.';
}
