import { z } from 'zod';
import { CURATED_BALI_PARTNERS } from '@/data/curatedPartners';

/**
 * QR memory links: /m/<code>, where the code carries the memory itself (base64url JSON).
 * No database needed for the MVP — any phone that scans the QR on a T-shirt, hat, bag or
 * counter card sees the page. Partners in a trip are stored as indexes into the curated
 * list to keep the QR small. When a backend arrives, the code can become a short id.
 */

const TravelerMemory = z.object({
  k: z.literal('t'),
  /** name / family / group */
  n: z.string().min(1).max(60),
  /** home region line */
  r: z.string().max(80),
  /** trip title */
  ti: z.string().max(80).optional(),
  /** days → curated partner indexes */
  d: z.array(z.array(z.number().int().min(0).max(999)).max(15)).max(10).default([])
});

const PartnerMemory = z.object({
  k: z.literal('p'),
  /** business name */
  n: z.string().min(1).max(80),
  /** region line, e.g. "Ubud · Gianyar, Bali" */
  r: z.string().max(80),
  /** business type */
  ty: z.string().max(30).optional(),
  /** discount % */
  dc: z.number().int().min(0).max(100).optional(),
  /** products / services */
  pr: z.array(z.string().max(60)).max(6).optional(),
  /** published listing id — lets the page show the live verification status */
  pi: z.string().max(80).optional()
});

const MemorySchema = z.discriminatedUnion('k', [TravelerMemory, PartnerMemory]);
export type Memory = z.infer<typeof MemorySchema>;
export type TravelerMemoryData = z.infer<typeof TravelerMemory>;
export type PartnerMemoryData = z.infer<typeof PartnerMemory>;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(code: string): string {
  const b64 = code.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
}

export function encodeMemory(memory: Memory): string {
  return toBase64Url(JSON.stringify(memory));
}

/** The memory in a code, or null if it is damaged or not a KOSSI memory. */
export function decodeMemory(code: string): Memory | null {
  if (!code || code.length > 3000 || !/^[A-Za-z0-9_-]+$/.test(code)) return null;
  try {
    const result = MemorySchema.safeParse(JSON.parse(fromBase64Url(code)));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

/** Trip days (partner ids per day) → indexes into the curated list; custom partners are left out. */
export function daysToIndexes(days: string[][]): number[][] {
  return days.map((ids) =>
    ids.map((id) => CURATED_BALI_PARTNERS.findIndex((p) => p.id === id)).filter((i) => i >= 0)
  );
}

export function indexesToPartners(days: number[][]) {
  return days.map((ids) => ids.map((i) => CURATED_BALI_PARTNERS[i]).filter(Boolean));
}

/**
 * Public base URL for links printed on gear. Set NEXT_PUBLIC_SITE_URL to the deployed address
 * so a QR printed during a local demo still opens the real site; otherwise the current origin.
 */
export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, '');
  if (configured) return configured;
  return typeof window !== 'undefined' ? window.location.origin : '';
}

export function memoryUrl(memory: Memory): string {
  return `${siteOrigin()}/m/${encodeMemory(memory)}`;
}

/** Short link of a trip saved on the server (photos & videos live there). */
export function tripUrl(tripId: string): string {
  return `${siteOrigin()}/m/${tripId}`;
}

export const isTripId = (code: string) => /^t_[\w-]{6,30}$/.test(code);

/** /tag/<id>.<token> — a destination QR tag (summit, trailhead, dive spot…) */
export function tagUrl(tagId: string, token: string): string {
  return `${siteOrigin()}/tag/${tagId}.${token}`;
}

export function parseTagCode(code: string): { id: string; token: string } | null {
  const m = /^(tg_[\w-]{4,20})\.([\w-]{6,40})$/.exec(code);
  return m ? { id: m[1], token: m[2] } : null;
}
