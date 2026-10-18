import { BALI_REGIONS } from '@/data/regions';

/** Traveler Connect groups: shared interests, and one group per Bali regency/city. */
export const INTEREST_GROUPS = ['diving', 'trekking', 'surfing', 'culinary', 'culture', 'family', 'eco', 'photo'] as const;
export type InterestGroup = (typeof INTEREST_GROUPS)[number];

export const REGION_GROUP_PREFIX = 'region-';
export const CONNECT_GROUP_IDS: string[] = [...INTEREST_GROUPS, ...BALI_REGIONS.map((r) => REGION_GROUP_PREFIX + r.id)];

export const isConnectGroup = (id: string) => CONNECT_GROUP_IDS.includes(id);
