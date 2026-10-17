/**
 * Region data shared by sign-up, search, stickers and (stage 2) the trip map.
 *
 * Two different "regions" exist in the product:
 *  - BALI_REGIONS: where in Bali a partner is / a traveler wants to go (the 9 official
 *    regencies + city), each with the familiar area names travelers actually search for.
 *  - INDONESIA_PROVINCES: where a traveler comes FROM (shown on their memory sticker).
 */

export type BaliRegionId =
  | 'badung'
  | 'bangli'
  | 'buleleng'
  | 'denpasar'
  | 'gianyar'
  | 'jembrana'
  | 'karangasem'
  | 'klungkung'
  | 'tabanan';

export interface BaliRegion {
  id: BaliRegionId;
  /** official name of the regency / city */
  name: string;
  /** well-known areas inside it — what travelers recognise */
  areas: string[];
  /** map colour (stage 2) */
  color: string;
  /** approximate centre, for the map and rough travel-time estimates */
  center: { lat: number; lng: number };
}

export const BALI_REGIONS: BaliRegion[] = [
  {
    id: 'badung',
    name: 'Badung',
    areas: ['Kuta', 'Seminyak', 'Canggu', 'Jimbaran', 'Uluwatu', 'Nusa Dua'],
    color: '#f97316',
    center: { lat: -8.58, lng: 115.18 }
  },
  {
    id: 'bangli',
    name: 'Bangli',
    areas: ['Kintamani', 'Mount Batur', 'Penglipuran'],
    color: '#a855f7',
    center: { lat: -8.3, lng: 115.35 }
  },
  {
    id: 'buleleng',
    name: 'Buleleng',
    areas: ['Lovina', 'Singaraja', 'Munduk', 'Pemuteran', 'Menjangan'],
    color: '#0ea5e9',
    center: { lat: -8.18, lng: 115.0 }
  },
  {
    id: 'denpasar',
    name: 'Denpasar',
    areas: ['Sanur', 'Renon', 'Denpasar City'],
    color: '#ef4444',
    center: { lat: -8.67, lng: 115.22 }
  },
  {
    id: 'gianyar',
    name: 'Gianyar',
    areas: ['Ubud', 'Tegallalang', 'Sukawati', 'Tampaksiring', 'Keramas'],
    color: '#22c55e',
    center: { lat: -8.47, lng: 115.31 }
  },
  {
    id: 'jembrana',
    name: 'Jembrana',
    areas: ['Negara', 'Medewi', 'Gilimanuk', 'Perancak'],
    color: '#eab308',
    center: { lat: -8.33, lng: 114.65 }
  },
  {
    id: 'karangasem',
    name: 'Karangasem',
    areas: ['Amed', 'Sidemen', 'Tulamben', 'Candidasa', 'Besakih', 'Tirta Gangga'],
    color: '#14b8a6',
    center: { lat: -8.38, lng: 115.55 }
  },
  {
    id: 'klungkung',
    name: 'Klungkung',
    areas: ['Nusa Penida', 'Nusa Lembongan', 'Semarapura'],
    color: '#ec4899',
    center: { lat: -8.55, lng: 115.4 }
  },
  {
    id: 'tabanan',
    name: 'Tabanan',
    areas: ['Jatiluwih', 'Bedugul', 'Tanah Lot', 'Batukaru', 'Kedungu'],
    color: '#84cc16',
    center: { lat: -8.43, lng: 115.1 }
  }
];

export function getBaliRegion(id: string | undefined | null): BaliRegion | undefined {
  return BALI_REGIONS.find((r) => r.id === id);
}

/** Indonesia's 38 provinces — a traveler's home region. */
export const INDONESIA_PROVINCES: string[] = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Sumatera Selatan',
  'Kepulauan Bangka Belitung',
  'Bengkulu',
  'Lampung',
  'DKI Jakarta',
  'Jawa Barat',
  'Banten',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Gorontalo',
  'Sulawesi Tengah',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Maluku',
  'Maluku Utara',
  'Papua',
  'Papua Barat',
  'Papua Barat Daya',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Selatan'
];

/** Special value for travelers from outside Indonesia. */
export const INTERNATIONAL = 'International';
