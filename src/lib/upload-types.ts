/**
 * Upload signature payload structure
 */
export interface UploadSignaturePayload {
    path: string;
    account_id: string;
    method: 'PUT';
    max_size: number;
    content_type: string;
    expires_at: number; // Unix timestamp
    nonce: string;
    key_id: string;
}

/**
 * Upload request with signature
 */
export interface SignedUploadRequest {
    payload: UploadSignaturePayload;
    signature: string;
}

/**
 * Upload response
 */
export interface UploadResponse {
    success: boolean;
    url?: string;
    error?: string;
}
