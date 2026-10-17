import { promises as fs } from 'node:fs';
import path from 'node:path';
import { CURATED_BALI_PARTNERS, type CuratedPartner } from '@/data/curatedPartners';
import {
  defaultRecord,
  type AdminAction,
  type CheckId,
  type VerificationRecord
} from '@/lib/verification';

/**
 * Server-side partner store: one JSON file (default `.data/partners.json` in the project).
 * Holds partners published through the app and the verification record of every partner,
 * so the KOSSI admin sees the same data from any device.
 *
 * Swapping to a real database later (e.g. Firestore) means re-implementing only
 * `load` and `save` below — the API routes and pages don't change.
 *
 * Note: a file needs a server with a persistent disk (your PC, a VM, Docker with a volume).
 * Serverless hosts like Vercel reset files between requests.
 */

interface StoreFile {
  version: 1;
  /** partners published through the app (newest first) */
  customs: CuratedPartner[];
  /** verification records for built-in AND custom partners, by partner id */
  records: Record<string, VerificationRecord>;
}

// (the turbopackIgnore hint stops the build from tracing the whole project for this runtime path)
const STORE_PATH = process.env.PARTNER_STORE_PATH || path.join(/* turbopackIgnore: true */ process.cwd(), '.data', 'partners.json');
const EMPTY: StoreFile = { version: 1, customs: [], records: {} };
const BUILT_IN_IDS = new Set(CURATED_BALI_PARTNERS.map((p) => p.id));
export const MAX_CUSTOM_PARTNERS = 500;

async function load(): Promise<StoreFile> {
  try {
    const parsed = JSON.parse(await fs.readFile(STORE_PATH, 'utf8')) as StoreFile;
    return { version: 1, customs: parsed.customs ?? [], records: parsed.records ?? {} };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') console.error('[partner-store] could not read store:', err);
    return structuredClone(EMPTY);
  }
}

async function save(data: StoreFile) {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  const tmp = `${STORE_PATH}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
  await fs.rename(tmp, STORE_PATH); // atomic replace: a crash never leaves half a file
}

// One write at a time, so two admins clicking together can't overwrite each other.
let queue: Promise<unknown> = Promise.resolve();
function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export interface StoredPartner {
  partner: CuratedPartner;
  builtIn: boolean;
  record: VerificationRecord;
}

/** Every partner (built-in + published) with its verification record. */
export async function listAll(): Promise<StoredPartner[]> {
  const data = await load();
  const customs = data.customs.filter((p) => !BUILT_IN_IDS.has(p.id));
  return [
    ...customs.map((p) => ({ partner: p, builtIn: false, record: data.records[p.id] ?? defaultRecord(p, false) })),
    ...CURATED_BALI_PARTNERS.map((p) => ({ partner: p, builtIn: true, record: data.records[p.id] ?? defaultRecord(p, true) }))
  ];
}

/** A partner publishes (or re-publishes) their listing. Status: published / unchanged if verified. */
export function publishPartner(partner: CuratedPartner): Promise<StoredPartner> {
  return exclusive(async () => {
    const data = await load();
    const now = new Date().toISOString();
    const existing = data.customs.find((p) => p.id === partner.id);
    if (!existing && data.customs.length >= MAX_CUSTOM_PARTNERS) throw new Error('store-full');
    data.customs = [partner, ...data.customs.filter((p) => p.id !== partner.id)];

    const prev = data.records[partner.id];
    // Editing a verified listing sends it back for review — the badge must match what is shown.
    const record: VerificationRecord = prev
      ? { ...prev, status: prev.status === 'removed' ? 'removed' : 'published', updatedAt: now, verifiedAt: undefined, verifiedBy: undefined }
      : { ...defaultRecord(partner, false), updatedAt: now, publishedAt: now };
    record.history = [...(prev?.history ?? []), { at: now, by: 'partner', action: 'published' }];
    data.records[partner.id] = record;
    await save(data);
    return { partner, builtIn: false, record };
  });
}

/** Apply one admin action to a batch of partners. */
export function applyAdminAction(
  ids: string[],
  action: AdminAction,
  by: string,
  opts: { note?: string; checklist?: Partial<Record<CheckId, boolean>> } = {}
): Promise<{ updated: string[]; batchId?: string }> {
  return exclusive(async () => {
    const data = await load();
    const now = new Date();
    const at = now.toISOString();
    const known = new Map<string, CuratedPartner>([
      ...CURATED_BALI_PARTNERS.map((p) => [p.id, p] as const),
      ...data.customs.map((p) => [p.id, p] as const)
    ]);
    // e.g. B-261017-2241 — groups partners reviewed/verified together
    const batchId =
      action === 'review' || action === 'verify'
        ? `B-${at.slice(2, 10).replace(/-/g, '')}-${at.slice(11, 16).replace(':', '')}`
        : undefined;

    const updated: string[] = [];
    for (const id of ids) {
      const partner = known.get(id);
      if (!partner) continue;
      const r: VerificationRecord = structuredClone(data.records[id] ?? defaultRecord(partner, BUILT_IN_IDS.has(id)));
      switch (action) {
        case 'review':
          r.status = 'in_review';
          r.batchId = batchId;
          break;
        case 'verify':
          r.status = 'verified';
          r.verifiedAt = at;
          r.verifiedBy = by;
          r.batchId = r.batchId ?? batchId;
          break;
        case 'needs_changes':
          r.status = 'needs_changes';
          r.verifiedAt = undefined;
          break;
        case 'remove':
          r.status = 'removed';
          r.verifiedAt = undefined;
          break;
        case 'restore':
          r.status = 'published';
          break;
        case 'checklist':
          r.checklist = { ...r.checklist, ...opts.checklist };
          break;
      }
      if (opts.note !== undefined && action !== 'checklist') r.note = opts.note || undefined;
      r.updatedAt = at;
      r.history = [...r.history, { at, by, action, note: opts.note || undefined, batchId }].slice(-50);
      data.records[id] = r;
      updated.push(id);
    }
    if (updated.length) await save(data);
    return { updated, batchId };
  });
}
