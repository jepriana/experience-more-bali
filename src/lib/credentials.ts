import type { CredentialTrack } from '@/lib/ecosystemTypes';
import type { CuratedPartner } from '@/data/curatedPartners';

/** Which credential track a check-in counts towards. */
export function trackFor(partnerType: string | undefined, listing?: Pick<CuratedPartner, 'travelCategories' | 'category'>): CredentialTrack {
  const cats = listing?.travelCategories ?? [];
  if (cats.includes('nature')) return 'nature';
  if (cats.includes('activities')) return 'adventure';
  switch (partnerType) {
    case 'culinary':
      return 'culinary';
    case 'accommodation':
      return 'stay';
    case 'tourism_service':
      return 'adventure';
    default:
      if (listing?.category === 'Culinary') return 'culinary';
      if (listing?.category === 'Accommodation') return 'stay';
      if (listing?.category === 'Activity') return 'adventure';
      return 'culture';
  }
}

export const TRACKS: CredentialTrack[] = ['nature', 'adventure', 'culture', 'culinary', 'stay'];

/** Level 1 at the first check-in, then one level per 3 more. */
export const levelFor = (count: number) => (count <= 0 ? 0 : 1 + Math.floor((count - 1) / 3));
