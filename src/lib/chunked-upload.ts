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

const KB = 1024;
const MB = 1024 * KB;
const MIN_CHUNK_SIZE = 0.25 * MB;
const MAX_CHUNK_SIZE = 50 * MB;
const FAST_CHUNK_MS = 1000;
const SLOW_SPEED_DROP_RATIO = 0.75;
const SLOW_SPEED_HOLD_MS = 3000;

function clampChunkSize(size: number, remainingBytes: number): number {
    return Math.min(Math.max(size, 1), remainingBytes);
}

function increaseChunkSize(currentSize: number): number {
    return Math.min(currentSize * 2, MAX_CHUNK_SIZE);
}

function decreaseChunkSize(currentSize: number): number {
    return Math.max(Math.floor(currentSize / 2), MIN_CHUNK_SIZE);
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
    let uploadedBytes = 0;
    let chunkIndex = 0;
    let chunkSize = file.size <= MIN_CHUNK_SIZE ? Math.max(file.size, 1) : MIN_CHUNK_SIZE;
    let bestBytesPerSecond = 0;
    let lowSpeedSince: number | null = null;

    while (uploadedBytes < file.size) {
        const start = uploadedBytes;
        const currentChunkSize = clampChunkSize(chunkSize, file.size - uploadedBytes);
        const end = Math.min(start + currentChunkSize, file.size);
        const chunk = file.slice(start, end);
        const estimatedTotalChunks = chunkIndex + 1 + Math.ceil((file.size - end) / Math.max(chunkSize, 1));

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
            const chunkStartedAt = performance.now();
            const response = await fetch(sessionData.upload_endpoint, {
                method: 'PUT',
                headers,
                body: chunk,
            });
            const uploadDurationMs = Math.max(performance.now() - chunkStartedAt, 1);
            const bytesPerSecond = (chunk.size / uploadDurationMs) * 1000;

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
                totalChunks: estimatedTotalChunks,
                chunkSize: chunk.size,
                uploadDurationMs,
                bytesPerSecond,
                status: response.status,
                ok: response.ok,
                response: responseData,
            });

            if (response.ok && responseData && typeof responseData === 'object' && 'success' in responseData && (responseData as { success?: unknown }).success === false) {
                const errorCode = extractUploadErrorCode(responseData) || `upload_failed_${response.status}`;
                const error = new Error(`CDN upload failed with code ${errorCode}`);
                void logUploadTrace('chunked-upload', 'chunk_upload_failed', {
                    chunkIndex: chunkIndex + 1,
                    totalChunks: estimatedTotalChunks,
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
                        totalChunks: estimatedTotalChunks,
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
                    totalChunks: estimatedTotalChunks,
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
                        totalChunks: estimatedTotalChunks,
                        status: response.status,
                        response: responseData ?? responseText,
                    }
                );
                throw new Error(`Upload failed for chunk ${chunkIndex + 1}/${estimatedTotalChunks}: ${errorCode}`);
            }

            if (responseData && typeof responseData === 'object' && 'success' in responseData && (responseData as { success?: unknown }).success === false) {
                const errorCode = extractUploadErrorCode(responseData) || `upload_failed_${response.status}`;
                const error = new Error(`CDN upload failed with code ${errorCode}`);
                void logUploadTrace('chunked-upload', 'chunk_upload_failed', {
                    chunkIndex: chunkIndex + 1,
                    totalChunks: estimatedTotalChunks,
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
                        totalChunks: estimatedTotalChunks,
                        status: response.status,
                        response: responseData,
                    }
                );
                throw new Error(`Upload failed for chunk ${chunkIndex + 1}/${estimatedTotalChunks}: ${errorCode}`);
            }

            // Update progress
            uploadedBytes += chunk.size;
            if (onProgress) {
                const progress = Math.min(100, (uploadedBytes / file.size) * 100);
                onProgress(progress);
            }

            const previousChunkSize = chunkSize;
            if (bytesPerSecond > bestBytesPerSecond) {
                bestBytesPerSecond = bytesPerSecond;
                lowSpeedSince = null;
            }

            const isSlowComparedToBest = bestBytesPerSecond > 0 && bytesPerSecond < bestBytesPerSecond * SLOW_SPEED_DROP_RATIO;
            if (uploadDurationMs < FAST_CHUNK_MS && chunkSize < MAX_CHUNK_SIZE) {
                chunkSize = increaseChunkSize(chunkSize);
                lowSpeedSince = null;
            } else if (isSlowComparedToBest && chunkSize > MIN_CHUNK_SIZE) {
                const now = performance.now();
                lowSpeedSince ??= now - uploadDurationMs;
                if (now - lowSpeedSince >= SLOW_SPEED_HOLD_MS) {
                    chunkSize = decreaseChunkSize(chunkSize);
                    lowSpeedSince = null;
                }
            } else {
                lowSpeedSince = null;
            }

            if (chunkSize !== previousChunkSize) {
                void logUploadTrace('chunked-upload', 'adaptive_chunk_size_changed', {
                    chunkIndex: chunkIndex + 1,
                    previousChunkSize,
                    nextChunkSize: chunkSize,
                    uploadDurationMs,
                    bytesPerSecond,
                    bestBytesPerSecond,
                });
            }

            chunkIndex += 1;

        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                const networkError = new Error('CDN unreachable: Network error during chunk upload. Please check your internet connection or CDN status.');
                void logUploadTrace('chunked-upload', 'chunk_upload_network_error', {
                    chunkIndex: chunkIndex + 1,
                    totalChunks: estimatedTotalChunks,
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
