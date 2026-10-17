'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { getBaliRegion, INTERNATIONAL, type BaliRegionId } from '@/data/regions';

/**
 * Traveler and partner sign-up data, saved on this device (localStorage) so a returning
 * visitor goes straight to their page. A real backend login replaces this later — the
 * hooks below are the only place that would need to change.
 */

export interface TravelerAccount {
  /** name, family or group — the big text on their sticker */
  name: string;
  /** email or phone (WhatsApp) */
  contact: string;
  /** Indonesian province, or INTERNATIONAL */
  homeProvince: string;
  /** optional city — or the country when homeProvince is INTERNATIONAL */
  homeCity?: string;
  createdAt: string;
}

export interface PartnerAccount {
  /** person in charge */
  picName: string;
  businessName: string;
  contact: string;
  regionId: BaliRegionId;
  /** optional well-known area inside the region, e.g. "Ubud" */
  area?: string;
  createdAt: string;
}

interface Accounts {
  traveler?: TravelerAccount;
  partner?: PartnerAccount;
}

const STORAGE_KEY = 'kossi_accounts_v1';
const EMPTY: Accounts = {};
const listeners = new Set<() => void>();
let cache: Accounts | null = null;

function read(): Accounts {
  if (cache === null) {
    try {
      cache = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Accounts;
    } catch {
      cache = {};
    }
  }
  return cache;
}

function write(next: Accounts) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (e) {
    console.warn('Could not save account:', e);
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null; // another browser tab changed it
      listener();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function useAccounts() {
  // Server render sees no account; the browser fills it in after hydration.
  const accounts = useSyncExternalStore(subscribe, read, () => EMPTY);

  const saveTraveler = useCallback((traveler: TravelerAccount) => write({ ...read(), traveler }), []);
  const savePartner = useCallback((partner: PartnerAccount) => write({ ...read(), partner }), []);
  const clearTraveler = useCallback(() => write({ ...read(), traveler: undefined }), []);
  const clearPartner = useCallback(() => write({ ...read(), partner: undefined }), []);

  return {
    traveler: accounts.traveler ?? null,
    partner: accounts.partner ?? null,
    saveTraveler,
    savePartner,
    clearTraveler,
    clearPartner
  };
}

const noopSubscribe = () => () => {};

/** false during server render / hydration, true once running in the browser. */
export function useHydrated() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

/** "Surabaya, Jawa Timur" · "DKI Jakarta" · "Australia" — the region line on a traveler sticker. */
export function travelerRegionLabel(a: Pick<TravelerAccount, 'homeProvince' | 'homeCity'>): string {
  const city = a.homeCity?.trim();
  if (a.homeProvince === INTERNATIONAL) return city || INTERNATIONAL;
  return city ? `${city}, ${a.homeProvince}` : a.homeProvince;
}

/** "Ubud · Gianyar, Bali" — the region line on a partner sticker. */
export function partnerRegionLabel(a: Pick<PartnerAccount, 'regionId' | 'area'>): string {
  const region = getBaliRegion(a.regionId)?.name ?? '';
  const area = a.area?.trim();
  return area ? `${area} · ${region}, Bali` : `${region}, Bali`;
}
