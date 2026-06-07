import type { UploadInitResponse } from './upload-types';

const DB_NAME = 'neupdrive_uploads';
const DB_VERSION = 1;
const STORE_NAME = 'uploads';

export type FileState = 'PENDING' | 'HASHING' | 'HASHED' | 'TOKEN_ISSUED' | 'UPLOADING' | 'VERIFIED' | 'DONE' | 'ERROR';

export interface UploadQueueItem {
    id: string; // Client-side UUID
    file: File;
    metadata: {
        name: string;
        size: number;
        type: string;
    };
    hash?: string;
    uploadInit?: UploadInitResponse;
    progress: number;
    status: FileState;
    error?: string;
    url?: string;
    createdAt: number;
}

/**
 * Open IndexedDB connection
 */
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

/**
 * Save upload item to IndexedDB
 */
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

/**
 * Get all upload items from IndexedDB
 */
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

/**
 * Delete upload item from IndexedDB
 */
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

/**
 * Clear all completed or failed uploads
 */
export async function cleanupUploads(): Promise<void> {
    const uploads = await getUploads();
    for (const item of uploads) {
        if (['DONE', 'ERROR'].includes(item.status)) {
            await deleteUpload(item.id);
        }
    }
}
