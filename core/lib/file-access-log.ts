import { createHash } from 'node:crypto';
import path from 'node:path';

import { generateNonce } from '@/core/lib/upload-client';
import { signCdnPayloadBase64 } from '@/core/lib/cdn-token';
import type { UploadSignaturePayload } from '@/core/lib/upload-types';

/*
::neup.documentation::bridge-file-access-log
::title Bridge File Access Log Helpers

Appends structured file access and mutation records to the account-scoped bridge log file stored at `uploads/<account>/.logs/2026jun25`.

::private

::function appendBridgeFileAccessLog(params)

Stores one JSON line per event with the timestamp, file type, accessed location, originating page, viewer details, and action label.

::details

This module reads the current log file from the CDN, appends a new JSON line, and overwrites the same log file through the signed upload flow so API actions and viewer activity share one storage-backed audit trail.

::private end

::end
*/

const CDN_BASE_URL = (process.env.CDN_BASE_URL || process.env.NEXT_PUBLIC_CDN_BASE_URL || process.env.CDN_HOST || 'http://localhost:3001').replace(/\/$/, '');
const CDN_UPLOAD_URL = process.env.CDN_UPLOAD_URL || process.env.NEXT_PUBLIC_CDN_UPLOAD_URL || `${CDN_BASE_URL}/upload`;
const PRIVATE_KEY = process.env.UPLOAD_SECRET_PRIVATE_KEY || '';
const LOG_FOLDER = '.logs';
const LOG_FILENAME = '2026jun25';
const LOG_CONTENT_TYPE = 'text/plain; charset=utf-8';

function encodeSignedUploadToken(token: { payload: string; signature: string }) {
    return Buffer.from(JSON.stringify(token)).toString('base64url');
}

function buildBridgeAccessLogUrl(owner: string) {
    return `${CDN_BASE_URL}/files/${encodeURIComponent(owner)}/${encodeURIComponent(LOG_FOLDER)}/${encodeURIComponent(LOG_FILENAME)}`;
}

export function buildBridgeAccessLogPath(owner: string) {
    return path.posix.join('uploads', owner, LOG_FOLDER, LOG_FILENAME);
}

async function readBridgeAccessLog(owner: string) {
    const response = await fetch(buildBridgeAccessLogUrl(owner), {
        method: 'GET',
        cache: 'no-store',
    });

    if (response.status === 404) return '';
    if (!response.ok) {
        throw new Error(`Unable to read access log (${response.status})`);
    }

    return response.text();
}

async function writeBridgeAccessLog(owner: string, content: string) {
    if (!PRIVATE_KEY) {
        throw new Error('Server configuration error: Missing private key');
    }

    const destinationPath = buildBridgeAccessLogPath(owner);
    const body = Buffer.from(content, 'utf8');
    const fileHash = createHash('sha256').update(body).digest('hex');
    const payload: UploadSignaturePayload = {
        path: destinationPath,
        account_id: owner,
        method: 'PUT',
        max_size: body.length,
        content_type: LOG_CONTENT_TYPE,
        expires_at: Math.floor(Date.now() / 1000) + (5 * 60),
        nonce: generateNonce(),
        key_id: 'bridge-log',
    };
    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = await signCdnPayloadBase64(payloadBase64, PRIVATE_KEY);

    const response = await fetch(CDN_UPLOAD_URL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Range': `bytes 0-${Math.max(body.length - 1, 0)}/${body.length}`,
            'x-file-hash': fileHash,
            'x-upload-token': encodeSignedUploadToken({ payload: payloadBase64, signature }),
        },
        body,
    });

    let data: any = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok || !data?.success) {
        throw new Error(data?.error || data?.message || `Unable to write access log (${response.status})`);
    }
}

export async function appendBridgeFileAccessLog(params: {
    owner: string;
    fileType: string;
    location: string;
    sourcePage: string;
    viewerInfo?: Record<string, unknown>;
    action: string;
    timestamp?: string;
}) {
    const existing = await readBridgeAccessLog(params.owner);
    const entry = JSON.stringify({
        timestamp: params.timestamp || new Date().toISOString(),
        filetype: params.fileType,
        location: params.location,
        fromwhatpageorsitewasitopenedon: params.sourcePage,
        viewerinfoinjson: params.viewerInfo ?? {},
        action: params.action,
    });
    const nextContent = existing ? `${existing.replace(/\n?$/, '\n')}${entry}\n` : `${entry}\n`;
    await writeBridgeAccessLog(params.owner, nextContent);
}
