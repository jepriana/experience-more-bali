import { NextResponse } from 'next/server';
import { getGemini, DEFAULT_GEMINI_MODEL, REASONING_STREAM_CONFIG, logGeminiUsage, isGeminiConfigured } from '@/lib/gemini';
import { CURATED_BALI_PARTNERS, type CuratedPartner } from '@/data/curatedPartners';
import { makeItinerarySchema, toGeminiSchema, safeJson, type ItineraryResponse } from '@/lib/schemas';
import { ndjsonResponse, streamGeminiToClient } from '@/lib/streaming';

/** What the client receives in the final event (AI answer or the grounded fallback). */
type ItineraryResult = ItineraryResponse | ReturnType<typeof generateFallbackItinerary>;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      travelerStyle = 'Family with children (ages 6 & 10)',
      duration = '3 Days',
      pace = 'Balanced Family Explorer',
      interests = ['Cultural Heritage', 'Nature & Permaculture'],
      customNotes = '',
      language = 'en'
    } = body;

    const sourcePartners: CuratedPartner[] =
      Array.isArray(body.customPartners) && body.customPartners.length > 0
        ? body.customPartners
        : CURATED_BALI_PARTNERS;

    const partnersContext = sourcePartners.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      location: p.location,
      priceTier: p.priceTier,
      familyTags: p.familyTags,
      verifiedFacts: p.verifiedFacts,
      description: p.description,
      defaultMission: p.defaultMission,
      // checked by the KOSSI team (sent by the client from the public directory)
      kossiVerified: (p as CuratedPartner & { kossiVerified?: boolean }).kossiVerified === true
      // whatsappInquiryNumber / badgeTitle intentionally not sent: the model doesn't need them (fewer tokens)
    }));

    const ItinerarySchema = makeItinerarySchema(partnersContext.map((p) => p.id));

    // If Gemini API Key is configured, run live generation with @google/genai
    if (isGeminiConfigured()) {
      try {
        const ai = getGemini();

        const langPrompt =
          language === 'id'
            ? 'CRITICAL LANGUAGE REQUIREMENT: You MUST generate all text fields (title, theme, whyThisFits, day titles, activity highlights, missions, badge name, sustainability pledge) in natural, fluent BAHASA INDONESIA.'
            : 'CRITICAL LANGUAGE REQUIREMENT: You MUST generate all text fields in fluent ENGLISH.';

        const prompt = `You are the AI Experience Finder & Adventure Builder for "Experience More Bali 2027" (JAPAC AI Builder Cup).
Your objective: Connect travelers to verified, authentic local Bali partners (Group A: Destination, Accommodation, Culinary) while turning their itinerary into a collaborative, gamified family adventure.

${langPrompt}

CRITICAL GROUNDING INSTRUCTIONS:
1. Ground all recommendations strictly in the provided CURATED PARTNERS dataset below. Do NOT invent fake hotels, operators, or facts.
2. Select 3-4 best-matching partners across Destination, Accommodation, and Culinary.
3. For each day, include a Gamified Mission for travelers/kids that inspires curiosity and verified achievements.
4. Explain clearly *why each partner fits* the traveler's stated preferences and family pace.
5. Use ONLY partner "id" values from the dataset below. Include one entry in "days" for each day of the trip (${duration}).
6. Partners with "kossiVerified": true were checked in person by the KOSSI team. When two partners fit about equally well, choose the verified one.

TRAVELER PROFILE:
- Style / Composition: ${travelerStyle}
- Duration: ${duration}
- Preferred Pace: ${pace}
- Selected Interests: ${interests.join(', ') || 'Authentic Bali immersion'}
- Additional Notes: ${customNotes || 'None'}

CURATED LOCAL PARTNERS (GROUP A):
${JSON.stringify(partnersContext)}
`;

        // Stream the answer to the browser as it is written (thought summaries first, then JSON pieces).
        return ndjsonResponse<ItineraryResult>(async (send) => {
          const fallback = (reason: string) =>
            send({
              type: 'final',
              isAiGenerated: false,
              fallbackReason: reason,
              data: generateFallbackItinerary(travelerStyle, duration, pace, interests, language)
            });

          let generation;
          const startedAt = Date.now();
          try {
            generation = await streamGeminiToClient(
              ai,
              {
                model: DEFAULT_GEMINI_MODEL,
                contents: prompt,
                config: {
                  ...REASONING_STREAM_CONFIG,
                  responseMimeType: 'application/json',
                  responseJsonSchema: toGeminiSchema(ItinerarySchema),
                  abortSignal: request.signal // stop paying for tokens if the user leaves
                }
              },
              send
            );
          } catch (geminiError) {
            console.error('Error streaming from Gemini:', geminiError);
            return fallback('Gemini SDK call encountered an error. Using grounded dataset fallback.');
          }
          logGeminiUsage('traveler', DEFAULT_GEMINI_MODEL, startedAt, generation.usage);

          // Same grounding guarantees as before, applied to the complete streamed answer.
          const result = ItinerarySchema.safeParse(safeJson(generation.text));
          if (!result.success) {
            console.warn('Itinerary failed schema validation:', result.error.issues);
            return fallback('AI response did not match the itinerary schema. Using grounded dataset fallback.');
          }

          const byId = new Map(partnersContext.map((p) => [p.id, p]));
          send({
            type: 'final',
            isAiGenerated: true,
            model: DEFAULT_GEMINI_MODEL,
            data: {
              ...result.data,
              recommendedPartnerIds: [...new Set(result.data.recommendedPartnerIds)],
              days: result.data.days.map((day, i) => ({
                ...day,
                dayNumber: i + 1,
                partnerName: byId.get(day.partnerId)?.name ?? ''
              }))
            }
          });
        });
      } catch (geminiError: unknown) {
        console.error('Error invoking Gemini SDK:', geminiError);
        return ndjsonResponse<ItineraryResult>(async (send) =>
          send({
            type: 'final',
            isAiGenerated: false,
            fallbackReason: 'Gemini SDK call encountered an error. Using grounded dataset fallback.',
            data: generateFallbackItinerary(travelerStyle, duration, pace, interests, language)
          })
        );
      }
    }

    // When API Key is not yet set in .env.local, provide grounded intelligent mock
    return ndjsonResponse<ItineraryResult>(async (send) =>
      send({
        type: 'final',
        isAiGenerated: false,
        fallbackReason: 'Gemini API key not configured in .env.local. Showing grounded offline demo.',
        data: generateFallbackItinerary(travelerStyle, duration, pace, interests, language)
      })
    );
  } catch (error: unknown) {
    console.error('Traveler match API error:', error);
    return NextResponse.json(
      { error: 'Failed to process traveler adventure match.' },
      { status: 500 }
    );
  }
}

function generateFallbackItinerary(
  travelerStyle: string,
  duration: string,
  pace: string,
  interests: string[],
  language: string = 'en'
) {
  if (language === 'id') {
    return {
      title: 'Jelajah Warisan Hidup & Alam Sakral Bali',
      theme: 'Saluran Subak, Suaka Dataran Tinggi & Tradisi Kuliner Leluhur',
      whyThisFits: `Disesuaikan khusus untuk ${travelerStyle} selama ${duration} dengan ritme ${pace}. Perjalanan ini mengutamakan perjumpaan budaya autentik, pengalaman langsung ramah anak, dan mitra lokal independen yang terverifikasi.`,
      recommendedPartnerIds: [
        'dest-jatiluwih-subak',
        'accom-sidemen-bamboo-sanctuary',
        'culinary-nyuh-kuning-jamu-atelier'
      ],
      days: [
        {
          dayNumber: 1,
          title: 'Tiba di Lembah Sakral & Ramuan Jamu Usada Tradisional',
          partnerId: 'culinary-nyuh-kuning-jamu-atelier',
          partnerName: 'Dapur Parahyangan & Traditional Jamu Atelier',
          activityHighlight:
            'Lokakarya herbal langsung di desa seni Nyuh Kuning. Anak-anak dan orang tua memarut kunyit organik segar dan kencur di atas cobek batu vulkanik.',
          familyMission:
            'Tumbuk kunyit segar, asam jawa, dan madu hutan di cobek batu untuk meracik sebotol Jamu Kunyit Asam penyegar tubuh.',
          whyChosen:
            'Pengalaman kedatangan yang menenangkan dan memperkenalkan keluarga pada kearifan Usada Bali.'
        },
        {
          dayNumber: 2,
          title: 'Saluran Air Subak UNESCO & Hamparan Terasering Jatiluwih',
          partnerId: 'dest-jatiluwih-subak',
          partnerName: 'Jatiluwih Subak Heritage Eco-Center',
          activityHighlight:
            'Menyusuri jalan setapak saluran air bersama Pekaseh lokal dan memahami filosofi Tri Hita Karana dalam pembagian air secara adil.',
          familyMission:
            'Temukan bendungan batu Subak kuno (Pura Ulun Danu) dan gambarlah sketsa sistem bagi air bambu 3 tingkat di Paspor Petualangan Anda.',
          whyChosen:
            'Bentang alam terbuka yang aman untuk anak dan kereta bayi, dengan pengelolaan 100% koperasi petani lokal.'
        },
        {
          dayNumber: 3,
          title: 'Arsitektur Bambu & Senja Lembah Sungai Unda',
          partnerId: 'accom-sidemen-bamboo-sanctuary',
          partnerName: 'Sidemen Valley Bamboo Sanctuary & Organic Farm',
          activityHighlight:
            'Bermalam di paviliun bambu Petung menghadap Gunung Agung. Berenang di kolam mata air alami dan memanen rempah di kebun permakultur.',
          familyMission:
            'Petik serai segar, daun mint liar, dan bunga rosela dari kebun tepi sungai untuk menyeduh teh herbal selamat datang bagi keluarga.',
          whyChosen:
            'Penginapan ramah lingkungan yang mempekerjakan 92% warga desa lokal dengan bebas plastik sekali pakai.'
        }
      ],
      passportBadgeToEarn: 'Penjaga Warisan Tri Hita Karana',
      sustainabilityPledge:
        'Kami berjanji melangkah dengan hormat, menjaga kesucian sumber air, dan mendukung langsung keluarga penyedia wisata lokal Bali.'
    };
  }

  return {
    title: 'Bali Living Heritage & Nature Quest',
    theme: 'Subak Canals, Highland Sanctuaries & Ancestral Culinary Traditions',
    whyThisFits: `Tailored for a ${travelerStyle} on a ${duration} trip at a ${pace} pace. This journey prioritizes authentic cultural encounters, safe hands-on learning for all ages, and verified independent community stewards.`,
    recommendedPartnerIds: [
      'dest-jatiluwih-subak',
      'accom-sidemen-bamboo-sanctuary',
      'culinary-nyuh-kuning-jamu-atelier'
    ],
    days: [
      {
        dayNumber: 1,
        title: 'Arrival in the Sacred Valleys & Traditional Jamu Elixirs',
        partnerId: 'culinary-nyuh-kuning-jamu-atelier',
        partnerName: 'Dapur Parahyangan & Traditional Jamu Atelier',
        activityHighlight:
          'Hands-on herbal apothecary workshop in Nyuh Kuning arts village. Children and parents grate fresh organic turmeric and galangal.',
        familyMission:
          'Pound fresh turmeric, tamarind, and forest honey in a volcanic stone mortar to brew a bottle of refreshing Jamu Kunyit Asam.',
        whyChosen:
          'Gentle sensory arrival experience that immerses the family into ancestral Balinese Usada plant wisdom.'
      },
      {
        dayNumber: 2,
        title: 'UNESCO Subak Water Canals & Terraced Rice Amphitheaters',
        partnerId: 'dest-jatiluwih-subak',
        partnerName: 'Jatiluwih Subak Heritage Eco-Center',
        activityHighlight:
          'Walk the gentle stone canal trails with local Pekaseh water masters and learn how Tri Hita Karana guides community water sharing.',
        familyMission:
          'Locate the sacred stone Subak weir (Pura Ulun Danu) and sketch the 3-tiered bamboo canal distribution in your Adventure Passport.',
        whyChosen:
          'Stroller-friendly, breathtaking outdoor landscape with 100% community-owned cooperative heritage preservation.'
      },
      {
        dayNumber: 3,
        title: 'Bamboo Architecture & Unda River Twilight',
        partnerId: 'accom-sidemen-bamboo-sanctuary',
        partnerName: 'Sidemen Valley Bamboo Sanctuary & Organic Farm',
        activityHighlight:
          'Stay in handcrafted Petung bamboo pavilions overlooking Mount Agung. Swim in gravity-fed spring water pools and explore the permaculture gardens.',
        familyMission:
          'Harvest fresh lemongrass, wild mint, and roselle from the riverside garden to create a chilled welcome herbal infusion for your family.',
        whyChosen:
          'Serene eco-friendly lodging supporting 92% local village staff with zero single-use plastics.'
      }
    ],
    passportBadgeToEarn: 'Tri Hita Karana Heritage Guardian',
    sustainabilityPledge:
      'We pledge to tread gently, honor sacred water temples, and directly support independent Balinese family providers.'
  };
}
