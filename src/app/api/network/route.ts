import { NextResponse, connection } from 'next/server';
import { z } from 'zod';
import { newId } from '@/lib/server/identity';
import { authMember, membersStore, networkStore, type MemberIdentity } from '@/lib/server/ecosystemStore';
import type { Cluster, CollabRequest, DirectoryEntry, RequestKind } from '@/lib/ecosystemTypes';

/**
 * Partner network: area clusters, collaboration requests and the partner directory.
 * GET  → public view (clusters, open requests without contacts, directory without contacts);
 *        signed-in partners also get contacts in the directory, offers on their own requests
 *        and whether they already offered help.
 * POST → { action, ... } for signed-in partners only.
 */

const MAX_OPEN_REQUESTS = 10;
const MAX_CLUSTERS_PER_MEMBER = 5;
const noStore = { 'Cache-Control': 'no-store' };

function publicRequest(r: CollabRequest, me: MemberIdentity | null) {
  const mine = me?.id === r.fromId;
  return {
    ...r,
    // offers (with contacts) only go to the requester; others just see a count
    responses: mine ? r.responses : [],
    responseCount: r.responses.length,
    respondedByMe: !!me && r.responses.some((x) => x.memberId === me.id),
    mine
  };
}

export async function GET(request: Request) {
  await connection();
  const me = await authMember(request);
  const [{ clusters, requests }, { members }] = await Promise.all([networkStore.read(), membersStore.read()]);

  const directory: DirectoryEntry[] = Object.values(members)
    .map((m) => ({
      id: m.id,
      name: m.name,
      partnerType: m.partnerType,
      regionId: m.regionId,
      area: m.area,
      listingId: m.listingId,
      contact: me ? m.contact : undefined,
      sample: m.sample
    }))
    .sort((a, b) => Number(!!a.sample) - Number(!!b.sample) || a.name.localeCompare(b.name));

  const visibleRequests = requests
    .filter((r) => r.status === 'open' || r.fromId === me?.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((r) => publicRequest(r, me));

  return NextResponse.json(
    {
      me: me ? { id: me.id, partnerType: me.partnerType, regionId: me.regionId, listingId: me.listingId } : null,
      clusters,
      requests: visibleRequests,
      directory
    },
    { headers: noStore }
  );
}

const text = (max: number) => z.string().trim().min(1).max(max);
const optional = (max: number) => z.string().trim().max(max).optional();
const KINDS = ['guide', 'creator', 'digital', 'transport', 'printing', 'bundle', 'other'] as const satisfies readonly RequestKind[];

const Action = z.discriminatedUnion('action', [
  z.object({ action: z.literal('createCluster'), name: text(80) }),
  z.object({ action: z.literal('joinCluster'), clusterId: text(40) }),
  z.object({ action: z.literal('leaveCluster'), clusterId: text(40) }),
  z.object({
    action: z.literal('savePackage'),
    clusterId: text(40),
    title: text(100),
    details: text(500),
    discount: z.number().int().min(0).max(50)
  }),
  z.object({
    action: z.literal('createRequest'),
    kind: z.enum(KINDS),
    title: text(100),
    details: text(1000),
    dates: optional(60),
    language: optional(60),
    groupSize: optional(20)
  }),
  z.object({ action: z.literal('respond'), requestId: text(40), message: text(500) }),
  z.object({ action: z.literal('closeRequest'), requestId: text(40) })
]);

class Fail extends Error {
  constructor(
    public code: string,
    public status = 400
  ) {
    super(code);
  }
}

const memberEntry = (me: MemberIdentity) => ({ memberId: me.id, listingId: me.listingId, name: me.name, partnerType: me.partnerType });

/** true if this cluster entry is me (signed-up member, or my published listing seeded earlier) */
const isMe = (me: MemberIdentity) => (x: Cluster['members'][number]) => x.memberId === me.id || (!!me.listingId && x.listingId === me.listingId);

export async function POST(request: Request) {
  const me = await authMember(request);
  if (!me) return NextResponse.json({ error: 'need-account' }, { status: 401 });
  const parsed = Action.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'invalid' }, { status: 400 });
  const a = parsed.data;
  const now = new Date().toISOString();

  try {
    const result = await networkStore.update((data) => {
      const cluster = (id: string) => {
        const c = data.clusters.find((x) => x.id === id);
        if (!c) throw new Fail('not-found', 404);
        return c;
      };
      const req = (id: string) => {
        const r = data.requests.find((x) => x.id === id);
        if (!r) throw new Fail('not-found', 404);
        return r;
      };
      const myClusterCount = () => data.clusters.filter((c) => c.members.some(isMe(me))).length;

      switch (a.action) {
        case 'createCluster': {
          if (!me.regionId) throw new Fail('need-region');
          if (myClusterCount() >= MAX_CLUSTERS_PER_MEMBER) throw new Fail('limit');
          const c: Cluster = {
            id: newId('cl'),
            name: a.name,
            regionId: me.regionId,
            area: me.area,
            coordinatorId: me.id,
            coordinatorName: me.name,
            members: [memberEntry(me)],
            createdAt: now
          };
          data.clusters.push(c);
          return { cluster: c };
        }
        case 'joinCluster': {
          const c = cluster(a.clusterId);
          const existing = c.members.find(isMe(me));
          if (existing) Object.assign(existing, memberEntry(me));
          else {
            if (myClusterCount() >= MAX_CLUSTERS_PER_MEMBER) throw new Fail('limit');
            c.members.push(memberEntry(me));
          }
          return { cluster: c };
        }
        case 'leaveCluster': {
          const c = cluster(a.clusterId);
          c.members = c.members.filter((x) => !isMe(me)(x));
          if (c.coordinatorId === me.id) {
            const next = c.members.find((x) => x.memberId);
            c.coordinatorId = next?.memberId;
            c.coordinatorName = next?.name ?? c.members[0]?.name ?? '';
          }
          if (c.members.length === 0) data.clusters = data.clusters.filter((x) => x.id !== c.id);
          return { ok: true };
        }
        case 'savePackage': {
          const c = cluster(a.clusterId);
          if (c.coordinatorId !== me.id) throw new Fail('not-coordinator', 403);
          c.package = { title: a.title, details: a.details, discount: a.discount };
          return { cluster: c };
        }
        case 'createRequest': {
          const open = data.requests.filter((r) => r.fromId === me.id && r.status === 'open').length;
          if (open >= MAX_OPEN_REQUESTS) throw new Fail('limit');
          const r: CollabRequest = {
            id: newId('rq'),
            fromId: me.id,
            fromName: me.name,
            fromType: me.partnerType,
            regionId: me.regionId,
            kind: a.kind,
            title: a.title,
            details: a.details,
            dates: a.dates || undefined,
            language: a.language || undefined,
            groupSize: a.groupSize || undefined,
            status: 'open',
            responses: [],
            createdAt: now
          };
          data.requests.push(r);
          return { request: publicRequest(r, me) };
        }
        case 'respond': {
          const r = req(a.requestId);
          if (r.fromId === me.id) throw new Fail('own-request');
          if (r.status !== 'open') throw new Fail('closed');
          const offer = { memberId: me.id, name: me.name, partnerType: me.partnerType, message: a.message, contact: me.contact, at: now };
          const i = r.responses.findIndex((x) => x.memberId === me.id);
          if (i >= 0) r.responses[i] = offer;
          else r.responses.push(offer);
          return { request: publicRequest(r, me) };
        }
        case 'closeRequest': {
          const r = req(a.requestId);
          if (r.fromId !== me.id) throw new Fail('forbidden', 403);
          r.status = 'closed';
          return { request: publicRequest(r, me) };
        }
      }
    });
    return NextResponse.json(result, { headers: noStore });
  } catch (err) {
    if (err instanceof Fail) return NextResponse.json({ error: err.code }, { status: err.status });
    console.error('[network]', err);
    return NextResponse.json({ error: 'server' }, { status: 500 });
  }
}
