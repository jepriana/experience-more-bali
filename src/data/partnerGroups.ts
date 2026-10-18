import type { PartnerCategory } from '@/data/curatedPartners';

/**
 * KOSSI Adventure partner network — the official 10 partner groups ("Ecosystem Partners")
 * plus Ecosystem enablers (content creators, digital professionals, SME suppliers, digital
 * printing) who serve the partners rather than travelers.
 *
 *   A · Core travel experience      1 Destination · 2 Accommodation · 3 Restaurant & culinary
 *   B · Local experience & economy  4 Local product & retail · 6 Producer & IKM · 7 Community / institution
 *   C · Travel movement & strategic 5 Tourism service · 8 Travel distribution · 9 Strategic & brand
 *   T · Territorial                 10 Province, Kabupaten/Kota partners
 *   E · Ecosystem enablers          creators · digital pros · SME & suppliers · digital printing
 */

export type PartnerGroupId = 'A' | 'B' | 'C' | 'T' | 'E';

export type PartnerTypeId =
  | 'destination'
  | 'accommodation'
  | 'culinary'
  | 'local_product'
  | 'tourism_service'
  | 'producer'
  | 'community'
  | 'distribution'
  | 'strategic'
  | 'territorial'
  | 'creator'
  | 'digital_pro'
  | 'sme_service'
  | 'printing';

type L = { en: string; id: string };

export interface PartnerGroup {
  id: PartnerGroupId;
  name: L;
  tagline: L;
}

export interface PartnerType {
  id: PartnerTypeId;
  /** number on the official infographic (1–10); enablers have none */
  no?: number;
  group: PartnerGroupId;
  name: L;
  /** shown to travelers in the directory and trip planner */
  travelerFacing: boolean;
  /** category used for traveler listings and the trip planner */
  listingCategory?: PartnerCategory;
  subtypes: string[];
  products: string[];
}

export const PARTNER_GROUPS: PartnerGroup[] = [
  { id: 'A', name: { en: 'Core travel experience', id: 'Pengalaman wisata inti' }, tagline: { en: 'Visit · Stay · Eat', id: 'Kunjungi · Menginap · Makan' } },
  { id: 'B', name: { en: 'Local experience & economy', id: 'Pengalaman & ekonomi lokal' }, tagline: { en: 'Take home · Make · Connect', id: 'Bawa pulang · Buat · Terhubung' } },
  { id: 'C', name: { en: 'Travel movement & strategic', id: 'Pergerakan wisata & strategis' }, tagline: { en: 'Do · Bring · Grow', id: 'Lakukan · Bawa · Tumbuh' } },
  { id: 'T', name: { en: 'Territorial partners', id: 'Mitra kewilayahan' }, tagline: { en: 'Activate local potential', id: 'Aktifkan potensi lokal' } },
  { id: 'E', name: { en: 'Ecosystem enablers', id: 'Pendukung ekosistem' }, tagline: { en: 'Help partners grow', id: 'Bantu mitra bertumbuh' } }
];

export const PARTNER_TYPES: PartnerType[] = [
  {
    id: 'destination', no: 1, group: 'A', travelerFacing: true, listingCategory: 'Destination',
    name: { en: 'Destination', id: 'Destinasi' },
    subtypes: ['Tourism village (Desa Wisata)', 'Attraction', 'Cultural experience', 'Nature site', 'Beach', 'Temple / heritage'],
    products: ['Entrance ticket', 'Guided village walk', 'Cultural performance', 'Photo spot', 'Family package']
  },
  {
    id: 'accommodation', no: 2, group: 'A', travelerFacing: true, listingCategory: 'Accommodation',
    name: { en: 'Accommodation', id: 'Akomodasi' },
    subtypes: ['Hotel', 'Resort', 'Homestay', 'Villa', 'Guesthouse', 'Eco-lodge'],
    products: ['Family room', 'Breakfast included', 'Airport pickup', 'Long-stay discount', 'Cooking with host']
  },
  {
    id: 'culinary', no: 3, group: 'A', travelerFacing: true, listingCategory: 'Culinary',
    name: { en: 'Restaurant & culinary', id: 'Restoran & kuliner' },
    subtypes: ['Restaurant', 'Café', 'Coffee', 'Local food / warung', 'Cooking class'],
    products: ['Set menu', 'Family platter', 'Cooking class', 'Vegetarian menu', 'Takeaway']
  },
  {
    id: 'local_product', no: 4, group: 'B', travelerFacing: true, listingCategory: 'Activity',
    name: { en: 'Local product & retail', id: 'Produk lokal & ritel' },
    subtypes: ['Souvenir', 'Oleh-oleh', 'Tenun (weaving)', 'Craft', 'Retail shop'],
    products: ['Souvenir set', 'Custom order', 'Gift box', 'Shipping home', 'Workshop visit']
  },
  {
    id: 'tourism_service', no: 5, group: 'C', travelerFacing: true, listingCategory: 'Activity',
    name: { en: 'Tourism service', id: 'Jasa wisata' },
    subtypes: ['Tour operator', 'Local guide', 'Boat', 'Activity', 'Rental (car, scooter, gear)'],
    products: ['Half-day trip', 'Full-day trip', 'Private guide', 'Boat transfer', 'Equipment rental']
  },
  {
    id: 'producer', no: 6, group: 'B', travelerFacing: true, listingCategory: 'Activity',
    name: { en: 'Producer & IKM', id: 'Produsen & IKM' },
    subtypes: ['IKM', 'UMKM', 'Artisan', 'Producer', 'Weaving group'],
    products: ['Hands-on workshop', 'Factory / farm visit', 'Wholesale', 'Custom production']
  },
  {
    id: 'community', no: 7, group: 'B', travelerFacing: true, listingCategory: 'Destination',
    name: { en: 'Community / institution', id: 'Komunitas / lembaga' },
    subtypes: ['Community', 'Pokdarwis', 'Cooperative', 'Village institution', 'Government tourism office', 'Other institution'],
    products: ['Village tour', 'Cultural program', 'Community event', 'Volunteer program']
  },
  {
    id: 'distribution', no: 8, group: 'C', travelerFacing: false,
    name: { en: 'Travel distribution', id: 'Distribusi perjalanan' },
    subtypes: ['Travel agent', 'DMC', 'Tour operator', 'Travel community', 'Corporate travel'],
    products: ['Group tours', 'Corporate trips', 'Custom packages', 'Inbound groups']
  },
  {
    id: 'strategic', no: 9, group: 'C', travelerFacing: false,
    name: { en: 'Strategic & brand', id: 'Strategis & merek' },
    subtypes: ['Brand', 'Corporation', 'Product collaboration', 'Events', 'Media', 'Technology partner'],
    products: ['Co-branded gear', 'Sponsorship', 'Event partnership', 'Media coverage']
  },
  {
    id: 'territorial', no: 10, group: 'T', travelerFacing: false,
    name: { en: 'Territorial partner', id: 'Mitra kewilayahan' },
    subtypes: ['Province', 'Kabupaten / Kota', 'Local territory owner', 'Area operator'],
    products: ['Destination promotion', 'Regional program', 'Area permits', 'Data & insights']
  },
  {
    id: 'creator', group: 'E', travelerFacing: false,
    name: { en: 'Content creator', id: 'Kreator konten' },
    subtypes: ['Photographer', 'Videographer', 'Influencer', 'Writer'],
    products: ['Photo shoot', 'Short video', 'Social media post', 'Stay-for-content']
  },
  {
    id: 'digital_pro', group: 'E', travelerFacing: false,
    name: { en: 'Digital professional', id: 'Profesional digital' },
    subtypes: ['Web developer', 'Social media manager', 'Ads specialist', 'Designer'],
    products: ['Website', 'Google Maps setup', 'Social media management', 'Online ads']
  },
  {
    id: 'sme_service', group: 'E', travelerFacing: false,
    name: { en: 'SME owner & supplier', id: 'Pemilik UKM & pemasok' },
    subtypes: ['Supplier', 'Business mentor', 'Logistics', 'Packaging'],
    products: ['Bulk supply', 'Mentoring', 'Delivery', 'Group purchasing']
  },
  {
    id: 'printing', group: 'E', travelerFacing: false,
    name: { en: 'Digital printing', id: 'Digital printing' },
    subtypes: ['Digital printing', 'Merchandise', 'Signage', 'Packaging print'],
    products: ['T-shirt print', 'Sticker print', 'Counter cards', 'Banners']
  }
];

const BY_ID = new Map(PARTNER_TYPES.map((t) => [t.id, t]));

export function getPartnerType(id: string | undefined): PartnerType | undefined {
  return id ? BY_ID.get(id as PartnerTypeId) ?? BY_ID.get(LEGACY_TYPES[id] as PartnerTypeId) : undefined;
}

export function typesInGroup(group: PartnerGroupId) {
  return PARTNER_TYPES.filter((t) => t.group === group).sort((a, b) => (a.no ?? 99) - (b.no ?? 99));
}

/** "1 · Destination" / "Content creator" */
export function partnerTypeLabel(id: string | undefined, lang: 'en' | 'id'): string {
  const t = getPartnerType(id);
  if (!t) return '';
  return t.no ? `${t.no} · ${t.name[lang]}` : t.name[lang];
}

/** Business-profile types used before the 10 groups existed. */
export const LEGACY_TYPES: Record<string, PartnerTypeId> = {
  Destination: 'destination',
  Accommodation: 'accommodation',
  Culinary: 'culinary',
  Activity: 'tourism_service',
  LocalProducts: 'local_product',
  Transport: 'tourism_service'
};

export function normalizePartnerType(id: string | undefined): PartnerTypeId | undefined {
  return getPartnerType(id)?.id;
}
