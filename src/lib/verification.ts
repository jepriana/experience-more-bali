import type { CuratedPartner } from '@/data/curatedPartners';

/**
 * Partner verification — shared by the server store, the admin page and the badges.
 *
 *   published      → visible to travelers, "Not yet verified"
 *   in_review      → the KOSSI team added it to a review batch (still visible)
 *   verified       → ✓ KOSSI Verified
 *   needs_changes  → still visible; the partner sees what to fix
 *   removed        → hidden from travelers (fake / spam / closed)
 */

export type VerificationStatus = 'published' | 'in_review' | 'verified' | 'needs_changes' | 'removed';
export const VERIFICATION_STATUSES: VerificationStatus[] = ['published', 'in_review', 'verified', 'needs_changes', 'removed'];

/** What the KOSSI team checks before verifying. */
export type CheckId = 'whatsapp' | 'location' | 'photos' | 'facts' | 'discount';
export const CHECK_IDS: CheckId[] = ['whatsapp', 'location', 'photos', 'facts', 'discount'];

export type AdminAction = 'review' | 'verify' | 'needs_changes' | 'remove' | 'restore' | 'checklist';

export interface HistoryEntry {
  at: string;
  by: string;
  action: AdminAction | 'published';
  note?: string;
  batchId?: string;
}

/** Full record — admin only. */
export interface VerificationRecord {
  status: VerificationStatus;
  updatedAt: string;
  publishedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  batchId?: string;
  /** message to the partner (needs changes) or internal note */
  note?: string;
  checklist: Partial<Record<CheckId, boolean>>;
  history: HistoryEntry[];
}

/** What travelers and partners may see. */
export interface PublicStatus {
  status: VerificationStatus;
  verifiedAt?: string;
  /** only for "needs_changes": what the partner should fix */
  note?: string;
}

/**
 * Starting status when nothing is stored yet: the original curated partners were selected by
 * the KOSSI team (verified); demo samples and new sign-ups start as published.
 */
export function defaultRecord(partner: Pick<CuratedPartner, 'isSample' | 'isNewlyPublished'>, isBuiltIn: boolean): VerificationRecord {
  const curated = isBuiltIn && !partner.isSample;
  return {
    status: curated ? 'verified' : 'published',
    updatedAt: '2026-10-01T00:00:00.000Z',
    publishedAt: '2026-10-01T00:00:00.000Z',
    verifiedAt: curated ? '2026-10-01T00:00:00.000Z' : undefined,
    verifiedBy: curated ? 'KOSSI curation team' : undefined,
    checklist: curated ? { whatsapp: true, location: true, photos: true, facts: true, discount: true } : {},
    history: []
  };
}

export function toPublic(r: VerificationRecord): PublicStatus {
  return {
    status: r.status,
    verifiedAt: r.status === 'verified' ? r.verifiedAt : undefined,
    note: r.status === 'needs_changes' ? r.note : undefined
  };
}
