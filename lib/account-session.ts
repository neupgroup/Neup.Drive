/*
::neup.documentation::account-session-helper
::function getSignedInAccountIdentity()
::title Get Signed-In Account Identity
::owner Neup Drive

::public

Resolves the signed-in account from the `auth_account` cookie and backing
signin session.

::returns
::datatype Promise<{ accountId: string; displayName: string | null } | null>

The active account identity when the cookie and session are valid; otherwise
`null`.

::public end

::private

The helper decodes the JWT-style cookie payload locally, validates the session
through Prisma, and returns the best available display label for analytics and
page personalization.

::private end

::end
*/
import { cookies } from 'next/headers';

import { prisma } from '@/core/lib/db';

function base64UrlDecode(input: string) {
  let normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) normalized += '=';
  return Buffer.from(normalized, 'base64').toString('utf8');
}

export async function getSignedInAccountIdentity() {
  const authCookie = (await cookies()).get('auth_account')?.value;
  if (!authCookie) return null;

  let payload: Record<string, unknown> | null = null;
  try {
    const parts = authCookie.split('.');
    if (parts.length < 2) return null;
    payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }

  const aid = payload?.aid || payload?.accountId || payload?.sub;
  const sid = payload?.sid;
  const skey = payload?.skey;

  if (
    typeof aid !== 'string' ||
    typeof sid !== 'string' ||
    typeof skey !== 'string'
  ) {
    return null;
  }

  const session = await prisma.signinSession.findFirst({
    where: { aid, sid, skey },
    select: { accountId: true },
  });

  if (!session) return null;

  const accountId = session.accountId || aid;
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: { display_name: true, neupid: true },
  });

  return {
    accountId,
    displayName: account?.display_name || account?.neupid || null,
  };
}
