import type { UploadInitResponse } from './upload-types';
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

function encodeUploadToken(token: UploadInitResponse['signed_upload_token']): string {
    const json = JSON.stringify(token);
    return typeof window !== 'undefined'
        ? window.btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
        : Buffer.from(json).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Uploads a file in chunks to the specified endpoint.
 * 
 * @param file The file to upload
 * @param sessionData The session data returned from the init step
 * @param onProgress Callback for progress updates (0-100)
 * @returns Promise that resolves when upload is complete
 */
export async function uploadFileChunks(
    file: File,
    sessionData: UploadInitResponse,
    fileHash: string,
    onProgress?: (progress: number) => void
): Promise<void> {
    const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;
    const STREAM_CHUNK_SIZE = 800 * 1024;
    const chunkSize = file.size > LARGE_FILE_THRESHOLD ? STREAM_CHUNK_SIZE : Math.max(file.size, 1);
    const totalChunks = Math.ceil(file.size / chunkSize);
    let uploadedBytes = 0;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        // Prepare headers
        const headers: HeadersInit = {
            'x-upload-session-id': sessionData.upload_session_id,
            'x-file-hash': fileHash,
            'x-upload-token': encodeUploadToken(sessionData.signed_upload_token),
            'x-chunk-index': String(chunkIndex),
            'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
            'Content-Type': 'application/octet-stream',
        };

        try {
            const response = await fetch(sessionData.upload_endpoint, {
                method: 'PUT',
                headers,
                body: chunk,
            });

            const responseText = await response.text();
            let responseData: unknown = undefined;
            if (responseText) {
                try {
                    responseData = JSON.parse(responseText);
                } catch {
                    responseData = responseText;
                }
            }
            void logUploadTrace('chunked-upload', 'chunk_upload_response', {
                chunkIndex: chunkIndex + 1,
                totalChunks,
                chunkSize: chunk.size,
                status: response.status,
                ok: response.ok,
                response: responseData,
            });

            if (response.ok && responseData && typeof responseData === 'object' && 'success' in responseData && (responseData as { success?: unknown }).success === false) {
                const errorCode = extractUploadErrorCode(responseData) || `upload_failed_${response.status}`;
                const error = new Error(`CDN upload failed with code ${errorCode}`);
                void logUploadTrace('chunked-upload', 'chunk_upload_failed', {
                    chunkIndex: chunkIndex + 1,
                    totalChunks,
                    status: response.status,
                    response: responseData,
                    errorType: identifyError(error),
                });
                await handleClientError(
                    error,
                    'chunked-upload',
                    {
                        stage: 'chunk_upload',
                        chunkIndex: chunkIndex + 1,
                        totalChunks,
                        status: response.status,
                        response: responseData,
                    }
                );
                throw new Error(errorCode);
            }

            if (!response.ok) {
                // Try to parse error message as JSON
                const errorCode = extractUploadErrorCode(responseData) || `upload_failed_${response.status}`;
                const error = new Error(`CDN upload failed with code ${errorCode}`);
                void logUploadTrace('chunked-upload', 'chunk_upload_failed', {
                    chunkIndex: chunkIndex + 1,
                    totalChunks,
                    status: response.status,
                    response: responseData ?? responseText,
                    errorType: identifyError(error),
                });
                await handleClientError(
                    error,
                    'chunked-upload',
                    {
                        stage: 'chunk_upload',
                        chunkIndex: chunkIndex + 1,
                        totalChunks,
                        status: response.status,
                        response: responseData ?? responseText,
                    }
                );
                throw new Error(`Upload failed for chunk ${chunkIndex + 1}/${totalChunks}: ${errorCode}`);
            }

            if (responseData && typeof responseData === 'object' && 'success' in responseData && (responseData as { success?: unknown }).success === false) {
                const errorCode = extractUploadErrorCode(responseData) || `upload_failed_${response.status}`;
                const error = new Error(`CDN upload failed with code ${errorCode}`);
                void logUploadTrace('chunked-upload', 'chunk_upload_failed', {
                    chunkIndex: chunkIndex + 1,
                    totalChunks,
                    status: response.status,
                    response: responseData,
                    errorType: identifyError(error),
                });
                await handleClientError(
                    error,
                    'chunked-upload',
                    {
                        stage: 'chunk_upload',
                        chunkIndex: chunkIndex + 1,
                        totalChunks,
                        status: response.status,
                        response: responseData,
                    }
                );
                throw new Error(`Upload failed for chunk ${chunkIndex + 1}/${totalChunks}: ${errorCode}`);
            }

            // Update progress
            uploadedBytes += chunk.size;
            if (onProgress) {
                const progress = Math.min(100, (uploadedBytes / file.size) * 100);
                onProgress(progress);
            }

        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                const networkError = new Error('CDN unreachable: Network error during chunk upload. Please check your internet connection or CDN status.');
                void logUploadTrace('chunked-upload', 'chunk_upload_network_error', {
                    chunkIndex: chunkIndex + 1,
                    totalChunks,
                    errorType: identifyError(networkError),
                    message: networkError.message,
                });
                throw networkError;
            }
            console.error(`Chunk upload error (chunk ${chunkIndex}):`, error);
            throw error;
        }
    }
}
