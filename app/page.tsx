/*
::neup.documentation::home-page
::route /
::title Personalized Home Page
::owner Neup Drive

::public

Shows the recent-items landing page at the application root with a personalized
welcome message derived from the signed-in account when available.

::returns
::datatype Promise<JSX.Element>

The homepage recent-items experience for the current account.

::public end

::private

The server component reads the `auth_account` cookie, validates the backing
signin session, and falls back to a generic greeting when account identity is
not available.

::private end

::end
*/
import { cookies } from 'next/headers';
import { RecentPageManager } from '@/components/prodrive/recent-page-manager';
import { prisma } from '@/core/lib/db';
import { getRecentDriveFiles } from '@/core/lib/drive-files';

function base64UrlDecode(input: string) {
  let normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) normalized += '=';
  return Buffer.from(normalized, 'base64').toString('utf8');
}

async function getHomepageDisplayName() {
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

  const account = await prisma.account.findUnique({
    where: { id: session.accountId || aid },
    select: { display_name: true, neupid: true },
  });

  return account?.display_name || account?.neupid || null;
}

export default async function HomePage() {
  const [files, displayName] = await Promise.all([
    getRecentDriveFiles(),
    getHomepageDisplayName(),
  ]);

  return (
    <RecentPageManager
      files={files}
      title={`Welcome back, ${displayName || 'there'}`}
      subtitle="Here's some files you might be interested in."
    />
  );
}
