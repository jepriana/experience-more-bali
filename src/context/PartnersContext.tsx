'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from 'react';
import { CuratedPartner, CURATED_BALI_PARTNERS } from '@/data/curatedPartners';
import { defaultRecord, toPublic, type PublicStatus } from '@/lib/verification';

/**
 * The partner directory every page uses: built-in curated partners + partners published
 * through the app, with each partner's verification status.
 *
 * Published partners and statuses live on the server (/api/partners), so a listing published
 * on one device is visible — and verifiable by the KOSSI admin — everywhere.
 */

interface PartnersContextType {
  partners: CuratedPartner[];
  /** publish a listing to the server; resolves with an error message if it failed */
  addPartner: (partner: CuratedPartner) => Promise<{ ok: boolean; error?: string }>;
  isCustomPartner: (id: string) => boolean;
  totalCustomCount: number;
  /** verification status of any partner (sensible default before the server answers) */
  statusOf: (id: string) => PublicStatus;
  isVerified: (id: string) => boolean;
  /** re-read the directory (e.g. after the admin verified someone) */
  refresh: () => Promise<void>;
}

interface DirectoryState {
  customs: CuratedPartner[];
  statuses: Record<string, PublicStatus>;
  loaded: boolean;
}

// Listings published before the server store existed were kept in this browser only
const LEGACY_STORAGE_KEY = 'emb_curated_custom_partners_v1';

const INITIAL: DirectoryState = { customs: [], statuses: {}, loaded: false };
let state: DirectoryState = INITIAL;
const listeners = new Set<() => void>();

function setState(next: DirectoryState) {
  state = next;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

let inflight: Promise<void> | null = null;
async function fetchDirectory() {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch('/api/partners', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { customs: CuratedPartner[]; statuses: Record<string, PublicStatus> };
      setState({ customs: data.customs ?? [], statuses: data.statuses ?? {}, loaded: true });
    } catch (err) {
      console.warn('[partners] could not load the directory:', err);
      setState({ ...state, loaded: true });
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

async function postPartner(partner: CuratedPartner): Promise<{ ok: boolean; error?: string; status?: PublicStatus }> {
  try {
    const res = await fetch('/api/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partner)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) return { ok: false, error: data?.error ?? `Could not publish (${res.status}).` };
    return { ok: true, status: data?.status };
  } catch {
    return { ok: false, error: 'No connection to the server. Please try again.' };
  }
}

/** One-time move of browser-only listings to the server. */
async function migrateLegacyListings() {
  let legacy: CuratedPartner[] = [];
  try {
    legacy = JSON.parse(localStorage.getItem(LEGACY_STORAGE_KEY) ?? '[]');
  } catch {}
  if (!Array.isArray(legacy) || legacy.length === 0) return;
  const results = await Promise.all(legacy.map((p) => postPartner(p)));
  if (results.every((r) => r.ok)) {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {}
  }
}

const BUILT_IN = new Map(CURATED_BALI_PARTNERS.map((p) => [p.id, p]));

const PartnersContext = createContext<PartnersContextType>({
  partners: CURATED_BALI_PARTNERS,
  addPartner: async () => ({ ok: false }),
  isCustomPartner: () => false,
  totalCustomCount: 0,
  statusOf: () => ({ status: 'published' }),
  isVerified: () => false,
  refresh: async () => {}
});

export function PartnersProvider({ children }: { children: React.ReactNode }) {
  const directory = useSyncExternalStore(subscribe, () => state, () => INITIAL);

  useEffect(() => {
    void migrateLegacyListings().then(fetchDirectory);
    // pick up admin decisions when the traveler comes back to the tab
    const onFocus = () => void fetchDirectory();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const customIds = useMemo(() => new Set(directory.customs.map((p) => p.id)), [directory.customs]);

  // Removed partners are hidden from travelers
  const partners = useMemo(() => {
    const visible = (p: CuratedPartner) => directory.statuses[p.id]?.status !== 'removed';
    return [...directory.customs, ...CURATED_BALI_PARTNERS.filter((p) => !customIds.has(p.id))].filter(visible);
  }, [directory, customIds]);

  const statusOf = useCallback(
    (id: string): PublicStatus => {
      const known = directory.statuses[id];
      if (known) return known;
      const builtIn = BUILT_IN.get(id);
      return builtIn ? toPublic(defaultRecord(builtIn, true)) : { status: 'published' };
    },
    [directory.statuses]
  );

  const isVerified = useCallback((id: string) => statusOf(id).status === 'verified', [statusOf]);

  const addPartner = useCallback(async (partner: CuratedPartner) => {
    // show it straight away; the server confirms
    setState({
      ...state,
      customs: [partner, ...state.customs.filter((p) => p.id !== partner.id)],
      statuses: { ...state.statuses, [partner.id]: { status: 'published' } }
    });
    const result = await postPartner(partner);
    if (!result.ok) {
      setState({ ...state, customs: state.customs.filter((p) => p.id !== partner.id) });
      return { ok: false, error: result.error };
    }
    void fetchDirectory();
    return { ok: true };
  }, []);

  const isCustomPartner = useCallback((id: string) => customIds.has(id), [customIds]);

  return (
    <PartnersContext.Provider
      value={{
        partners,
        addPartner,
        isCustomPartner,
        totalCustomCount: directory.customs.length,
        statusOf,
        isVerified,
        refresh: fetchDirectory
      }}
    >
      {children}
    </PartnersContext.Provider>
  );
}

export function usePartners() {
  return useContext(PartnersContext);
}
