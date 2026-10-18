import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Device identities for travelers and partners (no passwords in the MVP).
 * The browser keeps an id + secret key next to the account; the server stores only a hash of
 * the key. Requests prove ownership with the headers below.
 */

export const ID_HEADER = 'x-kossi-id';
export const KEY_HEADER = 'x-kossi-key';

export function newId(prefix: string, bytes = 9): string {
  return `${prefix}_${randomBytes(bytes).toString('base64url')}`;
}

export function newSecret(): string {
  return randomBytes(24).toString('base64url');
}

export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

export function secretMatches(secret: string | null | undefined, hash: string | undefined): boolean {
  if (!secret || !hash) return false;
  const a = Buffer.from(hashSecret(secret));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function credentialsFrom(request: Request): { id: string; key: string } | null {
  const id = request.headers.get(ID_HEADER);
  const key = request.headers.get(KEY_HEADER);
  return id && key && id.length < 60 && key.length < 80 ? { id, key } : null;
}
