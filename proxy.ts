import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { buildPublicAppUrl } from '@/core/helpers/link/url';
import { account } from '@/logica/account';

/**
 * proxy.ts — Next.js Edge Middleware
 *
 * auth_account cookie is a JWT signed with NEUP_AUTH_PUBLIC_KEY (RS256).
 *
 * Rules:
 *   1. /bridge/*       → always pass through
 *   2. Static/_next    → always pass through
 *   3. All other app routes require a full authenticated session:
 *                        - valid JWT, aid present, nid present, no guest flag
 *                        → redirect to the documented handshake grant flow on failure
 */

// ---------------------------------------------------------------------------
// JWT payload
// ---------------------------------------------------------------------------

type JwtPayload = {
  aid?: string;
  sid?: string;
  skey?: string;
  nid?: string;
  guest?: number;
};

async function verifyJwt(token: string): Promise<JwtPayload | null> {
  const verification = await account.auth.verify(token);
  if (!verification.valid) return null;

  return {
    aid: typeof verification.payload.aid === 'string' ? verification.payload.aid : undefined,
    sid: typeof verification.payload.sid === 'string' ? verification.payload.sid : undefined,
    skey: typeof verification.payload.skey === 'string' ? verification.payload.skey : undefined,
    nid: typeof verification.payload.nid === 'string' ? verification.payload.nid : undefined,
    guest: verification.payload.guest === true ? 1 : verification.payload.guest === false ? 0 : verification.payload.guest,
  };
}

// ---------------------------------------------------------------------------
// URL constants
// ---------------------------------------------------------------------------

const NEUPID_BASE = 'https://neupgroup.com/account';

// ---------------------------------------------------------------------------
// Redirect helpers
// ---------------------------------------------------------------------------

function redirectToNeupStart(request: NextRequest, pathname: string): NextResponse {
  const dest = new URL(`${NEUPID_BASE}/auth/start`);
  const redirectTarget = buildPublicAppUrl(request, `${pathname}${request.nextUrl.search}`);
  if (redirectTarget) {
    dest.searchParams.set('authenticatesTo', redirectTarget);
  }
  return NextResponse.redirect(dest);
}

function hasAuthenticatedSession(payload: JwtPayload | null): payload is JwtPayload & { aid: string; nid: string } {
  return Boolean(payload?.aid && payload.nid && payload.guest !== 1);
}

// ---------------------------------------------------------------------------
// Proxy (middleware entry point)
// ---------------------------------------------------------------------------

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Attach pathname for downstream server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', pathname);

  const pass = () => NextResponse.next({ request: { headers: requestHeaders } });

  // ── 1. Bridge routes — always pass through ──────────────────────────────
  if (pathname.startsWith('/bridge')) {
    return pass();
  }

  // ── 2. Static assets — always pass through ──────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/.well-known')
  ) {
    return pass();
  }

  // ── 3. HTTPS enforcement ─────────────────────────────────────────────────
  const proto = request.headers.get('x-forwarded-proto');
  const isSecure = proto === 'https' || request.nextUrl.protocol === 'https:';
  if (!isSecure) {
    const dest = new URL('https://neupgroup.com/account/auth/unsecure');
    dest.searchParams.set('redirectsTo', buildPublicAppUrl(request, `${pathname}${request.nextUrl.search}`));
    return NextResponse.redirect(dest);
  }

  // ── 4. Device block ──────────────────────────────────────────────────────
  if (request.cookies.has('device_block') && pathname !== '/auth/blocked') {
    return NextResponse.redirect(new URL('/auth/blocked', request.url));
  }

  // ── Read and verify the auth_account JWT ─────────────────────────────────
  const raw = request.cookies.get('auth_account')?.value;
  const payload = raw ? await verifyJwt(raw.trim()) : null;

  // Forward the verified account ID downstream so server components can use
  // it without re-parsing the JWT (signature already verified here).
  if (payload?.aid) {
    requestHeaders.set('x-account-id', payload.aid);
  }

  // ── 5. All app routes require a full authenticated session ───────────────
  if (!hasAuthenticatedSession(payload)) {
    return redirectToNeupStart(request, pathname);
  }

  return pass();
}

export const config = {
  matcher: [
    '/((?!_next(?:/.*)?|bridge(?:/.*)?|robots\\.txt$|sitemap\\.xml$|sitemap(?:/.*)?|favicon\\.ico$|humans\\.txt$|\\.well-known(?:/.*)?).*)',
  ],
};
