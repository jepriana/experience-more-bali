'use client';

import React, { createContext, useContext, useCallback, useSyncExternalStore, useMemo } from 'react';
import { CuratedPartner, CURATED_BALI_PARTNERS } from '@/data/curatedPartners';

interface PartnersContextType {
  partners: CuratedPartner[];
  addPartner: (partner: CuratedPartner) => void;
  resetToDefault: () => void;
  isCustomPartner: (id: string) => boolean;
  totalCustomCount: number;
}

const STORAGE_KEY = 'emb_curated_custom_partners_v1';

const listeners = new Set<() => void>();
let cachedCustom: CuratedPartner[] | null = null;
const EMPTY_CUSTOM: CuratedPartner[] = [];

function readCustomPartners(): CuratedPartner[] {
  if (cachedCustom !== null) return cachedCustom;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        cachedCustom = parsed;
        return cachedCustom;
      }
    }
  } catch (e) {
    console.warn('Could not load custom partners from localStorage:', e);
  }
  cachedCustom = EMPTY_CUSTOM;
  return cachedCustom;
}

function writeCustomPartners(customs: CuratedPartner[]) {
  cachedCustom = customs;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
  } catch (err) {
    console.error('Failed to save partner to localStorage:', err);
  }
  listeners.forEach((l) => l());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedCustom = null;
      callback();
    }
  };
  window.addEventListener('storage', handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', handleStorage);
  };
}

const PartnersContext = createContext<PartnersContextType>({
  partners: CURATED_BALI_PARTNERS,
  addPartner: () => {},
  resetToDefault: () => {},
  isCustomPartner: () => false,
  totalCustomCount: 0
});

export function PartnersProvider({ children }: { children: React.ReactNode }) {
  const customPartners = useSyncExternalStore(subscribe, readCustomPartners, () => EMPTY_CUSTOM);

  const customIds = useMemo(() => new Set(customPartners.map((p) => p.id)), [customPartners]);

  const partners = useMemo(() => {
    if (customPartners.length === 0) return CURATED_BALI_PARTNERS;
    return [...customPartners, ...CURATED_BALI_PARTNERS.filter((p) => !customIds.has(p.id))];
  }, [customPartners, customIds]);

  const addPartner = useCallback((newPartner: CuratedPartner) => {
    const current = readCustomPartners();
    const updated = [newPartner, ...current.filter((p) => p.id !== newPartner.id)];
    writeCustomPartners(updated);
  }, []);

  const resetToDefault = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    writeCustomPartners(EMPTY_CUSTOM);
  }, []);

  const isCustomPartner = useCallback((id: string) => customIds.has(id), [customIds]);

  return (
    <PartnersContext.Provider
      value={{
        partners,
        addPartner,
        resetToDefault,
        isCustomPartner,
        totalCustomCount: customPartners.length
      }}
    >
      {children}
    </PartnersContext.Provider>
  );
}

export function usePartners() {
  return useContext(PartnersContext);
}
