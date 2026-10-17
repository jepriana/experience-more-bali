/**
 * Partner business profile — answered by tapping menus, never long forms
 * (the team lead's "make them unaware of submitting data").
 * A. business type · B. products/services · C. discount · D. AI support wanted · E. digital status
 */

export type BusinessType = 'Destination' | 'Accommodation' | 'Culinary' | 'Activity' | 'LocalProducts' | 'Transport';

/** Sub-types offered once the main type is chosen. */
export const BUSINESS_SUBTYPES: Record<BusinessType, string[]> = {
  Destination: ['Desa Wisata', 'Nature site', 'Temple / cultural site', 'Beach', 'Waterfall', 'Rice terraces'],
  Accommodation: ['Homestay', 'Villa', 'Eco-lodge', 'Guesthouse', 'Hotel', 'Glamping'],
  Culinary: ['Warung', 'Restaurant', 'Café', 'Cooking class', 'Street food', 'Coffee / tea'],
  Activity: ['Guided tour', 'Water sport', 'Trekking', 'Cycling', 'Workshop / class', 'Wellness'],
  LocalProducts: ['Handicraft', 'Weaving / textiles', 'Souvenirs', 'Farm products', 'Art gallery'],
  Transport: ['Driver / car', 'Scooter rental', 'Boat', 'Shuttle']
};

/** Product/service suggestions to tap (partners can also type their own). */
export const PRODUCT_SUGGESTIONS: Record<BusinessType, string[]> = {
  Destination: ['Entrance ticket', 'Guided village walk', 'Cultural performance', 'Photo spot', 'Family package'],
  Accommodation: ['Family room', 'Breakfast included', 'Airport pickup', 'Long-stay discount', 'Cooking with host'],
  Culinary: ['Set menu', 'Family platter', 'Cooking class', 'Vegetarian menu', 'Takeaway'],
  Activity: ['Half-day trip', 'Full-day trip', 'Private group', 'Kids session', 'Equipment rental'],
  LocalProducts: ['Workshop', 'Custom order', 'Gift set', 'Shipping', 'Wholesale'],
  Transport: ['Airport transfer', 'Full-day driver', 'Hourly rental', 'Island hopping']
};

export const FACILITIES = ['Kids welcome', 'Wheelchair access', 'Halal options', 'Vegetarian options', 'English-speaking staff', 'Parking'];

export const DISCOUNT_OPTIONS = [0, 5, 10, 15, 20, 25];

export type AiSupportId = 'descriptions' | 'social' | 'translate' | 'reviews' | 'packages' | 'photos';
export const AI_SUPPORT_OPTIONS: AiSupportId[] = ['descriptions', 'social', 'translate', 'reviews', 'packages', 'photos'];

/** The 7 channels from the team lead's "Partners Assessment" sheet (A–G). */
export type DigitalChannelId = 'website' | 'landing' | 'gmaps' | 'meta' | 'tiktok' | 'shopee' | 'other';
export const DIGITAL_CHANNELS: { id: DigitalChannelId; letter: string }[] = [
  { id: 'website', letter: 'A' },
  { id: 'landing', letter: 'B' },
  { id: 'gmaps', letter: 'C' },
  { id: 'meta', letter: 'D' },
  { id: 'tiktok', letter: 'E' },
  { id: 'shopee', letter: 'F' },
  { id: 'other', letter: 'G' }
];

/** Columns of the sheet: professionally managed · on-off, not focused · need help. */
export type DigitalStatus = 'managed' | 'onoff' | 'help';
export const DIGITAL_STATUSES: DigitalStatus[] = ['managed', 'onoff', 'help'];

export interface PartnerBusinessProfile {
  type?: BusinessType;
  subtypes: string[];
  facilities: string[];
  products: string[];
  /** % discount for KOSSI Adventure travelers */
  discount?: number;
  aiSupport: AiSupportId[];
  digital: Partial<Record<DigitalChannelId, DigitalStatus>>;
  /** name of the "other platform" (row G) */
  otherPlatform?: string;
}

export const EMPTY_PROFILE: PartnerBusinessProfile = {
  subtypes: [],
  facilities: [],
  products: [],
  aiSupport: [],
  digital: {}
};

/** How many of the 5 sections (A–E) have an answer. */
export function profileCompleteness(p: PartnerBusinessProfile | undefined): number {
  if (!p) return 0;
  return [
    !!p.type,
    p.products.length > 0,
    p.discount !== undefined,
    p.aiSupport.length > 0,
    Object.keys(p.digital).length > 0
  ].filter(Boolean).length;
}
