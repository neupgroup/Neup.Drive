import nodeCrypto, { type JsonWebKey } from 'node:crypto';

export type CdnFileAction = 'rename' | 'move' | 'delete' | 'view' | 'list';

export interface CdnFileOperationPayload {
    action: CdnFileAction;
    account_id: string;
    account_folder: string;
    folder_type: string;
    path: string;
    destination_path?: string;
    new_name?: string;
    method: 'GET' | 'POST';
    expires_at: number;
    device_ip?: string;
    user_agent?: string;
    nonce: string;
    key_id: string;
}

export interface SignedCdnToken {
    payload: string;
    signature: string;
}

function toBase64Url(buffer: Buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function createPrivateKey(privateKeyHex: string) {
    const privateKeyBytes = Buffer.from(privateKeyHex, 'hex');

    let dBuffer: Buffer;
    let xBuffer: Buffer | undefined;

    if (privateKeyBytes.length === 64) {
        dBuffer = privateKeyBytes.subarray(0, 32);
        xBuffer = privateKeyBytes.subarray(32, 64);
    } else if (privateKeyBytes.length === 32) {
        dBuffer = privateKeyBytes;
    } else {
        throw new Error(`Invalid private key length: ${privateKeyBytes.length} bytes. Expected 64 bytes or 32 bytes.`);
    }

    const jwk: JsonWebKey = {
        kty: 'OKP',
        crv: 'Ed25519',
        d: toBase64Url(dBuffer),
    };

    if (xBuffer) {
        jwk.x = toBase64Url(xBuffer);
    }

    return nodeCrypto.createPrivateKey({
        key: jwk,
        format: 'jwk',
    });
}

export function encodeSignedCdnToken(token: SignedCdnToken) {
    return toBase64Url(Buffer.from(JSON.stringify(token)));
}

export function signCdnPayloadBase64(payloadBase64: string, privateKeyHex: string) {
    if (!privateKeyHex) {
        throw new Error('Missing CDN signing private key');
    }

    const privateKey = createPrivateKey(privateKeyHex);
    const signature = nodeCrypto.sign(null, Buffer.from(payloadBase64), privateKey);
    return signature.toString('hex');
}

export function createSignedCdnToken(payload: CdnFileOperationPayload, privateKeyHex: string): SignedCdnToken {
    const payloadBase64 = toBase64Url(Buffer.from(JSON.stringify(payload)));
    return {
        payload: payloadBase64,
        signature: signCdnPayloadBase64(payloadBase64, privateKeyHex),
    };
}

export function parseDurationSeconds(value?: string | null, defaults = { min: 60, max: 15 * 60, fallback: 15 * 60 }) {
    const cleaned = (value || '').trim().toLowerCase();
    if (!cleaned) return defaults.fallback;

    const match = cleaned.match(/^(\d+)(m|h)$/);
    if (!match) return defaults.fallback;

    const amount = Number(match[1]);
    const seconds = match[2] === 'h' ? amount * 60 * 60 : amount * 60;
    return Math.min(Math.max(seconds, defaults.min), defaults.max);
}

export function formatDurationToken(seconds: number) {
    if (seconds % 3600 === 0) return `${seconds / 3600}h`;
    return `${Math.ceil(seconds / 60)}m`;
}

export function createExpiringOperationPayload(
    params: Omit<CdnFileOperationPayload, 'expires_at' | 'nonce' | 'key_id'>,
    expiresInSeconds = 15 * 60,
): CdnFileOperationPayload {
    return {
        ...params,
        expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
        nonce: crypto.randomUUID(),
        key_id: process.env.CDN_SIGNING_KEY_ID || 'drive-key',
    };
}
