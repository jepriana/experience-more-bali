import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  ADMIN_COOKIE,
  SESSION_MAX_AGE_S,
  checkPasscode,
  createSessionToken,
  isAdmin,
  isAdminConfigured
} from '@/lib/server/adminAuth';

/** KOSSI admin session: GET status · POST sign in · DELETE sign out. */

export async function GET() {
  return NextResponse.json({ configured: isAdminConfigured(), signedIn: await isAdmin() }, { headers: { 'Cache-Control': 'no-store' } });
}

// Slow down passcode guessing (per server process)
let failures = 0;
let lockedUntil = 0;

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json({ error: 'Admin is not set up. Add ADMIN_PASSCODE to .env.local.' }, { status: 503 });
  }
  if (Date.now() < lockedUntil) {
    return NextResponse.json({ error: 'Too many attempts. Try again in a minute.' }, { status: 429 });
  }
  const parsed = z.object({ passcode: z.string().max(200) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success || !checkPasscode(parsed.data.passcode)) {
    failures += 1;
    if (failures >= 5) {
      lockedUntil = Date.now() + 60_000;
      failures = 0;
    }
    return NextResponse.json({ error: 'Wrong passcode.' }, { status: 401 });
  }
  failures = 0;
  const res = NextResponse.json({ signedIn: true });
  res.cookies.set(ADMIN_COOKIE, createSessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_S
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ signedIn: false });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 0 });
  return res;
}
