import { createReadStream, promises as fs } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { DATA_DIR } from '@/lib/server/jsonStore';

/**
 * Serves trip photos & videos. Supports HTTP Range so videos can seek and stream on phones.
 * Names are strictly validated; only files under DATA_DIR/media/<trip> can be read.
 */

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm'
};

export async function GET(request: Request, { params }: { params: Promise<{ tripId: string; file: string }> }) {
  const { tripId, file } = await params;
  if (!/^t_[\w-]{6,30}$/.test(tripId) || !/^m_[\w-]{6,30}\.(jpg|png|webp|mp4|mov|webm)$/.test(file)) {
    return new Response('Not found', { status: 404 });
  }
  const full = path.join(DATA_DIR, 'media', tripId, file);
  let size: number;
  try {
    size = (await fs.stat(full)).size;
  } catch {
    return new Response('Not found', { status: 404 });
  }
  const type = MIME[file.split('.').pop()!];
  const base = {
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff'
  };

  const range = request.headers.get('range');
  const m = range?.match(/^bytes=(\d*)-(\d*)$/);
  if (m && (m[1] || m[2])) {
    let start = m[1] ? Number(m[1]) : size - Number(m[2]);
    let end = m[1] && m[2] ? Number(m[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(size - 1, end);
    if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    const stream = Readable.toWeb(createReadStream(full, { start, end })) as ReadableStream;
    return new Response(stream, {
      status: 206,
      headers: { ...base, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1) }
    });
  }
  const stream = Readable.toWeb(createReadStream(full)) as ReadableStream;
  return new Response(stream, { headers: { ...base, 'Content-Length': String(size) } });
}
