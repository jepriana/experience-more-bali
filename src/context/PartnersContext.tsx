'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CuratedPartner, CURATED_BALI_PARTNERS } from '@/data/curatedPartners';

interface PartnersContextType {
  partners: CuratedPartner[];
  addPartner: (partner: CuratedPartner) => void;
  resetToDefault: () => void;
  isCustomPartner: (id: string) => boolean;
  totalCustomCount: number;
}

const STORAGE_KEY = 'emb_curated_custom_partners_v1';

const PartnersContext = createContext<PartnersContextType>({
  partners: CURATED_BALI_PARTNERS,
  addPartner: () => {},
  resetToDefault: () => {},
  isCustomPartner: () => false,
  totalCustomCount: 0
});

export function PartnersProvider({ children }: { children: React.ReactNode }) {
  const [partners, setPartners] = useState<CuratedPartner[]>(CURATED_BALI_PARTNERS);
  const [customIds, setCustomIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const customPartners: CuratedPartner[] = JSON.parse(stored);
        if (Array.isArray(customPartners) && customPartners.length > 0) {
          // Prepend custom partners to default dataset
          setPartners([...customPartners, ...CURATED_BALI_PARTNERS]);
          setCustomIds(customPartners.map((p) => p.id));
        }
      }
    } catch (e) {
      console.warn('Could not load custom partners from localStorage:', e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const addPartner = (newPartner: CuratedPartner) => {
    setPartners((prev) => {
      // Avoid duplicate if same id exists
      const filtered = prev.filter((p) => p.id !== newPartner.id);
      const updated = [newPartner, ...filtered];
      // Save only custom partners to localStorage
      const defaultIds = new Set(CURATED_BALI_PARTNERS.map((p) => p.id));
      const customs = updated.filter((p) => !defaultIds.has(p.id));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customs));
      } catch (err) {
        console.error('Failed to save partner to localStorage:', err);
      }
      return updated;
    });

    setCustomIds((prev) => (prev.includes(newPartner.id) ? prev : [newPartner.id, ...prev]));
  };

  const resetToDefault = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setPartners(CURATED_BALI_PARTNERS);
    setCustomIds([]);
  };

  const isCustomPartner = (id: string) => customIds.includes(id);

  return (
    <PartnersContext.Provider
      value={{
        partners,
        addPartner,
        resetToDefault,
        isCustomPartner,
        totalCustomCount: customIds.length
      }}
    >
      {children}
    </PartnersContext.Provider>
  );
}

export function usePartners() {
  return useContext(PartnersContext);
}
