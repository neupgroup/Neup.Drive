import type { UploadSignaturePayload, SignedUploadRequest, UploadInitRequest, UploadInitResponse } from './upload-types';
import { handleClientError } from './error-client';
import { identifyError } from './error-types';
import { logUploadTrace } from './upload-trace';

function extractUploadErrorCode(errorData: unknown): string | undefined {
    if (!errorData || typeof errorData !== 'object') return undefined;
    const maybeError = errorData as { error?: unknown; code?: unknown };
    if (typeof maybeError.error === 'string' && maybeError.error) return maybeError.error;
    if (typeof maybeError.code === 'string' && maybeError.code) return maybeError.code;
    if (typeof maybeError.code === 'number') return String(maybeError.code);
    return undefined;
}

function encodeUploadToken(token: SignedUploadRequest): string {
    const json = JSON.stringify(token);
    return typeof window !== 'undefined'
        ? window.btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
        : Buffer.from(json).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Initialize upload session with server (Step 3)
 */
export async function initializeUpload(
    metadata: UploadInitRequest,
    apiEndpoint: string = '/api/drive/upload/init'
): Promise<UploadInitResponse> {
    const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
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

/**
 * Create HMAC-SHA256 signature
 */
async function createSignature(payload: UploadSignaturePayload, secretKey: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(payload));
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secretKey),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, data);
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Sign an upload request
 */
export async function signUploadRequest(
    file: File,
    path: string,
    accountId: string,
    keyId: string,
    secretKey: string,
    maxSize: number = 100 * 1024 * 1024, // 100MB default
    expiresInMinutes: number = 15
): Promise<SignedUploadRequest> {
    const payload: UploadSignaturePayload = {
        path,
        account_id: accountId,
        method: 'PUT',
        max_size: maxSize,
        content_type: file.type || 'application/octet-stream',
        expires_at: Math.floor(Date.now() / 1000) + (expiresInMinutes * 60),
        nonce: generateNonce(),
        key_id: keyId,
    };

    const signature = await createSignature(payload, secretKey);

    // Convert payload to Base64 to match SignedUploadRequest interface
    const payloadStr = JSON.stringify(payload);
    const payloadBase64 = typeof window !== 'undefined'
        ? window.btoa(payloadStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
        : Buffer.from(payloadStr).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return {
        payload: payloadBase64,
        signature,
    };
}

/**
 * Upload file to CDN with signed request
 */
export async function uploadFileToCDN(
    file: File,
    signedRequest: SignedUploadRequest,
    cdnUrl: string = 'https://neupcdn.com/upload',
    onProgress?: (progress: number) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        // Decode payload from Base64 string
        let payload: UploadSignaturePayload;
        try {
            // Basic Base64 decoding (handle URL-safe chars)
            const jsonStr = atob(signedRequest.payload.replace(/-/g, '+').replace(/_/g, '/'));
            payload = JSON.parse(jsonStr);
        } catch (e) {
            throw new Error('Invalid payload format');
        }

        // Validate file size
        if (file.size > payload.max_size) {
            throw new Error(`File size exceeds maximum allowed size of ${payload.max_size} bytes`);
        }

        // Validate expiration
        const now = Math.floor(Date.now() / 1000);
        if (now > payload.expires_at) {
            throw new Error('Upload signature has expired');
        }

        // Create form data or use direct PUT based on your API requirements
        const formData = new FormData();
        formData.append('file', file);
        formData.append('payload', signedRequest.payload);
        formData.append('signature', signedRequest.signature);

        // Upload with progress tracking
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            if (onProgress) {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const progress = (e.loaded / e.total) * 100;
                        onProgress(progress);
                    }
                });
            }

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        void logUploadTrace('upload-client', 'direct_upload_response', {
                            status: xhr.status,
                            ok: true,
                            response,
                        });
                        if (response && typeof response === 'object' && response.success === false) {
                            const errorCode = extractUploadErrorCode(response) || `upload_failed_${xhr.status}`;
                            handleClientError(
                                new Error(`CDN upload failed with code ${errorCode}`),
                                'upload-client',
                                {
                                    stage: 'direct_upload',
                                    status: xhr.status,
                                    response,
                                }
                            ).catch(console.error);
                            reject(new Error(errorCode));
                            return;
                        }
                        resolve({
                            success: true,
                            url: response.url || `${cdnUrl}/${payload.path}`,
                        });
                    } catch {
                        resolve({
                            success: true,
                            url: `${cdnUrl}/${payload.path}`,
                        });
                    }
                } else {
                    let errorCode = `upload_failed_${xhr.status}`;
                    let responseData: unknown = undefined;
                    try {
                        responseData = JSON.parse(xhr.responseText);
                        errorCode = extractUploadErrorCode(responseData) || errorCode;
                    } catch {
                        responseData = xhr.responseText;
                    }
                    const error = new Error(`CDN upload failed with code ${errorCode}`);
                    void logUploadTrace('upload-client', 'direct_upload_failed', {
                        status: xhr.status,
                        response: responseData,
                        errorType: identifyError(error),
                    });
                    handleClientError(
                        error,
                        'upload-client',
                        {
                            stage: 'direct_upload',
                            status: xhr.status,
                            response: responseData,
                        }
                    ).catch(console.error);
                    void logUploadTrace('upload-client', 'direct_upload_response', {
                        status: xhr.status,
                        ok: false,
                        response: responseData,
                    });
                    reject(new Error(errorCode));
                }
            });

            xhr.addEventListener('error', () => {
                const error = new Error('CDN unreachable: Network error during upload. Please check your internet connection or CDN status.');
                void logUploadTrace('upload-client', 'direct_upload_network_error', {
                    errorType: identifyError(error),
                    message: error.message,
                });
                reject(error);
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload was aborted'));
            });

            xhr.open('POST', cdnUrl);
            xhr.send(formData);
        });
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

/**
 * Convenience function to sign and upload in one step
 */
export async function signAndUploadFile(
    file: File,
    path: string,
    accountId: string,
    keyId: string,
    secretKey: string,
    options?: {
        maxSize?: number;
        expiresInMinutes?: number;
        cdnUrl?: string;
        onProgress?: (progress: number) => void;
    }
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const signedRequest = await signUploadRequest(
            file,
            path,
            accountId,
            keyId,
            secretKey,
            options?.maxSize,
            options?.expiresInMinutes
        );

        return await uploadFileToCDN(
            file,
            signedRequest,
            options?.cdnUrl,
            options?.onProgress
        );
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to sign and upload file',
        };
    }
}
