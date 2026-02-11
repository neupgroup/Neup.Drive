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

/**
 * Step 3.1: Client Request Metadata
 */
export interface UploadInitRequest {
    file_id: string;      // Client-generated UUID
    filename: string;
    size: number;
    mime: string;
    file_hash: string;    // SHA-256 hash
}

/**
 * Step 3.4: Server Response
 */
export interface UploadInitResponse {
    upload_session_id: string;
    destination_path: string;
    upload_endpoint: string;
    signed_upload_token: SignedUploadRequest;
    expires_at: number;
}
