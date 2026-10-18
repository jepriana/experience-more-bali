import { NextResponse, connection } from 'next/server';
import { travelersStore, tripsStore } from '@/lib/server/ecosystemStore';

/** GET /api/trips/:id — the public memory page of a trip (anyone with the link / QR). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const trip = (await tripsStore.read()).trips[id];
  if (!trip) return NextResponse.json({ error: 'Trip not found.' }, { status: 404 });
  const owner = (await travelersStore.read()).travelers[trip.ownerId];
  return NextResponse.json({ trip: { ...trip, ownerName: owner?.name ?? trip.name } }, { headers: { 'Cache-Control': 'no-store' } });
}
