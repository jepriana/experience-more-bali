'use client';

import { useCallback, useMemo } from 'react';
import { usePartners } from '@/context/PartnersContext';
import { useSessionState } from '@/context/SessionStateContext';
import type { BaliRegionId } from '@/data/regions';
import type { CuratedPartner, TravelCategory } from '@/data/curatedPartners';
import type { StreamResultMeta } from '@/lib/streamProtocol';
import {
  autoArrange,
  partnerRegionId,
  partnerTravelCategories,
  toStop,
  type Stop
} from '@/lib/tripPlanning';

/** One colour per day — pins, routes, grid circles and day cards all use it. */
export const DAY_COLORS = ['#f43f5e', '#3b82f6', '#f59e0b', '#10b981', '#a855f7', '#06b6d4', '#ec4899', '#84cc16'];
export const MAX_DAYS = 7;

/** What we keep from the last "Arrange my days" answer. */
export interface TripPlanMeta extends StreamResultMeta {
  tripTitle: string;
  days: { title: string; why: string }[];
  tips: string[];
  thoughts?: string;
}

/**
 * Trip-wizard state (session store: survives tab switches and refreshes).
 * regions → categories → basket → days, plus the stop→day assignment.
 */
export function useTrip() {
  const { partners } = usePartners();
  const [step, setStep] = useSessionState<number>('trip.step', 0);
  const [regions, setRegions] = useSessionState<BaliRegionId[]>('trip.regions', []);
  const [categories, setCategories] = useSessionState<TravelCategory[]>('trip.categories', []);
  const [basket, setBasket] = useSessionState<string[]>('trip.basket', []);
  const [basketSig, setBasketSig] = useSessionState<string>('trip.basketSig', '');
  const [days, setDaysRaw] = useSessionState<number>('trip.days', 3);
  const [assignment, setAssignment] = useSessionState<Record<string, number>>('trip.assignment', {});
  const [plan, setPlan] = useSessionState<TripPlanMeta | null>('trip.plan', null);
  /** id of this trip on the server (its memory page /m/t_… with photos & videos) */
  const [serverTripId, setServerTripId] = useSessionState<string | null>('trip.serverId', null);

  /** Partners in the chosen regions offering a chosen experience. */
  const matches = useMemo(
    () =>
      partners.filter((p) => {
        const r = partnerRegionId(p);
        return !!r && regions.includes(r) && partnerTravelCategories(p).some((c) => categories.includes(c));
      }),
    [partners, regions, categories]
  );

  const basketPartners = useMemo(() => partners.filter((p) => basket.includes(p.id)), [partners, basket]);
  const stops = useMemo(() => basketPartners.map(toStop).filter((s): s is Stop => !!s), [basketPartners]);

  const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
  const toggleRegion = useCallback((id: BaliRegionId) => setRegions((r) => toggle(r, id)), [setRegions]);
  const toggleCategory = useCallback((c: TravelCategory) => setCategories((cs) => toggle(cs, c)), [setCategories]);
  const toggleBasket = useCallback((id: string) => setBasket((b) => toggle(b, id)), [setBasket]);
  /** add several partners at once (an area cluster) */
  const addToBasket = useCallback((ids: string[]) => setBasket((b) => [...b, ...ids.filter((id) => !b.includes(id))]), [setBasket]);

  /** Step 2 → 3: fill the basket with every match (least thinking) — only if the picks changed. */
  const goToBasket = () => {
    const sig = [...regions].sort().join(',') + '|' + [...categories].sort().join(',');
    if (sig !== basketSig) {
      setBasket(matches.map((p) => p.id));
      setBasketSig(sig);
      setAssignment({});
      setPlan(null);
    }
    setStep(2);
  };

  /** Step 3 → 4: if nothing is planned yet, lay out an instant plan so the grid is never empty. */
  const goToPlan = () => {
    const planned = stops.some((s) => assignment[s.id] !== undefined && assignment[s.id] < days);
    if (!planned) setAssignment(autoArrange(stops, days));
    setStep(3);
  };

  /** Changing the number of days re-arranges instantly (AI can then refine). */
  const setDays = (n: number) => {
    setDaysRaw(n);
    setAssignment(autoArrange(stops, n));
    setPlan(null);
  };

  /** Tap a circle: put the stop on that day, or take it off if it's already there. */
  const setStopDay = (id: string, day: number) =>
    setAssignment((a) => {
      const next = { ...a };
      if (next[id] === day) delete next[id];
      else next[id] = day;
      return next;
    });

  const startOver = () => {
    setRegions([]);
    setCategories([]);
    setBasket([]);
    setBasketSig('');
    setAssignment({});
    setPlan(null);
    setServerTripId(null); // a new trip gets its own memory page
    setStep(0);
  };

  return {
    partners,
    step,
    setStep,
    regions,
    toggleRegion,
    categories,
    toggleCategory,
    matches,
    basket,
    basketPartners,
    toggleBasket,
    addToBasket,
    stops,
    days,
    setDays,
    assignment,
    setAssignment,
    setStopDay,
    plan,
    setPlan,
    goToBasket,
    goToPlan,
    startOver,
    serverTripId,
    setServerTripId
  };
}

export type TripState = ReturnType<typeof useTrip>;

export function partnerById(partners: CuratedPartner[], id: string) {
  return partners.find((p) => p.id === id);
}
