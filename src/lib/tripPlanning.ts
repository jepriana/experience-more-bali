/**
 * Trip-planning engine — pure functions shared by the browser (day planner, map, warnings)
 * and the server (AI fallback + repairing the AI's answer). No network, no randomness.
 */
import { BALI_REGIONS, getBaliRegion, type BaliRegionId } from '@/data/regions';
import type { CuratedPartner, TravelCategory } from '@/data/curatedPartners';

export const TRAVEL_CATEGORIES: TravelCategory[] = ['nature', 'activities', 'accommodation', 'culinary'];

export interface LatLng {
  lat: number;
  lng: number;
}

/** "Arrange my days" result, as sent to the browser (AI or instant planner). */
export interface ArrangedTrip {
  tripTitle: string;
  /** inferred from the traveler's choices — the "backyard" insight, never asked */
  travelerType: string;
  days: { title: string; why: string; stopIds: string[] }[];
  tips: string[];
}

/** A partner as the planner sees it. */
export interface Stop {
  id: string;
  name: string;
  category: CuratedPartner['category'];
  regionId: BaliRegionId;
  area?: string;
  coords: LatLng;
  requiresBoat: boolean;
}

// ───────── Partner → location / categories (works for published partners without coordinates too) ─────────

/** Finds a Bali region mentioned in free text like "Penebel Village, Tabanan Regency". */
export function inferRegionId(text: string): BaliRegionId | undefined {
  const t = text.toLowerCase();
  for (const r of BALI_REGIONS) {
    if (t.includes(r.name.toLowerCase())) return r.id;
  }
  for (const r of BALI_REGIONS) {
    if (r.areas.some((a) => t.includes(a.toLowerCase()))) return r.id;
  }
  return undefined;
}

export function partnerRegionId(p: CuratedPartner): BaliRegionId | undefined {
  return p.regionId ?? inferRegionId(`${p.location} ${p.area ?? ''}`);
}

export function partnerTravelCategories(p: CuratedPartner): TravelCategory[] {
  if (p.travelCategories?.length) return p.travelCategories;
  switch (p.category) {
    case 'Accommodation':
      return ['accommodation'];
    case 'Culinary':
      return ['culinary'];
    case 'Activity':
      return ['activities'];
    default:
      return ['nature'];
  }
}

/** Planner view of a partner; null when we can't place it in Bali. */
export function toStop(p: CuratedPartner): Stop | null {
  const regionId = partnerRegionId(p);
  const region = getBaliRegion(regionId);
  if (!region) return null;
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    regionId: region.id,
    area: p.area,
    coords: p.coords ?? region.center, // published partners without coordinates sit at their region's centre
    requiresBoat: Boolean(p.requiresBoat)
  };
}

// ───────── Distances & driving time ─────────

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rough Bali road-time estimate: winding roads (×1.4) at ~28 km/h, plus ~60 min for a boat crossing. */
export function travelMinutes(a: Stop, b: Stop): number {
  const roadKm = haversineKm(a.coords, b.coords) * 1.4;
  const drive = Math.round((roadKm / 28) * 60);
  const boat = a.requiresBoat !== b.requiresBoat ? 60 : 0;
  return Math.max(5, drive) + boat;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ───────── Ordering a day & warnings ─────────

/** Visit order within a day: start in the west, always go to the nearest next stop, stays last. */
export function orderDayRoute(stops: Stop[]): Stop[] {
  if (stops.length <= 1) return [...stops];
  const stays = stops.filter((s) => s.category === 'Accommodation');
  const visits = stops.filter((s) => s.category !== 'Accommodation');
  const pool = visits.length ? [...visits] : [...stays];
  const rest = visits.length ? stays : [];

  pool.sort((a, b) => a.coords.lng - b.coords.lng);
  const ordered: Stop[] = [pool.shift()!];
  while (pool.length) {
    const last = ordered[ordered.length - 1];
    let best = 0;
    for (let i = 1; i < pool.length; i++) {
      if (haversineKm(last.coords, pool[i].coords) < haversineKm(last.coords, pool[best].coords)) best = i;
    }
    ordered.push(pool.splice(best, 1)[0]);
  }
  return [...ordered, ...rest];
}

export type DayWarning = 'long' | 'regions' | 'boat';

export interface DaySummary {
  route: Stop[];
  travelMinutes: number;
  regions: BaliRegionId[];
  warnings: DayWarning[];
}

/** Over ~3h on the road, or 3+ regions in a day, gets a warning. */
export function summarizeDay(stops: Stop[]): DaySummary {
  const route = orderDayRoute(stops);
  let minutes = 0;
  for (let i = 1; i < route.length; i++) minutes += travelMinutes(route[i - 1], route[i]);
  const regions = [...new Set(route.map((s) => s.regionId))];
  const warnings: DayWarning[] = [];
  if (minutes > 180) warnings.push('long');
  if (regions.length >= 3) warnings.push('regions');
  if (route.some((s) => s.requiresBoat) && route.some((s) => !s.requiresBoat)) warnings.push('boat');
  return { route, travelMinutes: minutes, regions, warnings };
}

// ───────── Instant arrangement (no AI) ─────────

/**
 * Splits stops into `days` geographically tight groups:
 * farthest-point seeds → nearest seed (with a per-day cap) → days ordered west to east.
 * Returns stopId → day index (0-based).
 */
export function autoArrange(stops: Stop[], days: number): Record<string, number> {
  const n = stops.length;
  if (n === 0 || days <= 0) return {};
  const k = Math.min(days, n);
  const cap = Math.ceil(n / k) + 1;

  // Distance to a group centre; crossing the strait (boat vs mainland) is strongly discouraged
  type Centre = LatLng & { boat: boolean };
  const cost = (c: Centre, s: Stop) => haversineKm(c, s.coords) + (c.boat !== s.requiresBoat ? 500 : 0);

  // 1) farthest-point seeds, starting from the westernmost stop
  const westmost = stops.reduce((w, s) => (s.coords.lng < w.coords.lng ? s : w), stops[0]);
  const centres: Centre[] = [{ ...westmost.coords, boat: westmost.requiresBoat }];
  while (centres.length < k) {
    let far = stops[0];
    let farCost = -1;
    for (const s of stops) {
      const c = Math.min(...centres.map((centre) => cost(centre, s)));
      if (c > farCost) {
        farCost = c;
        far = s;
      }
    }
    centres.push({ ...far.coords, boat: far.requiresBoat });
  }

  // 2) a few rounds of k-means: assign to nearest centre, move centres to their group's middle
  let groups: Stop[][] = [];
  for (let round = 0; round < 12; round++) {
    groups = centres.map(() => []);
    for (const s of stops) {
      let best = 0;
      for (let i = 1; i < centres.length; i++) if (cost(centres[i], s) < cost(centres[best], s)) best = i;
      groups[best].push(s);
    }
    groups.forEach((g, i) => {
      if (!g.length) return;
      centres[i] = {
        lat: g.reduce((a, s) => a + s.coords.lat, 0) / g.length,
        lng: g.reduce((a, s) => a + s.coords.lng, 0) / g.length,
        boat: g.every((s) => s.requiresBoat)
      };
    });
  }

  // 3) rebalance: overfull days hand their farthest stop to the nearest day with room
  for (let guard = 0; guard < n * k; guard++) {
    const over = groups.findIndex((g) => g.length > cap);
    if (over < 0) break;
    const g = groups[over];
    g.sort((a, b) => cost(centres[over], a) - cost(centres[over], b));
    const moving = g.pop()!;
    const target = centres
      .map((c, i) => ({ i, d: cost(c, moving) }))
      .filter(({ i }) => i !== over && groups[i].length < cap)
      .sort((a, b) => a.d - b.d)[0];
    if (!target) {
      g.push(moving);
      break;
    }
    groups[target.i].push(moving);
  }

  // Order the days west → east so the trip flows across the island
  const centroid = (g: Stop[]) => g.reduce((sum, s) => sum + s.coords.lng, 0) / Math.max(g.length, 1);
  const orderedGroups = groups.filter((g) => g.length).sort((a, b) => centroid(a) - centroid(b));

  const result: Record<string, number> = {};
  orderedGroups.forEach((g, day) => g.forEach((s) => (result[s.id] = day)));
  return result;
}

/** Places any unassigned stop on the day whose stops are closest to it. */
export function fillUnassigned(stops: Stop[], assignment: Record<string, number>, days: number): Record<string, number> {
  const next = { ...assignment };
  for (const s of stops) {
    if (next[s.id] !== undefined && next[s.id] < days) continue;
    let bestDay = 0;
    let bestDist = Infinity;
    for (let d = 0; d < days; d++) {
      const onDay = stops.filter((o) => next[o.id] === d);
      const dist = onDay.length ? Math.min(...onDay.map((o) => haversineKm(o.coords, s.coords))) : 50; // empty day: neutral
      if (dist < bestDist) {
        bestDist = dist;
        bestDay = d;
      }
    }
    next[s.id] = bestDay;
  }
  return next;
}

// ───────── Suggestions & insights ─────────

/** Partners outside the chosen regions but close to them ("just across the border"). */
export function nearbyAcrossBorder(
  partners: CuratedPartner[],
  regions: BaliRegionId[],
  categories: TravelCategory[],
  maxKm = 20
): { partner: CuratedPartner; km: number }[] {
  const anchors: LatLng[] = [
    ...partners
      .map(toStop)
      .filter((s): s is Stop => !!s && regions.includes(s.regionId))
      .map((s) => s.coords),
    ...regions.map((id) => getBaliRegion(id)!.center)
  ];
  if (!anchors.length) return [];
  return partners
    .map((p) => ({ p, stop: toStop(p) }))
    .filter(({ p, stop }) => stop && !regions.includes(stop.regionId) && partnerTravelCategories(p).some((c) => categories.includes(c)))
    .map(({ p, stop }) => ({ partner: p, km: Math.min(...anchors.map((a) => haversineKm(a, stop!.coords))) }))
    .filter((x) => x.km <= maxKm)
    .sort((a, b) => a.km - b.km);
}

/**
 * "Backyard" insight: what kind of traveler this is, inferred from what they picked
 * (we never ask). Used for partner insights; the AI refines it when available.
 */
export function inferTravelerType(categories: TravelCategory[], stops: Stop[]): string {
  const parts: string[] = [];
  if (categories.includes('nature')) parts.push('Nature');
  if (categories.includes('activities')) parts.push('Adventure');
  if (categories.includes('culinary')) parts.push('Food');
  const regions = new Set(stops.map((s) => s.regionId)).size;
  const style = regions >= 4 ? 'island explorer' : regions <= 1 ? 'slow traveler' : 'explorer';
  return parts.length ? `${parts.join(' & ')} ${style}` : `Comfort-first ${style}`;
}
