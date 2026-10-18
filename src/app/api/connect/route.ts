import { NextResponse, connection } from 'next/server';
import { z } from 'zod';
import { newId } from '@/lib/server/identity';
import { authTraveler, connectStore, tripsStore, type StoredPost } from '@/lib/server/ecosystemStore';
import { CONNECT_GROUP_IDS, isConnectGroup } from '@/lib/connectGroups';
import type { ConnectPost } from '@/lib/ecosystemTypes';

/**
 * Traveler Connect — privacy-first groups (interests + Bali areas).
 * Only the sticker name and home region are shown; no direct messages, no contact details.
 * GET  ?group=<id> → groups with counts (+ my memberships) and, with a group, its posts
 * POST { action: join | leave | post | report | delete }
 */

const MAX_POSTS_PER_DAY = 20;
const HIDE_AT_REPORTS = 3;
const noStore = { 'Cache-Control': 'no-store' };

const toPublic = (p: StoredPost, me?: string): ConnectPost => ({
  id: p.id,
  groupId: p.groupId,
  authorId: p.authorId,
  authorName: p.authorName,
  homeRegion: p.homeRegion,
  text: p.text,
  tripId: p.tripId,
  tripTitle: p.tripTitle,
  at: p.at,
  reportCount: p.reports.length,
  reportedByMe: !!me && p.reports.includes(me)
});

export async function GET(request: Request) {
  await connection();
  const me = await authTraveler(request);
  const group = new URL(request.url).searchParams.get('group');
  const { memberships, posts } = await connectStore.read();

  const memberCount: Record<string, number> = {};
  for (const ids of Object.values(memberships)) for (const g of ids) memberCount[g] = (memberCount[g] ?? 0) + 1;
  const visible = posts.filter((p) => !p.hidden);
  const groups = CONNECT_GROUP_IDS.map((id) => ({
    id,
    members: memberCount[id] ?? 0,
    posts: visible.filter((p) => p.groupId === id).length
  }));

  const body: Record<string, unknown> = { me: me ? { id: me.id } : null, groups, joined: me ? memberships[me.id] ?? [] : [] };
  if (group && isConnectGroup(group)) {
    body.posts = visible
      .filter((p) => p.groupId === group)
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 100)
      .map((p) => toPublic(p, me?.id));
  }
  return NextResponse.json(body, { headers: noStore });
}

const group = z.string().refine(isConnectGroup);
const Action = z.discriminatedUnion('action', [
  z.object({ action: z.literal('join'), groupId: group }),
  z.object({ action: z.literal('leave'), groupId: group }),
  z.object({ action: z.literal('post'), groupId: group, text: z.string().trim().min(1).max(1000), tripId: z.string().max(40).optional() }),
  z.object({ action: z.literal('report'), postId: z.string().max(40) }),
  z.object({ action: z.literal('delete'), postId: z.string().max(40) })
]);

class Fail extends Error {
  constructor(
    public code: string,
    public status = 400
  ) {
    super(code);
  }
}

export async function POST(request: Request) {
  const me = await authTraveler(request);
  if (!me) return NextResponse.json({ error: 'need-account' }, { status: 401 });
  const parsed = Action.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const a = parsed.data;

  // a linked trip must be one of mine
  let tripTitle: string | undefined;
  if (a.action === 'post' && a.tripId) {
    const trip = (await tripsStore.read()).trips[a.tripId];
    if (!trip || trip.ownerId !== me.id) return NextResponse.json({ error: 'invalid' }, { status: 400 });
    tripTitle = trip.title || trip.name;
  }

  try {
    const result = await connectStore.update((data) => {
      const mine = new Set(data.memberships[me.id] ?? []);
      const post = (id: string) => {
        const p = data.posts.find((x) => x.id === id);
        if (!p) throw new Fail('not-found', 404);
        return p;
      };
      switch (a.action) {
        case 'join':
          mine.add(a.groupId);
          data.memberships[me.id] = [...mine];
          return { joined: data.memberships[me.id] };
        case 'leave':
          mine.delete(a.groupId);
          data.memberships[me.id] = [...mine];
          return { joined: data.memberships[me.id] };
        case 'post': {
          if (!mine.has(a.groupId)) throw new Fail('not-member', 403);
          const since = Date.now() - 24 * 3600 * 1000;
          const today = data.posts.filter((p) => p.authorId === me.id && Date.parse(p.at) > since).length;
          if (today >= MAX_POSTS_PER_DAY) throw new Fail('too-many', 429);
          const p: StoredPost = {
            id: newId('cp'),
            groupId: a.groupId,
            authorId: me.id,
            authorName: me.name,
            homeRegion: me.homeRegion,
            text: a.text,
            tripId: a.tripId,
            tripTitle,
            at: new Date().toISOString(),
            reports: [],
            hidden: false
          };
          data.posts.push(p);
          return { post: toPublic(p, me.id) };
        }
        case 'report': {
          const p = post(a.postId);
          if (p.authorId === me.id) throw new Fail('own-post');
          if (!p.reports.includes(me.id)) p.reports.push(me.id);
          if (p.reports.length >= HIDE_AT_REPORTS) p.hidden = true;
          return { ok: true };
        }
        case 'delete': {
          const p = post(a.postId);
          if (p.authorId !== me.id) throw new Fail('forbidden', 403);
          data.posts = data.posts.filter((x) => x.id !== p.id);
          return { ok: true };
        }
      }
    });
    return NextResponse.json(result, { headers: noStore });
  } catch (err) {
    if (err instanceof Fail) return NextResponse.json({ error: err.code }, { status: err.status });
    console.error('[connect]', err);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
