import { NextResponse } from 'next/server';
import { z } from 'zod';
import { newId } from '@/lib/server/identity';
import { authTraveler, tripsStore } from '@/lib/server/ecosystemStore';

/**
 * Trips saved for memory pages.
 * GET  → my trips (newest first)
 * POST → save / update a trip; returns its short id used in the QR (/m/t_…)
 */

const unauthorized = () => NextResponse.json({ error: 'Sign up as a traveler first.' }, { status: 401 });

export async function GET(request: Request) {
  const me = await authTraveler(request);
  if (!me) return unauthorized();
  const { trips } = await tripsStore.read();
  const mine = Object.values(trips)
    .filter((t) => t.ownerId === me.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return NextResponse.json({ trips: mine }, { headers: { 'Cache-Control': 'no-store' } });
}

const id = z.string().max(80);
const Body = z.object({
  id: z.string().regex(/^t_[\w-]{6,30}$/).optional(),
  name: z.string().trim().min(1).max(60),
  region: z.string().trim().max(80),
  title: z.string().trim().max(80).default(''),
  days: z.array(z.array(id).max(20)).max(10)
});

const MAX_TRIPS_PER_TRAVELER = 50;

export async function POST(request: Request) {
  const me = await authTraveler(request);
  if (!me) return unauthorized();
  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid trip.' }, { status: 400 });
  const body = parsed.data;
  const now = new Date().toISOString();

  const result = await tripsStore.update((d) => {
    const existing = body.id ? d.trips[body.id] : undefined;
    if (existing && existing.ownerId !== me.id) return { error: 'Not your trip.' as const };
    if (!existing && Object.values(d.trips).filter((t) => t.ownerId === me.id).length >= MAX_TRIPS_PER_TRAVELER) {
      return { error: 'Trip limit reached.' as const };
    }
    const tripId = existing?.id ?? newId('t', 8);
    d.trips[tripId] = {
      id: tripId,
      ownerId: me.id,
      name: body.name,
      region: body.region,
      title: body.title,
      days: body.days,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      media: existing?.media ?? []
    };
    return { trip: d.trips[tripId] };
  });
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 403 });
  return NextResponse.json(result);
}
