import type { UploadSignaturePayload } from './upload-types';

/**
 * Verify Ed25519 signature (server-side)
 */
async function verifySignature(
    payload: UploadSignaturePayload,
    signature: string,
    publicKeyHex: string
): Promise<boolean> {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(JSON.stringify(payload));
        
        // Convert hex string to Uint8Array
        const publicKeyBytes = new Uint8Array(
            publicKeyHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        );

        if (publicKeyBytes.length !== 32) {
            console.error('Invalid public key length');
            return false;
        }

        const key = await crypto.subtle.importKey(
            'raw',
            publicKeyBytes,
            { name: 'Ed25519' },
            false,
            ['verify']
        );

        const signatureBytes = new Uint8Array(
            signature.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
        );

        return await crypto.subtle.verify('Ed25519', key, signatureBytes, data);
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

/**
 * Validate upload request (server-side)
 */
export async function validateUploadRequest(
    payload: UploadSignaturePayload,
    signature: string,
    secretKey: string,
    fileSize: number
): Promise<{ valid: boolean; error?: string }> {
    // Verify signature
    const isValidSignature = await verifySignature(payload, signature, secretKey);
    if (!isValidSignature) {
        return { valid: false, error: 'Invalid signature' };
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (now > payload.expires_at) {
        return { valid: false, error: 'Signature has expired' };
    }

    // Verify method
    if (payload.method !== 'PUT') {
        return { valid: false, error: 'Invalid method' };
    }

    // Check file size
    if (fileSize > payload.max_size) {
        return {
            valid: false,
            error: `File size ${fileSize} exceeds maximum allowed size ${payload.max_size}`
        };
    }

    // Validate path (prevent directory traversal)
    if (payload.path.includes('..') || payload.path.startsWith('/')) {
        return { valid: false, error: 'Invalid path' };
    }

    return { valid: true };
}

/**
 * Store nonce to prevent replay attacks (implement with your database)
 */
export async function storeNonce(
    nonce: string,
    expiresAt: number
): Promise<void> {
    // TODO: Implement nonce storage in your database
    // This should store the nonce with its expiration time
    // and be used to check for replay attacks
    console.log('Store nonce:', nonce, 'expires at:', expiresAt);
}

/**
 * Check if nonce has been used (implement with your database)
 */
export async function isNonceUsed(nonce: string): Promise<boolean> {
    // TODO: Implement nonce checking in your database
    // Return true if the nonce has already been used
    console.log('Check nonce:', nonce);
    return false;
}

/**
 * Complete validation with replay attack prevention
 */
export async function validateUploadWithReplayProtection(
    payload: UploadSignaturePayload,
    signature: string,
    secretKey: string,
    fileSize: number
): Promise<{ valid: boolean; error?: string }> {
    // Check for replay attack
    const nonceUsed = await isNonceUsed(payload.nonce);
    if (nonceUsed) {
        return { valid: false, error: 'Nonce has already been used (replay attack detected)' };
    }

    // Validate the request
    const validation = await validateUploadRequest(payload, signature, secretKey, fileSize);

    if (validation.valid) {
        // Store the nonce to prevent future replay attacks
        await storeNonce(payload.nonce, payload.expires_at);
    }

    return validation;
}
