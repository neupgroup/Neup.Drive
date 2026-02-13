import { ErrorType, identifyError, GENERIC_ERROR_MESSAGE } from './error-types';

/**
 * Handles client-side errors
 */
export async function handleClientError(error: any, onPage: string, context: any = {}) {
    const errorType = identifyError(error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[Client: ${onPage}] ${errorType}: ${errorMessage}`, { error, context });

    // Try to notify the server about this client error
    try {
        await fetch('/api/log-error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                on_page: onPage,
                context: {
                    type: errorType,
                    message: errorMessage,
                    ...context
                }
            }),
        });
    } catch (e) {
        console.error('Failed to report client error to server:', e);
    }

    return GENERIC_ERROR_MESSAGE;
}
