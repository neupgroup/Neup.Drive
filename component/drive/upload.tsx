'use client';

/*
::neup.documentation::portable-drive-upload-component
::title Portable Drive Upload Component
::owner Neup Drive

::public

Portable upload UI for other applications that need to use the current Neup
Drive upload flow without importing app-specific components.

::private

The component validates destination inputs, persists queue items in IndexedDB,
hashes files in the browser, requests signed upload sessions from the Drive
bridge API, uploads chunks directly to the CDN, and renders a plain HTML UI so
external apps do not depend on `@/components`.

::private end

::end
*/

import * as React from 'react';

import {
  deleteUpload,
  getUploads,
  hashFile,
  logUploadTrace,
  saveUpload,
  uploadFileChunks,
  type UploadInitRequest,
  type UploadInitResponse,
  type UploadQueueItem,
} from './upload-runtime';

type FileState = UploadQueueItem['status'];
type WebDiskType = 'assets' | 'signed';
type UploadMode = 'drive' | 'webdisk';

type DriveDestination = {
  kind?: 'drive';
  path?: string;
};

type WebDiskDestination = {
  kind: 'webdisk';
  type?: WebDiskType;
  path?: string;
};

export type DriveUploadDestination = DriveDestination | WebDiskDestination;

export interface DriveUploadProps {
  accountId: string;
  destination?: DriveUploadDestination;
  uploadInitEndpoint?: string;
  apiBasePath?: string;
  maxSize?: number;
  acceptedTypes?: string[];
  className?: string;
  title?: string;
  description?: string;
  onUploadComplete?: (url: string, file: File) => void;
  onUploadError?: (error: string, file: File) => void;
}

type UploadInitError = Error & {
  status?: number;
  response?: unknown;
  code?: string;
  suggestedFilename?: string;
};

type ResolvedUploadConfig = {
  uploadMode: UploadMode;
  uploadInitEndpoint: string;
  invalidReason: string | null;
};

const DEFAULT_MAX_SIZE = 6000 * 1024 * 1024;
const DEFAULT_TITLE = 'Upload files';
const DEFAULT_DESCRIPTION = 'Drop files here or choose files to upload through Neup Drive.';

function joinClassNames(...values: Array<string | undefined | null | false>) {
  return values.filter(Boolean).join(' ');
}

function normalizePath(value?: string) {
  const trimmed = (value || '').trim().replace(/^\/+/, '');
  if (!trimmed) return '';

  const normalized: string[] = [];
  for (const part of trimmed.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') return null;
    normalized.push(part);
  }

  return normalized.join('/');
}

function isReservedAssetsSignedPath(value: string) {
  const [firstSegment] = value.split('/');
  return firstSegment === 'signed';
}

function getStatusText(item: UploadQueueItem) {
  switch (item.status) {
    case 'PENDING':
      return 'Pending';
    case 'HASHING':
      return `Hashing ${item.progress.toFixed(0)}%`;
    case 'HASHED':
      return 'Hashed';
    case 'DUPLICATE_NAME':
      return 'Duplicate filename';
    case 'TOKEN_ISSUED':
      return 'Authorized';
    case 'UPLOADING':
      return `Uploading ${item.progress.toFixed(0)}%`;
    case 'VERIFIED':
      return 'Verifying';
    case 'DONE':
      return 'Completed';
    case 'ERROR':
      return 'Error';
    default:
      return item.status;
  }
}

function toUserMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

function normalizeUploadInitError(error: unknown) {
  const uploadError = error as UploadInitError;
  return {
    status: typeof uploadError?.status === 'number' ? uploadError.status : undefined,
    code: typeof uploadError?.code === 'string' ? uploadError.code : undefined,
    suggestedFilename: typeof uploadError?.suggestedFilename === 'string' ? uploadError.suggestedFilename : undefined,
  };
}

function resolveUploadConfig(
  accountId: string,
  destination: DriveUploadDestination | undefined,
  uploadInitEndpoint: string | undefined,
  apiBasePath: string | undefined,
): ResolvedUploadConfig {
  if (!accountId.trim()) {
    return {
      uploadMode: 'drive',
      uploadInitEndpoint: '',
      invalidReason: 'A valid account ID is required to upload files.',
    };
  }

  if (uploadInitEndpoint) {
    return {
      uploadMode: destination?.kind === 'webdisk' ? 'webdisk' : 'drive',
      uploadInitEndpoint,
      invalidReason: null,
    };
  }

  const basePath = (apiBasePath || '').replace(/\/$/, '');
  const params = new URLSearchParams();

  if (destination?.kind === 'webdisk') {
    const folderType = destination.type || 'assets';
    const normalizedPath = normalizePath(destination.path);

    if (normalizedPath === null) {
      return {
        uploadMode: 'webdisk',
        uploadInitEndpoint: '',
        invalidReason: 'Upload path cannot traverse parent directories.',
      };
    }

    if (folderType === 'assets' && normalizedPath && isReservedAssetsSignedPath(normalizedPath)) {
      return {
        uploadMode: 'webdisk',
        uploadInitEndpoint: '',
        invalidReason: 'The "signed" folder name is reserved at the top level of assets.',
      };
    }

    params.set('folder_type', folderType);
    params.set('saveto', 'webdisk');
    if (normalizedPath) params.set('path', normalizedPath);

    return {
      uploadMode: 'webdisk',
      uploadInitEndpoint: `${basePath}/bridge/api.v1/upload/init?${params.toString()}`,
      invalidReason: null,
    };
  }

  const normalizedPath = normalizePath(destination?.path);
  if (normalizedPath === null) {
    return {
      uploadMode: 'drive',
      uploadInitEndpoint: '',
      invalidReason: 'Upload path cannot traverse parent directories.',
    };
  }

  params.set('folder_type', 'drive');
  if (normalizedPath) params.set('path', normalizedPath);

  return {
    uploadMode: 'drive',
    uploadInitEndpoint: `${basePath}/bridge/api.v1/upload/init?${params.toString()}`,
    invalidReason: null,
  };
}

async function requestUploadInit(
  endpoint: string,
  accountId: string,
  metadata: UploadInitRequest,
): Promise<UploadInitResponse> {
  const response = await fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'x-account-id': accountId,
    },
    body: JSON.stringify(metadata),
  });

  const responseText = await response.text().catch(() => '');
  let parsedResponse: unknown = responseText;

  try {
    parsedResponse = responseText ? JSON.parse(responseText) : null;
  } catch {
    // keep raw response text
  }

  if (!response.ok) {
    const uploadError = new Error(`Upload init failed with status ${response.status}`) as UploadInitError;
    uploadError.status = response.status;
    uploadError.response = parsedResponse;

    if (parsedResponse && typeof parsedResponse === 'object') {
      const responseData = parsedResponse as Record<string, unknown>;
      if (typeof responseData.error === 'string' && responseData.error) {
        uploadError.message = responseData.error;
      }
      if (typeof responseData.code === 'string') uploadError.code = responseData.code;
      if (typeof responseData.suggested_filename === 'string') {
        uploadError.suggestedFilename = responseData.suggested_filename;
      }
    }

    throw uploadError;
  }

  return parsedResponse as UploadInitResponse;
}

export function Upload({
  accountId,
  destination,
  uploadInitEndpoint,
  apiBasePath,
  maxSize = DEFAULT_MAX_SIZE,
  acceptedTypes,
  className,
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  onUploadComplete,
  onUploadError,
}: DriveUploadProps) {
  const [queue, setQueue] = React.useState<UploadQueueItem[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const processingRef = React.useRef(false);
  const hashingIdsRef = React.useRef(new Set<string>());
  const authorizingIdsRef = React.useRef(new Set<string>());
  const uploadingIdsRef = React.useRef(new Set<string>());
  const completionTimerIdsRef = React.useRef(new Set<string>());

  const config = React.useMemo(
    () => resolveUploadConfig(accountId, destination, uploadInitEndpoint, apiBasePath),
    [accountId, destination, uploadInitEndpoint, apiBasePath],
  );

  React.useEffect(() => {
    getUploads()
      .then((persistedUploads) => {
        const activeItems = persistedUploads.filter((item) => item.status !== 'DONE');
        if (activeItems.length > 0) {
          setQueue(activeItems);
        }
      })
      .catch(() => {
        // Keep uploader usable even if IndexedDB is unavailable.
      });
  }, []);

  const updateQueueItem = React.useCallback((id: string, updates: Partial<UploadQueueItem>) => {
    setQueue((previousQueue) => previousQueue.map((item) => {
      if (item.id !== id) return item;
      const updatedItem = { ...item, ...updates };
      void saveUpload(updatedItem).catch(() => undefined);
      return updatedItem;
    }));
  }, []);

  React.useEffect(() => {
    const processQueue = async () => {
      if (processingRef.current) return;

      const activeHashing = queue.filter((item) => item.status === 'HASHING').length;
      if (activeHashing >= 2) return;

      const pendingItem = queue.find((item) => item.status === 'PENDING' && !hashingIdsRef.current.has(item.id));
      if (!pendingItem) return;

      processingRef.current = true;
      hashingIdsRef.current.add(pendingItem.id);

      try {
        updateQueueItem(pendingItem.id, { status: 'HASHING' });
        const hash = await hashFile(pendingItem.file, (progress) => {
          updateQueueItem(pendingItem.id, { progress });
        });
        updateQueueItem(pendingItem.id, { status: 'HASHED', hash, progress: 100 });
      } catch (error) {
        void logUploadTrace('portable-drive-upload', 'hashing_failed', {
          accountId,
          fileId: pendingItem.id,
          fileName: pendingItem.metadata.name,
          error: error instanceof Error ? error.message : String(error),
        });
        updateQueueItem(pendingItem.id, {
          status: 'ERROR',
          error: toUserMessage(error, 'Hashing failed.'),
        });
      } finally {
        hashingIdsRef.current.delete(pendingItem.id);
        processingRef.current = false;
      }
    };

    void processQueue();
    const interval = window.setInterval(() => {
      void processQueue();
    }, 500);

    return () => window.clearInterval(interval);
  }, [accountId, queue, updateQueueItem]);

  React.useEffect(() => {
    const authorizeFile = async () => {
      if (config.invalidReason) return;

      const hashedItem = queue.find((item) => item.status === 'HASHED' && !authorizingIdsRef.current.has(item.id));
      if (!hashedItem || !hashedItem.hash) return;

      authorizingIdsRef.current.add(hashedItem.id);

      try {
        const initResponse = await requestUploadInit(config.uploadInitEndpoint, accountId, {
          file_id: hashedItem.id,
          filename: hashedItem.metadata.name,
          size: hashedItem.metadata.size,
          mime: hashedItem.metadata.type,
          file_hash: hashedItem.hash,
        });

        updateQueueItem(hashedItem.id, {
          status: 'TOKEN_ISSUED',
          uploadInit: initResponse,
        });
      } catch (error) {
        const uploadInitError = normalizeUploadInitError(error);

        if (
          config.uploadMode === 'webdisk' &&
          uploadInitError.status === 409 &&
          uploadInitError.code === 'duplicate_webdisk_filename' &&
          uploadInitError.suggestedFilename
        ) {
          updateQueueItem(hashedItem.id, {
            status: 'DUPLICATE_NAME',
            suggestedName: uploadInitError.suggestedFilename,
            error: `A file named "${hashedItem.metadata.name}" already exists in this folder.`,
          });
          return;
        }

        void logUploadTrace('portable-drive-upload', 'upload_init_failed', {
          accountId,
          fileId: hashedItem.id,
          fileName: hashedItem.metadata.name,
          error: error instanceof Error ? error.message : String(error),
        });

        updateQueueItem(hashedItem.id, {
          status: 'ERROR',
          error: toUserMessage(error, 'Upload authorization failed.'),
        });
      } finally {
        authorizingIdsRef.current.delete(hashedItem.id);
      }
    };

    void authorizeFile();
  }, [accountId, config, queue, updateQueueItem]);

  React.useEffect(() => {
    const processUploads = async () => {
      const activeUploads = queue.filter((item) => item.status === 'UPLOADING').length + uploadingIdsRef.current.size;
      if (activeUploads >= 3) return;

      const readyItem = queue.find((item) => item.status === 'TOKEN_ISSUED' && !uploadingIdsRef.current.has(item.id));
      if (!readyItem || !readyItem.uploadInit || !readyItem.hash) return;

      uploadingIdsRef.current.add(readyItem.id);
      updateQueueItem(readyItem.id, { status: 'UPLOADING', progress: 0 });

      try {
        await uploadFileChunks(readyItem.file, readyItem.uploadInit, readyItem.hash, (progress) => {
          updateQueueItem(readyItem.id, { progress });
        });

        updateQueueItem(readyItem.id, { status: 'VERIFIED', progress: 100 });

        if (completionTimerIdsRef.current.has(readyItem.id)) return;
        completionTimerIdsRef.current.add(readyItem.id);

        window.setTimeout(() => {
          updateQueueItem(readyItem.id, { status: 'DONE' });
          void deleteUpload(readyItem.id).catch(() => undefined);
          onUploadComplete?.(readyItem.uploadInit!.destination_path, readyItem.file);
          uploadingIdsRef.current.delete(readyItem.id);
          completionTimerIdsRef.current.delete(readyItem.id);
        }, 1000);
      } catch (error) {
        void logUploadTrace('portable-drive-upload', 'chunk_upload_failed', {
          accountId,
          fileId: readyItem.id,
          fileName: readyItem.metadata.name,
          error: error instanceof Error ? error.message : String(error),
        });

        const userMessage = toUserMessage(error, 'Upload failed.');
        updateQueueItem(readyItem.id, {
          status: 'ERROR',
          error: userMessage,
        });
        onUploadError?.(userMessage, readyItem.file);
        uploadingIdsRef.current.delete(readyItem.id);
      }
    };

    void processUploads();
    const interval = window.setInterval(() => {
      void processUploads();
    }, 1000);

    return () => window.clearInterval(interval);
  }, [accountId, onUploadComplete, onUploadError, queue, updateQueueItem]);

  const handleFiles = React.useCallback((files: FileList | null) => {
    if (!files || files.length === 0 || config.invalidReason) return;

    const newItems: UploadQueueItem[] = [];

    for (const file of Array.from(files)) {
      if (acceptedTypes && acceptedTypes.length > 0 && !acceptedTypes.includes(file.type)) {
        continue;
      }

      if (file.size > maxSize) {
        continue;
      }

      const id = crypto.randomUUID();
      newItems.push({
        id,
        file,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
        },
        status: 'PENDING',
        progress: 0,
        createdAt: Date.now(),
      });
    }

    if (newItems.length === 0) return;

    setQueue((previousQueue) => [...previousQueue, ...newItems]);
    newItems.forEach((item) => {
      void saveUpload(item).catch(() => undefined);
    });
  }, [acceptedTypes, config.invalidReason, maxSize]);

  const removeFile = React.useCallback((id: string) => {
    hashingIdsRef.current.delete(id);
    authorizingIdsRef.current.delete(id);
    uploadingIdsRef.current.delete(id);
    completionTimerIdsRef.current.delete(id);
    setQueue((previousQueue) => previousQueue.filter((item) => item.id !== id));
    void deleteUpload(id).catch(() => undefined);
  }, []);

  const continueWithSuggestedName = React.useCallback((item: UploadQueueItem) => {
    if (!item.suggestedName) return;

    updateQueueItem(item.id, {
      status: 'HASHED',
      metadata: {
        ...item.metadata,
        name: item.suggestedName,
      },
      suggestedName: undefined,
      error: undefined,
    });
  }, [updateQueueItem]);

  return (
    <div className={joinClassNames('drive-upload', className)}>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{title}</h2>
          <p style={{ margin: '0.5rem 0 0', color: '#666' }}>{description}</p>
        </div>

        {config.invalidReason ? (
          <div style={{ border: '1px solid #dc2626', background: '#fef2f2', color: '#7f1d1d', borderRadius: '0.5rem', padding: '0.75rem 1rem' }}>
            {config.invalidReason}
          </div>
        ) : null}

        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!config.invalidReason) setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
          onClick={() => {
            if (!config.invalidReason) fileInputRef.current?.click();
          }}
          style={{
            border: `2px dashed ${isDragging ? '#2563eb' : '#cbd5e1'}`,
            background: isDragging ? '#eff6ff' : '#fff',
            borderRadius: '0.75rem',
            padding: '2rem',
            textAlign: 'center',
            cursor: config.invalidReason ? 'not-allowed' : 'pointer',
            opacity: config.invalidReason ? 0.6 : 1,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>Drop files here or click to browse</p>
          <p style={{ margin: '0.5rem 0 0', color: '#666' }}>
            Maximum file size: {(maxSize / (1024 * 1024)).toFixed(0)}MB
          </p>
          {acceptedTypes && acceptedTypes.length > 0 ? (
            <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.875rem' }}>
              Accepted types: {acceptedTypes.join(', ')}
            </p>
          ) : null}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes?.join(',')}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.currentTarget.value = '';
          }}
          style={{ display: 'none' }}
        />

        {queue.length > 0 ? (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
            {queue.map((item) => (
              <li
                key={item.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.75rem',
                  padding: '0.75rem 1rem',
                  display: 'grid',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '1rem' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.metadata.name}
                    </div>
                    <div style={{ color: item.status === 'ERROR' ? '#b91c1c' : '#666', fontSize: '0.875rem' }}>
                      {getStatusText(item)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(item.id)}
                    style={{
                      border: '1px solid #cbd5e1',
                      background: '#fff',
                      borderRadius: '0.375rem',
                      padding: '0.25rem 0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>

                {(item.status === 'HASHING' || item.status === 'UPLOADING') ? (
                  <progress value={item.progress} max={100} style={{ width: '100%' }} />
                ) : null}

                {item.error ? (
                  <div style={{ color: '#b91c1c', fontSize: '0.875rem' }}>{item.error}</div>
                ) : null}

                {item.status === 'DUPLICATE_NAME' && item.suggestedName ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.875rem', color: '#666' }}>
                      Upload as <strong>{item.suggestedName}</strong>?
                    </span>
                    <button
                      type="button"
                      onClick={() => continueWithSuggestedName(item)}
                      style={{
                        border: '1px solid #cbd5e1',
                        background: '#f8fafc',
                        borderRadius: '0.375rem',
                        padding: '0.375rem 0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Use suggested name
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default Upload;
