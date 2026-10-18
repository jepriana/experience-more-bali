import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashSecret, newId, newSecret } from '@/lib/server/identity';
import { authMember, authTraveler, membersStore, travelersStore } from '@/lib/server/ecosystemStore';
import { PARTNER_TYPES } from '@/data/partnerGroups';
import { BALI_REGIONS } from '@/data/regions';

/**
 * POST /api/identity — create (or update) a device identity.
 * Without credentials: creates one and returns { id, key } once (the browser stores them).
 * With valid credentials: updates the public profile fields and returns { id }.
 */

const text = (max: number) => z.string().trim().max(max);
const Traveler = z.object({ role: z.literal('traveler'), name: text(60).min(1), homeRegion: text(80) });
const Partner = z.object({
  role: z.literal('partner'),
  name: text(80).min(1),
  picName: text(60),
  contact: text(60),
  partnerType: z.enum(PARTNER_TYPES.map((t) => t.id) as [string, ...string[]]).optional(),
  regionId: z.enum(BALI_REGIONS.map((r) => r.id) as [string, ...string[]]).optional(),
  area: text(60).optional(),
  listingId: z.string().regex(/^partner-[\w-]{4,60}$/).optional()
});
const Body = z.discriminatedUnion('role', [Traveler, Partner]);

export async function POST(request: Request) {
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid profile.' }, { status: 400 });
  const body = parsed.data;
  const now = new Date().toISOString();

  if (body.role === 'traveler') {
    const me = await authTraveler(request);
    if (me) {
      await travelersStore.update((d) => {
        d.travelers[me.id] = { ...d.travelers[me.id], name: body.name, homeRegion: body.homeRegion };
      });
      return NextResponse.json({ id: me.id });
    }
    const id = newId('tr');
    const key = newSecret();
    await travelersStore.update((d) => {
      d.travelers[id] = { id, keyHash: hashSecret(key), name: body.name, homeRegion: body.homeRegion, createdAt: now };
    });
    return NextResponse.json({ id, key });
  }

  const me = await authMember(request);
  const fields = {
    name: body.name,
    picName: body.picName,
    contact: body.contact,
    partnerType: body.partnerType,
    regionId: body.regionId,
    area: body.area,
    ...(body.listingId ? { listingId: body.listingId } : {})
  };
  if (me) {
    const updated = await membersStore.update((d) => {
      d.members[me.id] = { ...d.members[me.id], ...fields };
      return d.members[me.id];
    });
    return NextResponse.json({ id: me.id, checkinToken: updated.checkinToken });
  }
  const id = newId('pm');
  const key = newSecret();
  const checkinToken = newSecret().slice(0, 16);
  await membersStore.update((d) => {
    d.members[id] = { id, keyHash: hashSecret(key), checkinToken, createdAt: now, ...fields };
  });
  return NextResponse.json({ id, key, checkinToken });
}
