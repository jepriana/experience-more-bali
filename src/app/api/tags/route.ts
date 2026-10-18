import { NextResponse, connection } from 'next/server';
import { z } from 'zod';
import { newId, newSecret } from '@/lib/server/identity';
import { authMember, checkinsStore, tagsStore, travelersStore } from '@/lib/server/ecosystemStore';
import { normalizeCode } from '@/lib/server/tags';
import { TRACKS } from '@/lib/credentials';
import type { DestinationTag, OwnedTag } from '@/lib/ecosystemTypes';

/**
 * Destination QR tags, for the partner who owns them.
 * GET  → my tags with their numbers (scans, achievements, claims, where visitors come from)
 * POST { action: create | setActive | renew | redeem }
 */

const MAX_TAGS = 30;
const noStore = { 'Cache-Control': 'no-store' };

export async function GET(request: Request) {
  await connection();
  const me = await authMember(request);
  if (!me) return NextResponse.json({ error: 'need-account' }, { status: 401 });
  const [{ tags, claims }, { checkins }, { travelers }] = await Promise.all([tagsStore.read(), checkinsStore.read(), travelersStore.read()]);

  const mine: OwnedTag[] = Object.values(tags)
    .filter((t) => t.ownerId === me.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((tag) => {
      const collectedBy = checkins.filter((c) => c.tagId === tag.id).map((c) => c.travelerId);
      const tagClaims = claims.filter((c) => c.tagId === tag.id);
      // where visitors come from: home regions only, counted — no names or contacts
      const visitors = new Set([...collectedBy, ...tagClaims.map((c) => c.travelerId)]);
      const counts = new Map<string, number>();
      for (const id of visitors) {
        const region = travelers[id]?.homeRegion || '—';
        counts.set(region, (counts.get(region) ?? 0) + 1);
      }
      return {
        ...tag,
        stats: { scans: tag.scans, collected: collectedBy.length, claimed: tagClaims.length, used: tagClaims.filter((c) => c.usedAt).length },
        origins: [...counts].map(([region, count]) => ({ region, count })).sort((a, b) => b.count - a.count).slice(0, 6)
      };
    });
  return NextResponse.json({ tags: mine }, { headers: noStore });
}

const Action = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('create'),
    name: z.string().trim().min(2).max(80),
    track: z.enum(TRACKS as [string, ...string[]]),
    achievement: z.boolean(),
    discount: z.number().int().min(0).max(50),
    terms: z.string().trim().max(160).optional(),
    spot: z.object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) }).optional()
  }),
  z.object({ action: z.literal('setActive'), tagId: z.string().max(40), active: z.boolean() }),
  z.object({ action: z.literal('renew'), tagId: z.string().max(40) }),
  z.object({ action: z.literal('redeem'), code: z.string().max(20) })
]);

const SPOT_RADIUS_M = 300;

export async function POST(request: Request) {
  const me = await authMember(request);
  if (!me) return NextResponse.json({ error: 'need-account' }, { status: 401 });
  const parsed = Action.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const a = parsed.data;

  const result = await tagsStore.update((d) => {
    const own = (id: string) => {
      const t = d.tags[id];
      return t && t.ownerId === me.id ? t : null;
    };
    switch (a.action) {
      case 'create': {
        if (!a.achievement && a.discount === 0) return { error: 'empty', status: 400 };
        if (Object.values(d.tags).filter((t) => t.ownerId === me.id).length >= MAX_TAGS) return { error: 'limit', status: 400 };
        const tag: DestinationTag = {
          id: newId('tg', 6),
          ownerId: me.id,
          ownerName: me.name,
          name: a.name,
          track: a.track as DestinationTag['track'],
          regionId: me.regionId,
          area: me.area,
          achievement: a.achievement,
          discount: a.discount ? { percent: a.discount, terms: a.terms || undefined } : undefined,
          spot: a.spot ? { ...a.spot, radius: SPOT_RADIUS_M } : undefined,
          token: newSecret().slice(0, 12),
          active: true,
          scans: 0,
          createdAt: new Date().toISOString()
        };
        d.tags[tag.id] = tag;
        return { tag };
      }
      case 'setActive': {
        const t = own(a.tagId);
        if (!t) return { error: 'not-found', status: 404 };
        t.active = a.active;
        return { ok: true };
      }
      case 'renew': {
        const t = own(a.tagId);
        if (!t) return { error: 'not-found', status: 404 };
        t.token = newSecret().slice(0, 12);
        return { ok: true };
      }
      case 'redeem': {
        const code = normalizeCode(a.code);
        const claim = code ? d.claims.find((c) => c.code === code && own(c.tagId)) : undefined;
        if (!claim) return { error: 'not-found', status: 404 };
        if (claim.usedAt) return { error: 'used', status: 409, tagName: d.tags[claim.tagId]?.name };
        claim.usedAt = new Date().toISOString();
        return { ok: true, tagName: d.tags[claim.tagId]?.name };
      }
    }
  });
  if ('error' in result) {
    const { status, ...body } = result as { error: string; status: number };
    return NextResponse.json(body, { status, headers: noStore });
  }
  return NextResponse.json(result, { headers: noStore });
}
