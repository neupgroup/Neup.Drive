import type { UploadInitResponse } from './upload-types';
import { handleClientError } from './error-client';

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
const BROWSER_UPLOAD_LOG_INTERVAL_MS = 10_000;

function clampChunkSize(size: number, remainingBytes: number): number {
    return Math.min(Math.max(size, 1), remainingBytes);
}

function increaseChunkSize(currentSize: number): number {
    return Math.min(currentSize * 2, MAX_CHUNK_SIZE);
}

function decreaseChunkSize(currentSize: number): number {
    return Math.max(Math.floor(currentSize / 2), MIN_CHUNK_SIZE);
}

function formatMegabytes(bytes: number): string {
    const megabytes = bytes / MB;
    return `${megabytes >= 10 ? megabytes.toFixed(0) : megabytes.toFixed(2)}mb`;
}

function formatSpeed(bytesPerSecond: number | null): string {
    if (!bytesPerSecond || !Number.isFinite(bytesPerSecond)) return 'calculating';
    const megabytesPerSecond = bytesPerSecond / MB;
    return `${megabytesPerSecond >= 10 ? megabytesPerSecond.toFixed(0) : megabytesPerSecond.toFixed(2)}mb/s`;
}

function logUploadToBrowser(message: string) {
    if (typeof window === 'undefined') return;
    console.info(message);
}

function chunkUploadMessage(params: {
    chunkNumber: number;
    chunkSize: number;
    filename: string;
    speedBytesPerSecond: number | null;
}) {
    return [
        `uploading chunk ${params.chunkNumber} of size ${formatMegabytes(params.chunkSize)} of file: "${params.filename}".`,
        `speed: ${formatSpeed(params.speedBytesPerSecond)}`,
    ].join('\n');
}

function fileUploadMessage(params: {
    filename: string;
    fileSize: number;
    speedBytesPerSecond: number | null;
}) {
    return [
        `uploading file: "${params.filename}" of size ${formatMegabytes(params.fileSize)}`,
        `speed: ${formatSpeed(params.speedBytesPerSecond)}`,
    ].join('\n');
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
    let lastBytesPerSecond: number | null = null;
    let lowSpeedSince: number | null = null;
    let lastBrowserLogAt = 0;

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

        let statusLogInterval: number | undefined;

        try {
            const chunkStartedAt = performance.now();
            const shouldLogChunkStart = chunkIndex === 0 || chunkStartedAt - lastBrowserLogAt >= BROWSER_UPLOAD_LOG_INTERVAL_MS;
            if (shouldLogChunkStart) {
                logUploadToBrowser(chunkUploadMessage({
                    chunkNumber: chunkIndex + 1,
                    chunkSize: chunk.size,
                    filename: file.name,
                    speedBytesPerSecond: lastBytesPerSecond,
                }));
                lastBrowserLogAt = chunkStartedAt;
            }

            statusLogInterval = typeof window !== 'undefined'
                ? window.setInterval(() => {
                    logUploadToBrowser(fileUploadMessage({
                        filename: file.name,
                        fileSize: file.size,
                        speedBytesPerSecond: lastBytesPerSecond,
                    }));
                }, BROWSER_UPLOAD_LOG_INTERVAL_MS)
                : undefined;

            const response = await fetch(sessionData.upload_endpoint, {
                method: 'PUT',
                headers,
                body: chunk,
            });

            const uploadDurationMs = Math.max(performance.now() - chunkStartedAt, 1);
            const bytesPerSecond = (chunk.size / uploadDurationMs) * 1000;
            lastBytesPerSecond = bytesPerSecond;

            const responseText = await response.text();
            let responseData: unknown = undefined;
            if (responseText) {
                try {
                    responseData = JSON.parse(responseText);
                } catch {
                    responseData = responseText;
                }
            }
            logUploadToBrowser(chunkUploadMessage({
                chunkNumber: chunkIndex + 1,
                chunkSize: chunk.size,
                filename: file.name,
                speedBytesPerSecond: bytesPerSecond,
            }));

            if (response.ok && responseData && typeof responseData === 'object' && 'success' in responseData && (responseData as { success?: unknown }).success === false) {
                const errorCode = extractUploadErrorCode(responseData) || `upload_failed_${response.status}`;
                const error = new Error(`CDN upload failed with code ${errorCode}`);
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

            chunkIndex += 1;

        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                const networkError = new Error('CDN unreachable: Network error during chunk upload. Please check your internet connection or CDN status.');
                throw networkError;
            }
            console.error(`Chunk upload error (chunk ${chunkIndex}):`, error);
            throw error;
        } finally {
            if (statusLogInterval !== undefined && typeof window !== 'undefined') {
                window.clearInterval(statusLogInterval);
            }
        }
    }
}
