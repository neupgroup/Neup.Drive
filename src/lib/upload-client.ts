import type { UploadSignaturePayload, SignedUploadRequest, UploadInitRequest, UploadInitResponse } from './upload-types';

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

    if (!response.ok) {
        let errorMessage = `Server error: ${response.status}`;
        try {
            const error = await response.json();
            if (error.error) {
                errorMessage = error.error;
                if (error.code) {
                    errorMessage += ` (Code: ${error.code})`;
                }
            }
        } catch {
            // Fallback if not JSON
        }
        throw new Error(errorMessage);
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
                    let errorMessage = `Upload failed with status ${xhr.status}`;
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        if (errorData.error) {
                            errorMessage = errorData.error;
                            if (errorData.code) {
                                errorMessage += ` (Code: ${errorData.code})`;
                            }
                        }
                    } catch {
                        // Fallback
                    }
                    reject(new Error(errorMessage));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('CDN unreachable: Network error during upload. Please check your internet connection or CDN status.'));
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
