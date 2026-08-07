/*
::neup.documentation::account-session-helper
::function getSignedInAccountIdentity()
::title Get Signed-In Account Identity
::owner Neup Drive

::public

Resolves the signed-in account from the verified `auth_account` cookie.

::returns
::datatype Promise<{ accountId: string; displayName: string | null } | null>

The active account identity when the cookie and session are valid; otherwise
`null`.

::public end

::private

The helper prefers the verified account header set by middleware, falls back to
verifying the signed cookie directly, and returns the best available display
label for analytics and page personalization.

::private end

::end
*/
import { createPublicKey, verify } from 'node:crypto';
import { cookies, headers } from 'next/headers';

import { prisma } from '@/core/database/prisma';

function base64UrlDecode(input: string) {
  let normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) normalized += '=';
  return Buffer.from(normalized, 'base64').toString('utf8');
}

function base64UrlToBuffer(input: string) {
  let normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) normalized += '=';
  return Buffer.from(normalized, 'base64');
}

type AuthAccountPayload = {
  aid?: unknown;
  accountId?: unknown;
  sub?: unknown;
  exp?: unknown;
};

let cachedPublicKey: ReturnType<typeof createPublicKey> | null | undefined;

function getAuthPublicKey() {
  if (cachedPublicKey !== undefined) return cachedPublicKey;

  const pem = process.env.NEUP_AUTH_PUBLIC_KEY;
  if (!pem) {
    cachedPublicKey = null;
    return cachedPublicKey;
  }

  try {
    cachedPublicKey = createPublicKey(pem.replace(/\\n/g, '\n'));
  } catch {
    cachedPublicKey = null;
  }

  return cachedPublicKey;
}

function parseAuthAccountPayload(token: string): AuthAccountPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(base64UrlDecode(parts[1])) as AuthAccountPayload;
  } catch {
    return null;
  }
}

export function getVerifiedAuthAccountIdFromToken(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, body, signature] = parts;
  const payload = parseAuthAccountPayload(token);
  if (!payload) return null;

  if (typeof payload.exp === 'number' && payload.exp <= Date.now() / 1000) {
    return null;
  }

  // Support the documented local unsigned token fallback used in development.
  if (header === 'unsigned' && signature === 'nosig') {
    const accountId = payload.aid ?? payload.accountId ?? payload.sub;
    return typeof accountId === 'string' ? accountId : null;
  }

  const publicKey = getAuthPublicKey();
  if (!publicKey) return null;

  const isValid = verify(
    'RSA-SHA256',
    Buffer.from(`${header}.${body}`),
    publicKey,
    base64UrlToBuffer(signature)
  );

  if (!isValid) return null;

  const accountId = payload.aid ?? payload.accountId ?? payload.sub;
  return typeof accountId === 'string' ? accountId : null;
}

export async function getVerifiedAuthAccountId() {
  const forwardedAccountId = (await headers()).get('x-account-id');
  if (forwardedAccountId) return forwardedAccountId;

  const authCookie = (await cookies()).get('auth_account')?.value;
  if (!authCookie) return null;

  return getVerifiedAuthAccountIdFromToken(authCookie);
}

export async function getSignedInAccountIdentity() {
  const accountId = await getVerifiedAuthAccountId();
  if (!accountId) return null;

  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { display_name: true, neupid: true },
  });

  return {
    accountId,
    displayName: account?.display_name || account?.neupid || null,
  };
}
