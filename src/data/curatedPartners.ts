export type PartnerCategory = 'Destination' | 'Accommodation' | 'Culinary';

export interface CuratedPartner {
  id: string;
  name: string;
  category: PartnerCategory;
  group: 'Group A';
  location: string;
  priceTier: '$' | '$$' | '$$$' | '$$$$';
  familyTags: string[];
  verifiedFacts: string[];
  description: string;
  defaultMission: string;
  whatsappInquiryNumber: string;
  heroImage: string;
  shortHighlight: string;
  badgeTitle: string;
  isNewlyPublished?: boolean;
}

export const CURATED_BALI_PARTNERS: CuratedPartner[] = [
  // ================= DESTINATION (Group A) =================
  {
    id: 'dest-jatiluwih-subak',
    name: 'Jatiluwih Subak Heritage Eco-Center',
    category: 'Destination',
    group: 'Group A',
    location: 'Jatiluwih Village, Tabanan Regency (Central Bali)',
    priceTier: '$$',
    familyTags: ['All Ages', 'Subak Canal Walk', 'UNESCO Heritage', 'Hands-on Rice Farming', 'Stroller-Friendly Paths'],
    verifiedFacts: [
      'UNESCO Cultural Landscape World Heritage inscribed since 2012 covering over 19,500 hectares.',
      'Centuries-old Subak cooperative water management system founded upon the Balinese philosophy of Tri Hita Karana.',
      '100% community-owned local farmers cooperative ensuring 85% of visitor revenue directly supports terrace maintenance and water canals.',
      'Authentic red and black organic heirloom rice grown without synthetic pesticides or chemical fertilizers.'
    ],
    description: 'Immerse your family in the timeless terraced amphitheaters of Jatiluwih. Walk alongside local water masters (Pekaseh) to discover the intricate stone weirs, bamboo water conduits, and organic heirloom rice paddies that have sustained Bali for over a thousand years.',
    defaultMission: 'Locate the sacred stone Subak weir (Pura Ulun Danu) and sketch the 3-tiered bamboo canal distribution with a local water master.',
    whatsappInquiryNumber: '+6281239841021',
    heroImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    shortHighlight: 'UNESCO Subak living cultural heritage & terraced rice fields',
    badgeTitle: 'Subak Water Guardian'
  },
  {
    id: 'dest-taro-firefly-bamboo',
    name: 'Taro Ancient Firefly Sanctuary & Bamboo Forest',
    category: 'Destination',
    group: 'Group A',
    location: 'Taro Village, Tegallalang, Gianyar Regency (Central-East Bali)',
    priceTier: '$',
    familyTags: ['Kid-Friendly', 'Twilight Nature Walk', 'Endemic Wildlife', 'Living Village Heritage', 'Gentle Pace'],
    verifiedFacts: [
      "One of Bali's oldest recorded highland settlements, historically founded by sage Maha Rsi Markandeya in the 8th century.",
      'Protected 12-hectare organic community bamboo grove providing a zero-chemical natural habitat for native Luciolinae fireflies.',
      'Community-led night sanctuary patrols operated by Taro youth conservationists to prevent artificial light pollution.',
      'Home to the sacred albino cattle (Lembu Putih) sanctuary cared for exclusively by hereditary village custodians.'
    ],
    description: 'Step into an enchanting realm where twilight reveals thousands of bioluminescent fireflies dancing through towering indigenous bamboo groves. Led by village youths, this low-impact sanctuary offers children and families an unforgettable encounter with Bali’s natural night wonder.',
    defaultMission: 'Spot 5 luminous fireflies along the protected bamboo forest boardwalk and record their glow rhythm in your adventure field notebook.',
    whatsappInquiryNumber: '+6281237659902',
    heroImage: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1000&q=80',
    shortHighlight: 'Bioluminescent firefly sanctuary in an 8th-century sacred bamboo village',
    badgeTitle: 'Forest Firefly Scout'
  },
  {
    id: 'dest-pemuteran-biorock',
    name: 'Pemuteran Biorock Marine Coral Conservation',
    category: 'Destination',
    group: 'Group A',
    location: 'Pemuteran Bay, Buleleng Regency (Northwest Bali)',
    priceTier: '$$',
    familyTags: ['Kids 6+', 'Marine Science', 'Snorkeling Discovery', 'Coral Adoption', 'Eco Conservation'],
    verifiedFacts: [
      'World’s largest community-managed mineral accretion reef restoration project spanning over 2 hectares across Pemuteran Bay.',
      'Powered by low-voltage solar and grid mineral accretion technology that accelerates stony coral calcification up to 5x faster.',
      'Recipient of the UNDP Equator Prize for community-driven reef rehabilitation led by local Pecalang Laut (traditional marine guardians).',
      'Zero motorized water sports permitted in the bay, preserving calm, safe waters ideal for family reef observation.'
    ],
    description: 'Discover the vibrant underwater living nursery of Pemuteran Bay. Families can learn coral biology directly from local marine guardians, swim over electric reef restoration structures, and participate in a guided juvenile coral transplantation workshop.',
    defaultMission: 'Identify 3 native reef fish species sheltering within the Biorock metal domes and safely anchor a juvenile staghorn coral frag onto the nursery grid.',
    whatsappInquiryNumber: '+6281338102344',
    heroImage: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80',
    shortHighlight: 'World-renowned solar-assisted community coral reef restoration project',
    badgeTitle: 'Pemuteran Coral Defender'
  },

  // ================= ACCOMMODATION (Group A) =================
  {
    id: 'accom-sidemen-bamboo-sanctuary',
    name: 'Sidemen Valley Bamboo Sanctuary & Organic Farm',
    category: 'Accommodation',
    group: 'Group A',
    location: 'Sidemen Valley, Karangasem Regency (East Bali)',
    priceTier: '$$$',
    familyTags: ['Family Cottages', 'River Swimming', 'Endek Weaving Studio', 'Organic Permaculture', 'Peaceful'],
    verifiedFacts: [
      'Constructed entirely from locally harvested Petung bamboo utilizing traditional zero-chemical boron salt curing methods.',
      'Employs 92% local staff from adjacent villages of Telaga Tawang and Tabola, providing fair living wages and hospitality apprenticeships.',
      'Operates on 100% gravity-fed mountain spring water and off-grid solar water heating systems with zero single-use plastics.',
      'Adjacent to a certified regenerative permaculture farm providing 80% of daily breakfast herbs and vegetables.'
    ],
    description: 'Nestled between Mount Agung’s silhouette and the babbling Unda River, this eco-sanctuary offers artisanal bamboo pavilions that blend effortlessly into the hillside. Children can run through organic herb gardens, splash in natural spring-fed pools, and observe traditional songket weavers.',
    defaultMission: 'Harvest fresh lemongrass, wild mint, and roselle from the riverside garden to create a chilled welcome herbal infusion for your family.',
    whatsappInquiryNumber: '+6281246981203',
    heroImage: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1000&q=80',
    shortHighlight: 'Handcrafted bamboo eco-lodge & organic farm overlooking sacred Mt. Agung',
    badgeTitle: 'Bamboo Artisan Steward'
  },
  {
    id: 'accom-munduk-mountain-lodge',
    name: 'Munduk Highlands Coffee & Clove Heritage Lodge',
    category: 'Accommodation',
    group: 'Group A',
    location: 'Munduk Village, Buleleng Regency (North Bali Highlands)',
    priceTier: '$$',
    familyTags: ['Cool Mountain Climate', 'Waterfall Trails', 'Coffee Roasting', 'Multi-Generational', 'Nature Retreat'],
    verifiedFacts: [
      'Restored heritage Dutch-era plantation architecture situated at 950 meters altitude overlooking the North Bali coastal plain.',
      'Certified organic shade-grown Arabica and Robusta coffee farm managed collaboratively by 18 indigenous highland farming families.',
      'On-site solar water preheating and zero-discharge biological greywater reed bed filtration systems.',
      'Direct trailhead access to the Red Coral (Munduk) and Golden Valley waterfalls without requiring motorized transit.'
    ],
    description: 'Perched high amidst fragrant clove orchards, vanilla vines, and mist-veiled coffee hills, Munduk Highlands Lodge provides crisp mountain air and panoramic highland vistas. Experience traditional Balinese high-altitude hospitality with wood-burning fireplaces and sunset terrace views.',
    defaultMission: 'Roast green Arabica coffee beans over an open clay stove with Master Roaster Pak Ketut and grind them in a wooden lesung mortar.',
    whatsappInquiryNumber: '+6281353229871',
    heroImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    shortHighlight: 'High-altitude clove and coffee plantation lodge with direct waterfall access',
    badgeTitle: 'Highland Trailblazer'
  },
  {
    id: 'accom-batukaru-permaculture-retreat',
    name: 'Batu Karu Sacred Forest Permaculture Camp',
    category: 'Accommodation',
    group: 'Group A',
    location: 'Wongaya Gede, Mount Batukaru Foothills, Tabanan (Central-West Bali)',
    priceTier: '$$',
    familyTags: ['Glamping Tents', 'Forest Foraging', 'Bird Watching', 'Star Gazing', 'Eco-Educational'],
    verifiedFacts: [
      'Adjoins the virgin rainforest reserve of Mount Batukaru, Bali’s second highest volcano and primary watershed sanctuary.',
      'Low-impact safari-style canvas lodges built on raised timber platforms to prevent soil compaction and preserve root zones.',
      'Strict light-dark rhythm policy with warm amber guidance lighting to protect nocturnal mountain wildlife and fireflies.',
      'Features an interactive medicinal botanical forest walk cataloging over 60 indigenous Balinese Usada medicinal plants.'
    ],
    description: 'An authentic, deeply grounded eco-retreat nestled against the pristine rainforest slopes of sacred Mount Batukaru. Wake up to bird calls, participate in seed-saving workshops, and dine on vibrant edible flowers and wild ferns gathered directly from the permaculture terraces.',
    defaultMission: 'Identify 3 wild medicinal herbs on the sacred forest edge trail and help plant an endemic tree fern seedling in the community reforestation buffer.',
    whatsappInquiryNumber: '+6281999812455',
    heroImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1000&q=80',
    shortHighlight: 'Cloud forest permaculture retreat on the slopes of sacred Mount Batukaru',
    badgeTitle: 'Rainforest Restorer'
  },

  // ================= CULINARY (Group A) =================
  {
    id: 'culinary-nyuh-kuning-jamu-atelier',
    name: 'Dapur Parahyangan & Traditional Jamu Atelier',
    category: 'Culinary',
    group: 'Group A',
    location: 'Nyuh Kuning Cultural Village, Ubud, Gianyar Regency',
    priceTier: '$',
    familyTags: ['Family Cooking', 'Herbal Medicine Workshop', 'Plant-Based Options', 'Hands-on Cobek Mortar', 'Safe for Kids'],
    verifiedFacts: [
      'Family-run kitchen and heritage herbal apothecary rooted in ancient Balinese Usada (holistic herbal medicine) palm leaf manuscripts (Lontar).',
      'Sources 100% of roots and botanicals directly from smallholder organic farmers in Bangli and Tabanan regencies.',
      'Zero artificial preservatives, MSG, or refined sugars; uses cold-pressed unrefined coconut nectar (Gula Aren) from Karangasem.',
      'Holds weekly intergenerational culinary workshops where elders pass down secret Sambal and Base Genep formulations.'
    ],
    description: 'A warm, open-air pavilion in the arts village of Nyuh Kuning where travelers discover the healing soul of Balinese culinary heritage. Grate fresh turmeric, crush wild galangal with volcanic stone mortars, and brew restorative traditional Jamu wellness elixirs alongside master herbalist Ibu Made.',
    defaultMission: 'Pound fresh turmeric, tamarind, and forest honey in a volcanic stone mortar to brew a bottle of refreshing Jamu Kunyit Asam.',
    whatsappInquiryNumber: '+6281239105432',
    heroImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80',
    shortHighlight: 'Ancient Balinese Usada botanical kitchen & hands-on Jamu elixir brewing',
    badgeTitle: 'Master Jamu Alchemist'
  },
  {
    id: 'culinary-amed-fishermens-cooperative',
    name: "Warung Segara Amed Fishermen's Cooperative Table",
    category: 'Culinary',
    group: 'Group A',
    location: 'Lipah Beach, Amed Coastal Corridor, Karangasem (East Bali)',
    priceTier: '$$',
    familyTags: ['Oceanfront Seating', 'Fresh Catch of the Day', 'Traditional Jukung Boats', 'Coastal Breeze', 'Kid Friendly'],
    verifiedFacts: [
      'Cooperative founded and operated by 24 traditional handline fishermen using sail-powered wooden outrigger boats (Jukung).',
      'Zero net-trawling or dynamite methods; 100% sustainable circle-hook handline fishing preserving deep coastal reef trenches.',
      'Seasoned exclusively with artisanal sea salt produced on-site in traditional coconut tree-trunk evaporating troughs (Palung).',
      'Direct catch-to-grill model ensures maximum freshness with fair boat-price compensation paid straight to fishing households.'
    ],
    description: 'Overlooking the black volcanic sands and crystal waters of Lipah Beach, this coastal cooperative restaurant serves line-caught mahi-mahi, yellowfin tuna, and red snapper grilled over dried coconut husks. Experience the real maritime culture of East Bali with toes in the sand.',
    defaultMission: 'Inspect a traditional wooden Jukung fishing canoe with fisherman Pak Komang and season your grilled snapper with sundried Amed sea salt.',
    whatsappInquiryNumber: '+6281337449012',
    heroImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=1000&q=80',
    shortHighlight: 'Community-run oceanfront grill powered by artisanal salt makers & handline fishermen',
    badgeTitle: 'Ocean Outrigger Navigator'
  },
  {
    id: 'culinary-dukuh-campuhan-kitchen',
    name: 'Dukuh Campuhan Heritage Rice & Fire Kitchen',
    category: 'Culinary',
    group: 'Group A',
    location: 'Dukuh Village, Sidemen Foothills, Karangasem',
    priceTier: '$$',
    familyTags: ['Wood-fired Hearth', 'Heritage Red Rice', 'Farm-to-Table', 'Banana Leaf Cooking', 'Family Friendly'],
    verifiedFacts: [
      'All hot dishes are prepared over open wood-fired mud hearths (Chulha/Keren) fueled solely by fallen coffee and rambutan branches.',
      'Preserves rare Balinese heirloom rice varieties including "Beras Merah Cendana" and black sticky rice steamed in woven bamboo cones.',
      'Zero commercial single-use containers; all food is served on fresh hand-harvested banana leaves and carved coconut shell bowls.',
      'Operates a community seed bank that distributes traditional heirloom grain seeds to 35 local farming families free of charge.'
    ],
    description: 'Set beside a rushing river confluence surrounded by heirloom rice terraces, Dukuh Campuhan honors ancestral wood-fired cooking. Gather around smoke-scented earthen stoves to watch traditional banana leaf steaming, taste slow-braised mountain vegetables, and listen to the folklore of Goddess Dewi Sri.',
    defaultMission: 'Fold your own traditional banana-leaf wrapper (Tum) stuffed with spiced organic mushrooms and steam it over the aromatic wood stove.',
    whatsappInquiryNumber: '+6281236551890',
    heroImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80',
    shortHighlight: 'Wood-fired earthen hearth cooking celebrating ancestral Balinese heirloom grains',
    badgeTitle: 'Dewi Sri Rice Keeper'
  }
];

export function getPartnersByCategory(category?: PartnerCategory): CuratedPartner[] {
  if (!category) return CURATED_BALI_PARTNERS;
  return CURATED_BALI_PARTNERS.filter((partner) => partner.category === category);
}

export function getPartnerById(id: string): CuratedPartner | undefined {
  return CURATED_BALI_PARTNERS.find((partner) => partner.id === id);
}

export function createWhatsAppInquiryUrl(partner: CuratedPartner, travelerMessage?: string): string {
  const cleanPhone = partner.whatsappInquiryNumber.replace(/[^0-9]/g, '');
  const defaultText =
    travelerMessage ||
    `Om Swastiastu ${partner.name}! I am planning my Bali 2027 trip via Experience More Bali. I'm excited about your mission "${partner.defaultMission}" and would love to inquire about availability and family booking details!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultText)}`;
}
