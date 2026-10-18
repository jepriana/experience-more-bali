import { NextResponse } from 'next/server';
import { z } from 'zod';
import { hashSecret, newId, secretMatches } from '@/lib/server/identity';
import { authTraveler, checkinsStore, membersStore } from '@/lib/server/ecosystemStore';
import { listAll } from '@/lib/server/partnerStore';
import { trackFor } from '@/lib/credentials';

/**
 * Credentials: a traveler checks in by scanning the QR card on a partner's counter.
 * The card's QR carries "<memberId>.<checkinToken>" — proof it was scanned from the printed card.
 * GET  → my check-ins
 * POST → { code } check in (once per place per day)
 */

const unauthorized = () => NextResponse.json({ error: 'need-account' }, { status: 401 });

export async function GET(request: Request) {
  const me = await authTraveler(request);
  if (!me) return unauthorized();
  const { checkins } = await checkinsStore.read();
  const mine = checkins.filter((c) => c.travelerId === me.id).sort((a, b) => b.at.localeCompare(a.at));
  return NextResponse.json({ checkins: mine }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: Request) {
  const me = await authTraveler(request);
  if (!me) return unauthorized();
  const parsed = z.object({ code: z.string().max(120) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const [memberId, token] = parsed.data.code.split('.');
  const member = memberId ? (await membersStore.read()).members[memberId] : undefined;
  // compare as a hash so the token check is constant-time
  if (!member || !member.checkinToken || !token || !secretMatches(token, hashOf(member.checkinToken))) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const listing = member.listingId ? (await listAll()).find((p) => p.partner.id === member.listingId)?.partner : undefined;
  const now = new Date();
  const day = now.toISOString().slice(0, 10);

  const result = await checkinsStore.update((d) => {
    const already = d.checkins.some((c) => c.travelerId === me.id && c.memberId === member.id && c.at.slice(0, 10) === day);
    if (already) return { already: true as const };
    const record = {
      id: newId('ci', 8),
      travelerId: me.id,
      memberId: member.id,
      listingId: member.listingId,
      placeName: member.name,
      partnerType: member.partnerType,
      track: trackFor(member.partnerType, listing),
      regionId: member.regionId,
      at: now.toISOString()
    };
    d.checkins.push(record);
    return { checkin: record };
  });
  return NextResponse.json(result);
}

const hashOf = (s: string) => hashSecret(s);
