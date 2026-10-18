/** Shapes shared by the ecosystem API routes and the pages that use them. */

export type CredentialTrack = 'nature' | 'adventure' | 'culinary' | 'culture' | 'stay';

export interface MediaItem {
  id: string;
  file: string;
  kind: 'photo' | 'video';
  mime: string;
  size: number;
  width?: number;
  height?: number;
  at: string;
}

/** A trip saved for the memory page (/m/t_…). Days hold partner ids in visiting order. */
export interface TripRecord {
  id: string;
  ownerId: string;
  /** sticker name (family / group) */
  name: string;
  /** home region line */
  region: string;
  title: string;
  days: string[][];
  createdAt: string;
  updatedAt: string;
  media: MediaItem[];
}

export interface PublicTrip extends TripRecord {
  ownerName: string;
}

export interface CheckinRecord {
  id: string;
  travelerId: string;
  memberId: string;
  listingId?: string;
  placeName: string;
  partnerType?: string;
  track: CredentialTrack;
  regionId?: string;
  /** set when it came from a destination QR tag (an achievement) rather than a counter card */
  tagId?: string;
  at: string;
}

/** A QR tag a partner places at a destination, summit, trailhead or dive spot. */
export interface DestinationTag {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  track: CredentialTrack;
  regionId?: string;
  area?: string;
  /** scanning collects an achievement (credential) */
  achievement: boolean;
  /** scanning lets the traveler claim a one-time discount code */
  discount?: { percent: number; terms?: string };
  /** only works within `radius` metres of this spot */
  spot?: { lat: number; lng: number; radius: number };
  /** printed into the QR; renewing it makes old prints stop working */
  token: string;
  active: boolean;
  scans: number;
  createdAt: string;
}

/** what a traveler's phone sees after scanning (no token, no owner id) */
export interface PublicTag {
  id: string;
  name: string;
  ownerName: string;
  track: CredentialTrack;
  regionId?: string;
  area?: string;
  achievement: boolean;
  discount?: { percent: number; terms?: string };
  atSpot: boolean;
  active: boolean;
  /** for a signed-in traveler */
  collected?: boolean;
  claim?: { code: string; used: boolean };
}

export interface TagClaim {
  id: string;
  tagId: string;
  travelerId: string;
  code: string;
  at: string;
  usedAt?: string;
}

/** a partner's tag with its numbers (owner only) */
export interface OwnedTag extends DestinationTag {
  stats: { scans: number; collected: number; claimed: number; used: number };
  origins: { region: string; count: number }[];
}

export interface ClusterMember {
  /** signed-up partner (network member) */
  memberId?: string;
  /** traveler-facing listing travelers can add to their trip */
  listingId?: string;
  name: string;
  partnerType?: string;
}

export interface Cluster {
  id: string;
  name: string;
  regionId: string;
  area?: string;
  coordinatorId?: string;
  coordinatorName: string;
  members: ClusterMember[];
  package?: { title: string; details: string; discount: number };
  sample?: boolean;
  createdAt: string;
}

export type RequestKind = 'guide' | 'creator' | 'digital' | 'transport' | 'printing' | 'bundle' | 'other';

export interface CollabResponse {
  memberId: string;
  name: string;
  partnerType?: string;
  message: string;
  /** only returned to the requester */
  contact?: string;
  at: string;
}

export interface CollabRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromType?: string;
  regionId?: string;
  kind: RequestKind;
  title: string;
  details: string;
  dates?: string;
  language?: string;
  groupSize?: string;
  status: 'open' | 'closed';
  responses: CollabResponse[];
  sample?: boolean;
  createdAt: string;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  partnerType?: string;
  regionId?: string;
  area?: string;
  listingId?: string;
  /** only for signed-in partners */
  contact?: string;
  sample?: boolean;
}

export interface ConnectPost {
  id: string;
  groupId: string;
  authorId: string;
  authorName: string;
  homeRegion: string;
  text: string;
  tripId?: string;
  tripTitle?: string;
  at: string;
  reportCount: number;
  reportedByMe?: boolean;
}

/** Which partner types usually answer which request kind ("For me" filter). */
export const REQUEST_TARGETS: Record<RequestKind, string[]> = {
  guide: ['tourism_service', 'community'],
  creator: ['creator'],
  digital: ['digital_pro'],
  transport: ['tourism_service', 'distribution'],
  printing: ['printing', 'sme_service'],
  bundle: ['destination', 'accommodation', 'culinary', 'local_product', 'tourism_service', 'producer', 'community'],
  other: []
};
