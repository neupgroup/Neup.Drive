import type { UploadInitResponse } from './upload-types';

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
    const CHUNK_SIZE = 25 * 1024 * 1024; // 25MB (User requested: "Chunk size = 25 MB")
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedBytes = 0;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Prepare headers
        const headers: HeadersInit = {
            'x-upload-session-id': sessionData.upload_session_id,
            'x-file-hash': fileHash,
            'x-upload-token': JSON.stringify(sessionData.signed_upload_token),
            'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
            'Content-Type': 'application/octet-stream',
        };

        try {
            const response = await fetch(sessionData.upload_endpoint, {
                method: 'PUT',
                headers,
                body: chunk,
            });

            if (!response.ok) {
                // Try to parse error message as JSON
                let errorMessage = `Status ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.error) {
                        errorMessage = errorData.error;
                        if (errorData.code) {
                            errorMessage += ` (Code: ${errorData.code})`;
                        }
                    }
                } catch {
                    // Fallback to text if not JSON
                    const errorText = await response.text().catch(() => response.statusText);
                    if (errorText) errorMessage = errorText;
                }
                throw new Error(`Upload failed for chunk ${chunkIndex + 1}/${totalChunks}: ${errorMessage}`);
            }

            // Update progress
            uploadedBytes += chunk.size;
            if (onProgress) {
                const progress = Math.min(100, (uploadedBytes / file.size) * 100);
                onProgress(progress);
            }

        } catch (error) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw new Error('CDN unreachable: Network error during chunk upload. Please check your internet connection or CDN status.');
            }
            console.error(`Chunk upload error (chunk ${chunkIndex}):`, error);
            throw error;
        }
    }
}
