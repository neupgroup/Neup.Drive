import type { UploadInitRequest, UploadInitResponse } from './upload-types';
import { logUploadTrace } from './upload-trace';

/**
 * Initialize upload session with server (Step 3)
 */
export async function initializeUpload(
    metadata: UploadInitRequest,
    apiEndpoint: string = '/bridge/api.v1/upload/init',
    options: { accountId?: string } = {}
): Promise<UploadInitResponse> {
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(options.accountId ? { 'x-account-id': options.accountId } : {}),
        },
        body: JSON.stringify(metadata),
    });

    const responseClone = response.clone();
    const responseText = await responseClone.text().catch(() => '');
    let parsedResponse: unknown = responseText;
    try {
        parsedResponse = responseText ? JSON.parse(responseText) : null;
    } catch {
        // keep raw text
    }
    void logUploadTrace('upload-client', 'initialize_upload_response', {
        endpoint: apiEndpoint,
        status: response.status,
        ok: response.ok,
        response: parsedResponse,
    });

    if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
            const error = parsedResponse && typeof parsedResponse === 'object' ? parsedResponse as any : await response.json();
            if (error.error) {
                errorMessage = error.error;
                if (error.code) {
                    errorMessage += ` (Code: ${error.code})`;
                }
            }
        } catch {
            // Fallback if not JSON
        }
        const error = new Error(errorMessage) as Error & {
            status?: number;
            response?: unknown;
        };
        error.status = response.status;
        error.response = parsedResponse;
        throw error;
    }

    return await response.json();
}

/**
 * Generate a random nonce for the upload request
 */
export function generateNonce(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
