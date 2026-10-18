import { promises as fs } from 'node:fs';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { DATA_DIR } from '@/lib/server/jsonStore';
import { newId } from '@/lib/server/identity';
import { authTraveler, tripsStore } from '@/lib/server/ecosystemStore';
import type { MediaItem } from '@/lib/ecosystemTypes';

/**
 * Photos & videos on a trip memory page (owner only).
 * POST   multipart: file (+ width, height for photos) → the new media item
 * DELETE ?mid=…  → removes one item
 *
 * Photos arrive already resized in the browser (which also drops EXIF / GPS data).
 * The real file type is checked from its first bytes, not from the name.
 */

const MAX_PHOTO = 10 * 1024 * 1024;
const MAX_VIDEO = 50 * 1024 * 1024;
const MAX_ITEMS = 60;
const MAX_TRIP_BYTES = 400 * 1024 * 1024;

function sniff(buf: Uint8Array): { kind: 'photo' | 'video'; mime: string; ext: string } | null {
  const at = (i: number) => buf[i];
  const ascii = (from: number, len: number) => String.fromCharCode(...buf.slice(from, from + len));
  if (at(0) === 0xff && at(1) === 0xd8 && at(2) === 0xff) return { kind: 'photo', mime: 'image/jpeg', ext: 'jpg' };
  if (at(0) === 0x89 && ascii(1, 3) === 'PNG') return { kind: 'photo', mime: 'image/png', ext: 'png' };
  if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return { kind: 'photo', mime: 'image/webp', ext: 'webp' };
  if (ascii(4, 4) === 'ftyp') {
    const brand = ascii(8, 4);
    if (brand.startsWith('qt')) return { kind: 'video', mime: 'video/quicktime', ext: 'mov' };
    return { kind: 'video', mime: 'video/mp4', ext: 'mp4' };
  }
  if (at(0) === 0x1a && at(1) === 0x45 && at(2) === 0xdf && at(3) === 0xa3) return { kind: 'video', mime: 'video/webm', ext: 'webm' };
  return null;
}

async function ownedTrip(request: Request, id: string) {
  const me = await authTraveler(request);
  if (!me) return { error: NextResponse.json({ error: 'Sign up as a traveler first.' }, { status: 401 }) };
  const trip = (await tripsStore.read()).trips[id];
  if (!trip) return { error: NextResponse.json({ error: 'Trip not found.' }, { status: 404 }) };
  if (trip.ownerId !== me.id) return { error: NextResponse.json({ error: 'Not your trip.' }, { status: 403 }) };
  return { trip };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedTrip(request, id);
  if ('error' in owned) return owned.error;
  const { trip } = owned;

  if (trip.media.length >= MAX_ITEMS) return NextResponse.json({ error: 'limit' }, { status: 413 });

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'No file.' }, { status: 400 });
  if (file.size > MAX_VIDEO) return NextResponse.json({ error: 'too-big' }, { status: 413 });

  const buf = new Uint8Array(await file.arrayBuffer());
  const type = sniff(buf.slice(0, 16));
  if (!type) return NextResponse.json({ error: 'bad-type' }, { status: 415 });
  if (type.kind === 'photo' && file.size > MAX_PHOTO) return NextResponse.json({ error: 'too-big' }, { status: 413 });
  const used = trip.media.reduce((sum, m) => sum + m.size, 0);
  if (used + file.size > MAX_TRIP_BYTES) return NextResponse.json({ error: 'limit' }, { status: 413 });

  const num = (k: string) => {
    const n = Number(form?.get(k));
    return Number.isFinite(n) && n > 0 && n < 20000 ? Math.round(n) : undefined;
  };
  const mid = newId('m', 8);
  const item: MediaItem = {
    id: mid,
    file: `${mid}.${type.ext}`,
    kind: type.kind,
    mime: type.mime,
    size: file.size,
    width: num('width'),
    height: num('height'),
    at: new Date().toISOString()
  };
  const dir = path.join(DATA_DIR, 'media', trip.id);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, item.file), buf);

  await tripsStore.update((d) => {
    const t = d.trips[trip.id];
    if (t) {
      t.media = [...t.media, item];
      t.updatedAt = item.at;
    }
  });
  return NextResponse.json({ item });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owned = await ownedTrip(request, id);
  if ('error' in owned) return owned.error;
  const mid = new URL(request.url).searchParams.get('mid') ?? '';
  const item = owned.trip.media.find((m) => m.id === mid);
  if (!item) return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  await tripsStore.update((d) => {
    const t = d.trips[id];
    if (t) t.media = t.media.filter((m) => m.id !== mid);
  });
  await fs.rm(path.join(DATA_DIR, 'media', id, item.file), { force: true });
  return NextResponse.json({ ok: true });
}
