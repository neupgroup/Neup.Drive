import { createBLAKE3 } from 'hash-wasm';
import { getBasePath } from '@/core/appconfig';

/*
::neup.documentation::portable-drive-upload-runtime
::title Portable Drive Upload Runtime
::owner Neup Drive

::public

Browser-only helpers that keep the portable upload component self-contained.

::private

This file mirrors the client upload behavior previously sourced from `@/lib`
and exposes hashing, IndexedDB queue persistence, CDN chunk upload, error
trace logging, and shared upload types without relying on app-local aliases.

::private end

::end
*/

export interface UploadSignaturePayload {
  path: string;
  account_id: string;
  method: 'PUT';
  max_size: number;
  content_type: string;
  expires_at: number;
  nonce: string;
  key_id: string;
}

export interface SignedUploadRequest {
  payload: string;
  signature: string;
}

export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export interface UploadInitRequest {
  file_id: string;
  filename: string;
  size: number;
  mime: string;
  file_hash: string;
}

export interface UploadInitResponse {
  upload_session_id: string;
  destination_path: string;
  upload_endpoint: string;
  signed_upload_token: SignedUploadRequest;
  expires_at: number;
}

export type FileState =
  | 'PENDING'
  | 'HASHING'
  | 'HASHED'
  | 'DUPLICATE_NAME'
  | 'TOKEN_ISSUED'
  | 'UPLOADING'
  | 'VERIFIED'
  | 'DONE'
  | 'ERROR';

export interface UploadQueueItem {
  id: string;
  file: File;
  metadata: {
    name: string;
    size: number;
    type: string;
  };
  hash?: string;
  uploadInit?: UploadInitResponse;
  suggestedName?: string;
  progress: number;
  status: FileState;
  error?: string;
  url?: string;
  createdAt: number;
}

const DB_NAME = 'neupdrive_uploads';
const DB_VERSION = 1;
const STORE_NAME = 'uploads';
const KB = 1024;
const MB = 1024 * KB;
const MIN_CHUNK_SIZE = 0.25 * MB;
const MAX_CHUNK_SIZE = 50 * MB;
const FAST_CHUNK_MS = 1000;
const SLOW_SPEED_DROP_RATIO = 0.75;
const SLOW_SPEED_HOLD_MS = 3000;
const BROWSER_UPLOAD_LOG_INTERVAL_MS = 10_000;

export async function hashFile(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const hasher = await createBLAKE3();
  const chunkSize = 10 * 1024 * 1024;
  const total = file.size;
  let offset = 0;

  hasher.init();

  while (offset < total) {
    const end = Math.min(offset + chunkSize, total);
    const slice = file.slice(offset, end);
    const buffer = await slice.arrayBuffer();

    hasher.update(new Uint8Array(buffer));

    offset += buffer.byteLength;

    if (onProgress) {
      const progress = Math.min(99, (offset / total) * 100);
      onProgress(progress);
    }
  }

  const hash = hasher.digest('hex');
  if (onProgress) onProgress(100);

  return hash;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveUpload(item: UploadQueueItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(item);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getUploads(): Promise<UploadQueueItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteUpload(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

const ERROR_LOG_ENDPOINT = `${getBasePath() ?? ''}/bridge/api.v1/log-error`;

export async function logUploadTrace(
  onPage: string,
  message: string,
  context: Record<string, unknown> = {},
  endpoint = ERROR_LOG_ENDPOINT,
) {
  const lowerMessage = message.toLowerCase();
  if (!lowerMessage.includes('failed') && !lowerMessage.includes('error')) return;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        on_page: onPage,
        context: {
          type: 'UPLOAD_TRACE',
          message,
          ...context,
        },
      }),
    });
  } catch {
    console.log(`Error happened of type "UPLOAD_TRACE": ${message}`);
  }
}

function extractUploadErrorCode(errorData: unknown): string | undefined {
  if (!errorData || typeof errorData !== 'object') return undefined;
  const maybeError = errorData as { error?: unknown; code?: unknown };
  if (typeof maybeError.error === 'string' && maybeError.error) return maybeError.error;
  if (typeof maybeError.code === 'string' && maybeError.code) return maybeError.code;
  if (typeof maybeError.code === 'number') return String(maybeError.code);
  return undefined;
}

function createChunkUploadError(message: string, status: number, response: unknown) {
  const error = new Error(message) as Error & {
    status?: number;
    response?: unknown;
  };
  error.status = status;
  error.response = response;
  return error;
}

function encodeUploadToken(token: UploadInitResponse['signed_upload_token']): string {
  const json = JSON.stringify(token);
  return typeof window !== 'undefined'
    ? window.btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
    : Buffer.from(json).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

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

export async function uploadFileChunks(
  file: File,
  sessionData: UploadInitResponse,
  fileHash: string,
  onProgress?: (progress: number) => void,
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

      if (
        response.ok &&
        responseData &&
        typeof responseData === 'object' &&
        'success' in responseData &&
        (responseData as { success?: unknown }).success === false
      ) {
        const errorCode = extractUploadErrorCode(responseData) || `upload_failed_${response.status}`;
        throw createChunkUploadError(errorCode, response.status, responseData);
      }

      if (!response.ok) {
        const errorCode = extractUploadErrorCode(responseData) || `upload_failed_${response.status}`;
        throw createChunkUploadError(
          `Upload failed for chunk ${chunkIndex + 1}/${estimatedTotalChunks}: ${errorCode}`,
          response.status,
          responseData ?? responseText,
        );
      }

      if (
        responseData &&
        typeof responseData === 'object' &&
        'success' in responseData &&
        (responseData as { success?: unknown }).success === false
      ) {
        const errorCode = extractUploadErrorCode(responseData) || `upload_failed_${response.status}`;
        throw createChunkUploadError(
          `Upload failed for chunk ${chunkIndex + 1}/${estimatedTotalChunks}: ${errorCode}`,
          response.status,
          responseData,
        );
      }

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
      if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message === 'Load failed')) {
        throw new Error('CDN unreachable: Network error during chunk upload. Please check your internet connection or CDN status.');
      }
      throw error;
    } finally {
      if (statusLogInterval !== undefined && typeof window !== 'undefined') {
        window.clearInterval(statusLogInterval);
      }
    }
  }
}
