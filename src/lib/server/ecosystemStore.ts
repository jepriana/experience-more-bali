import { createStore } from '@/lib/server/jsonStore';
import { credentialsFrom, secretMatches } from '@/lib/server/identity';
import type { CheckinRecord, Cluster, CollabRequest, ConnectPost, DestinationTag, TagClaim, TripRecord } from '@/lib/ecosystemTypes';

/** Server records for travelers, partner network members, trips, check-ins, network and connect. */

export interface TravelerIdentity {
  id: string;
  keyHash: string;
  name: string;
  homeRegion: string;
  createdAt: string;
}

export interface MemberIdentity {
  id: string;
  keyHash: string;
  name: string;
  picName: string;
  contact: string;
  partnerType?: string;
  regionId?: string;
  area?: string;
  /** the traveler-facing listing published from the AI marketing studio */
  listingId?: string;
  /** printed into the counter-card QR; proves a traveler scanned it at the counter */
  checkinToken: string;
  sample?: boolean;
  createdAt: string;
}

export const travelersStore = createStore<{ travelers: Record<string, TravelerIdentity> }>('travelers.json', () => ({ travelers: {} }));
export const membersStore = createStore<{ members: Record<string, MemberIdentity> }>('members.json', () => ({ members: seedMembers() }));
export const tripsStore = createStore<{ trips: Record<string, TripRecord> }>('trips.json', () => ({ trips: {} }));
export const checkinsStore = createStore<{ checkins: CheckinRecord[] }>('checkins.json', () => ({ checkins: [] }));
export const networkStore = createStore<{ clusters: Cluster[]; requests: CollabRequest[] }>('network.json', () => ({
  clusters: seedClusters(),
  requests: seedRequests()
}));

export const tagsStore = createStore<{ tags: Record<string, DestinationTag>; claims: TagClaim[] }>('tags.json', () => ({ tags: {}, claims: [] }));

export interface StoredPost extends Omit<ConnectPost, 'reportCount' | 'reportedByMe'> {
  reports: string[];
  hidden: boolean;
}
export const connectStore = createStore<{ memberships: Record<string, string[]>; posts: StoredPost[] }>('connect.json', () => ({
  memberships: {},
  posts: []
}));

// ───────── auth ─────────

export async function authTraveler(request: Request): Promise<TravelerIdentity | null> {
  const c = credentialsFrom(request);
  if (!c || !c.id.startsWith('tr_')) return null;
  const t = (await travelersStore.read()).travelers[c.id];
  return t && secretMatches(c.key, t.keyHash) ? t : null;
}

export async function authMember(request: Request): Promise<MemberIdentity | null> {
  const c = credentialsFrom(request);
  if (!c || !c.id.startsWith('pm_')) return null;
  const m = (await membersStore.read()).members[c.id];
  return m && secretMatches(c.key, m.keyHash) ? m : null;
}

// ───────── demo seeds (marked "Sample" in the UI) ─────────

const SEED_AT = '2026-10-01T00:00:00.000Z';

function seedMembers(): Record<string, MemberIdentity> {
  const base = { keyHash: '', checkinToken: '', sample: true, createdAt: SEED_AT, contact: '+6200000000099' };
  const list: MemberIdentity[] = [
    { ...base, id: 'pm_sample_agency', name: 'Bali Family Travel (agency)', picName: 'Sample', partnerType: 'distribution', regionId: 'badung', area: 'Kuta' },
    { ...base, id: 'pm_sample_creator', name: 'Lensa Ubud Studio', picName: 'Sample', partnerType: 'creator', regionId: 'gianyar', area: 'Ubud' },
    { ...base, id: 'pm_sample_printing', name: 'Cetak Kilat Denpasar', picName: 'Sample', partnerType: 'printing', regionId: 'denpasar' },
    { ...base, id: 'pm_sample_pokdarwis', name: 'Pokdarwis Ubud', picName: 'Sample', partnerType: 'community', regionId: 'gianyar', area: 'Ubud' },
    { ...base, id: 'pm_sample_digital', name: 'Bali Digital Desa', picName: 'Sample', partnerType: 'digital_pro', regionId: 'badung' }
  ];
  return Object.fromEntries(list.map((m) => [m.id, m]));
}

function seedClusters(): Cluster[] {
  return [
    {
      id: 'cl_sample_ubud',
      name: 'Ubud cluster',
      regionId: 'gianyar',
      area: 'Ubud',
      coordinatorId: 'pm_sample_pokdarwis',
      coordinatorName: 'Pokdarwis Ubud',
      members: [
        { memberId: 'pm_sample_pokdarwis', name: 'Pokdarwis Ubud', partnerType: 'community' },
        { listingId: 'dest-taro-firefly-bamboo', name: 'Taro Ancient Firefly Sanctuary & Bamboo Forest', partnerType: 'destination' },
        { listingId: 'culinary-nyuh-kuning-jamu-atelier', name: 'Dapur Parahyangan & Traditional Jamu Atelier', partnerType: 'culinary' },
        { listingId: 'act-ayung-river-tubing', name: 'Ayung River Family Tubing', partnerType: 'tourism_service' }
      ],
      package: { title: 'Ubud river, jamu & fireflies day', details: 'River tubing in the morning, jamu-making lunch, firefly walk at dusk.', discount: 10 },
      sample: true,
      createdAt: SEED_AT
    },
    {
      id: 'cl_sample_east',
      name: 'Sidemen–Amed cluster',
      regionId: 'karangasem',
      area: 'Sidemen',
      coordinatorName: 'Sidemen Valley Bamboo Sanctuary',
      members: [
        { listingId: 'accom-sidemen-bamboo-sanctuary', name: 'Sidemen Valley Bamboo Sanctuary & Organic Farm', partnerType: 'accommodation' },
        { listingId: 'culinary-dukuh-campuhan-kitchen', name: 'Dukuh Campuhan Heritage Rice & Fire Kitchen', partnerType: 'culinary' },
        { listingId: 'culinary-amed-fishermens-cooperative', name: 'Warung Segara Amed Fishermen’s Cooperative Table', partnerType: 'culinary' }
      ],
      package: { title: 'Two slow days in East Bali', details: 'Bamboo stay in Sidemen, rice-field kitchen, fishermen’s lunch in Amed.', discount: 8 },
      sample: true,
      createdAt: SEED_AT
    }
  ];
}

function seedRequests(): CollabRequest[] {
  return [
    {
      id: 'rq_sample_guide',
      fromId: 'pm_sample_agency',
      fromName: 'Bali Family Travel (agency)',
      fromType: 'distribution',
      regionId: 'gianyar',
      kind: 'guide',
      title: 'Local guide for a family group in Ubud',
      details: 'Group of 12 (4 children) from Jakarta. Half-day village and rice-field walk, easy pace.',
      dates: '12–13 Dec 2026',
      language: 'Bahasa Indonesia, English',
      groupSize: '12',
      status: 'open',
      responses: [],
      sample: true,
      createdAt: SEED_AT
    },
    {
      id: 'rq_sample_creator',
      fromId: 'pm_sample_pokdarwis',
      fromName: 'Pokdarwis Ubud',
      fromType: 'community',
      regionId: 'gianyar',
      kind: 'creator',
      title: 'Short videos of our village programmes',
      details: 'Looking for a creator to film 3 short videos (cooking, weaving, firefly walk). Stay and meals provided.',
      status: 'open',
      responses: [],
      sample: true,
      createdAt: SEED_AT
    }
  ];
}
