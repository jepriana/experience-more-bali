'use client';

import { patchPartner, patchTraveler, readAccounts, travelerRegionLabel, partnerRegionLabel } from '@/lib/accounts';
import { normalizePartnerType } from '@/data/partnerGroups';

/**
 * Device identities for server features. Created on first use and kept with the account in
 * this browser; every request sends them as headers. (A real login can replace this later —
 * only this file and the server's auth helpers would change.)
 */

const ID_HEADER = 'x-kossi-id';
const KEY_HEADER = 'x-kossi-key';

let travelerInflight: Promise<{ id: string; key: string } | null> | null = null;
let partnerInflight: Promise<{ id: string; key: string; checkinToken?: string } | null> | null = null;

/** Traveler identity, created on first use. Null if not signed up as a traveler. */
export function ensureTravelerIdentity(): Promise<{ id: string; key: string } | null> {
  const { traveler } = readAccounts();
  if (!traveler) return Promise.resolve(null);
  if (traveler.serverId && traveler.serverKey) return Promise.resolve({ id: traveler.serverId, key: traveler.serverKey });
  travelerInflight ??= (async () => {
    try {
      const res = await fetch('/api/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'traveler', name: traveler.name, homeRegion: travelerRegionLabel(traveler) })
      });
      if (!res.ok) return null;
      const { id, key } = await res.json();
      patchTraveler({ serverId: id, serverKey: key });
      return { id, key };
    } catch {
      return null;
    } finally {
      travelerInflight = null;
    }
  })();
  return travelerInflight;
}

function partnerProfileBody() {
  const { partner } = readAccounts();
  if (!partner) return null;
  return {
    role: 'partner' as const,
    name: partner.businessName,
    picName: partner.picName,
    contact: partner.contact,
    partnerType: normalizePartnerType(partner.profile?.type),
    regionId: partner.regionId,
    area: partner.area,
    listingId: partner.publishedPartnerId
  };
}

/**
 * Partner network identity, created on first use; also refreshes the public profile
 * (name, type, region, listing) on the server so the network sees current details.
 */
let partnerSyncedKey = '';

export function ensurePartnerIdentity(force = false): Promise<{ id: string; key: string; checkinToken?: string } | null> {
  const { partner } = readAccounts();
  const body = partnerProfileBody();
  if (!partner || !body) return Promise.resolve(null);
  // profile already sent this page-session and unchanged → no request
  const sig = JSON.stringify(body);
  if (!force && partner.memberId && partner.memberKey && partnerSyncedKey === sig) {
    return Promise.resolve({ id: partner.memberId, key: partner.memberKey, checkinToken: partner.checkinToken });
  }
  partnerInflight ??= (async () => {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (partner.memberId && partner.memberKey) {
        headers[ID_HEADER] = partner.memberId;
        headers[KEY_HEADER] = partner.memberKey;
      }
      const res = await fetch('/api/identity', { method: 'POST', headers, body: JSON.stringify(body) });
      if (!res.ok) return null;
      const data = await res.json();
      const id = data.id as string;
      const key = (data.key as string | undefined) ?? partner.memberKey!;
      patchPartner({ memberId: id, memberKey: key, checkinToken: data.checkinToken ?? partner.checkinToken });
      partnerSyncedKey = sig;
      return { id, key, checkinToken: data.checkinToken };
    } catch {
      return null;
    } finally {
      partnerInflight = null;
    }
  })();
  return partnerInflight;
}

/** fetch() with the traveler or partner identity headers attached. */
export async function apiFetch(role: 'traveler' | 'partner', url: string, init: RequestInit = {}): Promise<Response> {
  const ident = role === 'traveler' ? await ensureTravelerIdentity() : await ensurePartnerIdentity();
  const headers = new Headers(init.headers);
  if (ident) {
    headers.set(ID_HEADER, ident.id);
    headers.set(KEY_HEADER, ident.key);
  }
  return fetch(url, { ...init, headers, cache: 'no-store' });
}

export { partnerRegionLabel };
