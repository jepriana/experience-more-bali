import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * Admin sign-in for the KOSSI team. One shared passcode, set on the server only
 * (ADMIN_PASSCODE in .env.local) — never sent to the browser bundle.
 * A signed, http-only cookie keeps the session for 12 hours.
 */

export const ADMIN_COOKIE = 'kossi_admin';
const SESSION_MS = 12 * 60 * 60 * 1000;

function secret(): string | null {
  const s = process.env.ADMIN_PASSCODE?.trim();
  return s && s.length >= 6 ? s : null;
}

export function isAdminConfigured() {
  return secret() !== null;
}

function sign(payload: string, key: string) {
  return createHmac('sha256', key).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPasscode(passcode: string): boolean {
  const key = secret();
  return !!key && safeEqual(sign(passcode, 'pass'), sign(key, 'pass'));
}

export function createSessionToken(): string {
  const key = secret()!;
  const exp = String(Date.now() + SESSION_MS);
  return `${exp}.${sign(`admin|${exp}`, key)}`;
}

export async function isAdmin(): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [exp, mac] = token.split('.');
  if (!exp || !mac || Number(exp) < Date.now()) return false;
  return safeEqual(mac, sign(`admin|${exp}`, key));
}

export const SESSION_MAX_AGE_S = SESSION_MS / 1000;
