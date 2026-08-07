import { createBLAKE3 } from 'hash-wasm';

/**
 * Helper to hash a File using BLAKE3 (WASM)
 */
export async function hashFile(
    file: File,
    onProgress?: (progress: number) => void
): Promise<string> {
    const hasher = await createBLAKE3();
    const chunkSize = 10 * 1024 * 1024; // 10MB chunks for better performance
    const total = file.size;
    let offset = 0;

    hasher.init();

    while (offset < total) {
        const end = Math.min(offset + chunkSize, total);
        const slice = file.slice(offset, end);
        const buffer = await slice.arrayBuffer();

        // update accepts Uint8Array
        hasher.update(new Uint8Array(buffer));

        offset += buffer.byteLength;

        if (onProgress) {
            // Calculate progress percentage
            // Avoid 100% until fully done
            const progress = Math.min(99, (offset / total) * 100);
            onProgress(progress);
        }
    }

    const hash = hasher.digest('hex');
    if (onProgress) onProgress(100);

    return hash;
}
