import { NextResponse, connection } from 'next/server';
import { z } from 'zod';
import { newId } from '@/lib/server/identity';
import { authTraveler, checkinsStore, tagsStore } from '@/lib/server/ecosystemStore';
import { claimCode, distanceM, toPublicTag } from '@/lib/server/tags';
import type { TagClaim } from '@/lib/ecosystemTypes';

/**
 * A destination QR tag, as seen by the traveler who scanned it (/tag/<id>.<token>).
 * GET  ?t=<token>[&scan=1] → the tag (scan=1 counts the scan)
 * POST { t, action: 'collect' | 'claim', lat?, lng? } → collect the achievement / claim the discount
 * The token must match: renewing a tag makes old printed copies stop working.
 */

const noStore = { 'Cache-Control': 'no-store' };
const invalid = () => NextResponse.json({ error: 'invalid' }, { status: 404, headers: noStore });

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const url = new URL(request.url);
  const token = url.searchParams.get('t');
  const me = await authTraveler(request);

  const { tags, claims } = await tagsStore.read();
  const tag = tags[id];
  if (!tag || !token || tag.token !== token) return invalid();
  if (url.searchParams.get('scan') === '1') {
    await tagsStore.update((d) => {
      if (d.tags[id]) d.tags[id].scans += 1;
    });
  }

  let collected: boolean | undefined;
  let claim;
  if (me) {
    collected = (await checkinsStore.read()).checkins.some((c) => c.travelerId === me.id && c.tagId === id);
    claim = claims.find((c) => c.tagId === id && c.travelerId === me.id);
  }
  return NextResponse.json({ tag: toPublicTag(tag, { collected, claim }) }, { headers: noStore });
}

const Body = z.object({
  t: z.string().max(80),
  action: z.enum(['collect', 'claim']),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional()
});

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const me = await authTraveler(request);
  if (!me) return NextResponse.json({ error: 'need-account' }, { status: 401 });
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const b = parsed.data;

  const tag = (await tagsStore.read()).tags[id];
  if (!tag || tag.token !== b.t) return invalid();
  if (!tag.active) return NextResponse.json({ error: 'paused' }, { status: 409 });

  // tags placed "only at this spot" (e.g. a summit) need the phone's location, checked once, not stored
  if (tag.spot) {
    if (b.lat === undefined || b.lng === undefined) return NextResponse.json({ error: 'need-location' }, { status: 400 });
    const d = distanceM(tag.spot, { lat: b.lat, lng: b.lng });
    if (d > tag.spot.radius) return NextResponse.json({ error: 'too-far', km: Math.round(d / 100) / 10 }, { status: 403 });
  }

  if (b.action === 'collect') {
    if (!tag.achievement) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    const result = await checkinsStore.update((d) => {
      const existing = d.checkins.find((c) => c.travelerId === me.id && c.tagId === tag.id);
      if (existing) return { already: true, checkin: existing };
      const record = {
        id: newId('ci', 8),
        travelerId: me.id,
        memberId: tag.ownerId,
        tagId: tag.id,
        placeName: tag.name,
        track: tag.track,
        regionId: tag.regionId,
        at: new Date().toISOString()
      };
      d.checkins.push(record);
      return { already: false, checkin: record };
    });
    return NextResponse.json(result, { headers: noStore });
  }

  if (!tag.discount) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const claim = await tagsStore.update((d) => {
    const existing = d.claims.find((c) => c.tagId === tag.id && c.travelerId === me.id);
    if (existing) return existing;
    const c: TagClaim = {
      id: newId('cl', 8),
      tagId: tag.id,
      travelerId: me.id,
      code: claimCode(new Set(d.claims.map((x) => x.code))),
      at: new Date().toISOString()
    };
    d.claims.push(c);
    return c;
  });
  return NextResponse.json({ claim: { code: claim.code, used: !!claim.usedAt } }, { headers: noStore });
}
