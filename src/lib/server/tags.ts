import { randomInt } from 'node:crypto';
import type { DestinationTag, PublicTag, TagClaim } from '@/lib/ecosystemTypes';

/** Helpers shared by the tag routes. */

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I/L

/** short code a traveler shows to staff, e.g. "K7-4QXP" */
export function claimCode(existing: Set<string>): string {
  for (;;) {
    const c = Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
    const code = `${c.slice(0, 2)}-${c.slice(2)}`;
    if (!existing.has(code)) return code;
  }
}

export const normalizeCode = (raw: string) => {
  const c = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return c.length === 6 ? `${c.slice(0, 2)}-${c.slice(2)}` : '';
};

/** metres between two points */
export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function toPublicTag(tag: DestinationTag, extra?: { collected?: boolean; claim?: TagClaim }): PublicTag {
  return {
    id: tag.id,
    name: tag.name,
    ownerName: tag.ownerName,
    track: tag.track,
    regionId: tag.regionId,
    area: tag.area,
    achievement: tag.achievement,
    discount: tag.discount,
    atSpot: !!tag.spot,
    active: tag.active,
    collected: extra?.collected,
    claim: extra?.claim ? { code: extra.claim.code, used: !!extra.claim.usedAt } : undefined
  };
}
