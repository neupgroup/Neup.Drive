import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/core/lib/db';
import crypto from 'crypto';

function base64UrlDecode(input: string) {
  input = input.replace(/-/g, '+').replace(/_/g, '/');
  // Pad
  while (input.length % 4) input += '=';
  return Buffer.from(input, 'base64').toString('utf8');
}

function signJwt(payload: object, secret: string, expiresInSeconds = 3600) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const full = { ...payload, iat, exp };

  const encoded = (obj: object) => Buffer.from(JSON.stringify(obj)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const headerB = encoded(header);
  const payloadB = encoded(full);
  const sig = crypto.createHmac('sha256', secret).update(`${headerB}.${payloadB}`).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${headerB}.${payloadB}.${sig}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appId, appSecret } = body || {};

    if (!appId || !appSecret) {
      return NextResponse.json({ error: 'Missing appId or appSecret' }, { status: 400 });
    }

    // Validate application credentials
    if (appId !== process.env.NEUP_APP_ID || appSecret !== process.env.NEUP_APP_SECRET) {
      return NextResponse.json({ error: 'Invalid app credentials' }, { status: 401 });
    }

    // Only allow internal or partnership party. In this simplified implementation
    // treat NEUP_APP_ID as internal/partnership allowed. Real implementation
    // should check application metadata.

    // Get auth_account cookie
    const cookie = request.cookies.get('auth_account')?.value;
    if (!cookie) return NextResponse.json({ error: 'Missing auth_account cookie' }, { status: 401 });

    // Try to parse cookie as JWT and extract aid/sid/skey
    let parsed: any = null;
    try {
      const parts = cookie.split('.');
      if (parts.length >= 2) {
        const payload = base64UrlDecode(parts[1]);
        parsed = JSON.parse(payload);
      }
    } catch (e) {
      // ignore - parsed stays null
    }

    if (!parsed || (!parsed.aid && !parsed.accountId)) {
      return NextResponse.json({ error: 'Invalid auth_account cookie' }, { status: 401 });
    }

    const aid = parsed.aid || parsed.accountId || parsed.sub;
    const sid = parsed.sid;
    const skey = parsed.skey;

    if (!aid || !sid || !skey) {
      return NextResponse.json({ error: 'Invalid signin session data' }, { status: 401 });
    }

    // Validate backing signin session in DB
    const session = await prisma.signinSession.findFirst({ where: { aid, sid, skey } });
    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired signin session' }, { status: 401 });
    }

    // Load account
    const accountId = session.accountId || aid;
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    // Build response shape (filter fields if empty)
    const occurredAt = new Date().toISOString();
    const accountObj: any = { id: account.id, connectionId: account.connection_id ?? null };
    if (account.neupid) accountObj.neupid = account.neupid;
    // isMinor unknown - default to false
    accountObj.isMinor = false;

    const profile: any = {};
    if (account.display_name) profile.displayName = account.display_name;
    if (account.display_image) profile.displayImage = account.display_image;

    const role = account.role_id ? { id: account.role_id, name: account.role_id } : undefined;

    // Create a signed token for the account
    const jwtSecret = process.env.NEUP_APP_SECRET || process.env.UPLOAD_SECRET_PRIVATE_KEY || 'fallback_secret';
    const token = signJwt({ sub: account.id, appId }, jwtSecret);

    const response: any = {
      success: true,
      appId,
      occurredAt,
      account: accountObj,
      token,
    };

    if (Object.keys(profile).length) response.profile = profile;
    if (role) response.role = role;

    return NextResponse.json(response);
  } catch (error) {
    console.error('sign&get error', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'method_not_allowed' }, { status: 405 });
}
