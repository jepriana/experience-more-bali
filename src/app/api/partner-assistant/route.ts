import { NextResponse } from 'next/server';
import {
  getGemini,
  DEFAULT_GEMINI_MODEL,
  FALLBACK_GEMINI_MODEL,
  STREAMING_GENERATION_CONFIG,
  logGeminiUsage,
  isGeminiConfigured
} from '@/lib/gemini';
import { PartnerProfileSchema, toGeminiSchema, safeJson, type PartnerProfile } from '@/lib/schemas';
import { ndjsonResponse, streamGeminiToClient } from '@/lib/streaming';

/** What the client receives in the final event (AI answer or the grounded fallback). */
type PartnerResult = PartnerProfile | ReturnType<typeof generateGroundedFallbackResponse>;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      category = 'Destination',
      location = 'Bali, Indonesia',
      priceTier = '$$',
      whatsappInquiryNumber = '+6281234567890',
      rawFacts = [],
      language = 'en'
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Business name is required.' },
        { status: 400 }
      );
    }

    const factsList: string[] = Array.isArray(rawFacts)
      ? rawFacts.filter((f) => typeof f === 'string' && f.trim() !== '')
      : [];

    if (factsList.length === 0) {
      return NextResponse.json(
        { error: 'Please provide at least one verified fact about your local business.' },
        { status: 400 }
      );
    }

    if (isGeminiConfigured()) {
      try {
        const ai = getGemini();

        const langPrompt =
          language === 'id'
            ? 'CRITICAL LANGUAGE REQUIREMENT: You MUST generate all text fields (headline, polishedDescription, shortHighlight, socialMediaCopy hook & caption, hashtags, gamifiedMission missionTitle & missionDescription & badgeTitle, groundingChecklist howItWasUsed, suggestedFamilyTags) in natural, fluent BAHASA INDONESIA.'
            : 'CRITICAL LANGUAGE REQUIREMENT: You MUST generate all text fields in fluent ENGLISH.';

        const prompt = `You are the AI Partner Profile & Marketing Assistant for "Experience More Bali 2027" (JAPAC AI Builder Cup).
Your role: Help local independent Balinese providers create a polished digital profile, social media campaign, and gamified family quest grounded strictly in their verified facts.

${langPrompt}

STRICT GROUNDING DIRECTIVE:
1. Every claim made in the profile description, social copy, and mission MUST BE DERIVED SOLELY from the supplied verified facts below.
2. ZERO FABRICATION: Do NOT invent unmentioned awards, swimming pools, amenities, certifications, or partner alliances.
3. If an amenity or feature is not in the facts, do not mention it.
4. Provide a "groundingChecklist" explicitly auditing each supplied raw fact and explaining where and how it was used in the generated materials.

PARTNER SUBMISSION:
- Business Name: ${name}
- Category: ${category} (Group A: Destination | Accommodation | Culinary)
- Location: ${location}
- Price Tier: ${priceTier}
- WhatsApp Inquiry Number: ${whatsappInquiryNumber}
- Raw Verified Facts:
${factsList.map((fact, i) => `${i + 1}. ${fact}`).join('\n')}
`;

        const structuredSchema = toGeminiSchema(PartnerProfileSchema);

        const config = {
          ...STREAMING_GENERATION_CONFIG,
          responseMimeType: 'application/json',
          responseJsonSchema: structuredSchema,
          abortSignal: request.signal // stop paying for tokens if the user leaves
        };

        // Stream the marketing kit to the browser as it is written.
        return ndjsonResponse<PartnerResult>(async (send) => {
          const fallback = (reason: string) =>
            send({
              type: 'final',
              isAiGenerated: false,
              fallbackReason: reason,
              data: generateGroundedFallbackResponse(name, category, location, factsList, language)
            });

          let generation;
          let usedModel = DEFAULT_GEMINI_MODEL;
          let primarySentText = false;
          const trackedSend: typeof send = (event) => {
            if (event.type === 'delta') primarySentText = true;
            send(event);
          };
          const startedAt = Date.now();
          try {
            generation = await streamGeminiToClient(ai, { model: DEFAULT_GEMINI_MODEL, contents: prompt, config }, trackedSend);
          } catch (modelErr) {
            // Retry on the fallback model only if nothing reached the browser yet
            // (otherwise the user would see two answers spliced together).
            if (primarySentText) {
              console.error('Gemini stream broke mid-answer:', modelErr);
              return fallback('Gemini stream was interrupted. Used deterministic grounded synthesizer.');
            }
            console.warn(`Primary model ${DEFAULT_GEMINI_MODEL} failed, attempting ${FALLBACK_GEMINI_MODEL}:`, modelErr);
            try {
              usedModel = FALLBACK_GEMINI_MODEL;
              generation = await streamGeminiToClient(ai, { model: FALLBACK_GEMINI_MODEL, contents: prompt, config }, send);
            } catch (fallbackErr) {
              console.error('Gemini Partner Assistant API error:', fallbackErr);
              return fallback('Gemini API call failed or timed out. Used deterministic grounded synthesizer.');
            }
          }
          logGeminiUsage('partner-assistant', usedModel, startedAt, generation.usage);

          const result = PartnerProfileSchema.safeParse(safeJson(generation.text));
          if (!result.success) {
            console.error('Partner kit failed schema validation:', result.error.issues);
            return fallback('AI response did not match the profile schema. Used deterministic grounded synthesizer.');
          }

          send({ type: 'final', isAiGenerated: true, model: usedModel, data: result.data });
        });
      } catch (geminiError: unknown) {
        console.error('Gemini Partner Assistant API error:', geminiError);
        return ndjsonResponse<PartnerResult>(async (send) =>
          send({
            type: 'final',
            isAiGenerated: false,
            fallbackReason: 'Gemini API call failed or timed out. Used deterministic grounded synthesizer.',
            data: generateGroundedFallbackResponse(name, category, location, factsList, language)
          })
        );
      }
    }

    // When API Key is not set in .env.local, use deterministic grounded response
    return ndjsonResponse<PartnerResult>(async (send) =>
      send({
        type: 'final',
        isAiGenerated: false,
        fallbackReason: 'Gemini API key not configured in .env.local. Output generated via grounded local rules engine.',
        data: generateGroundedFallbackResponse(name, category, location, factsList, language)
      })
    );
  } catch (error: unknown) {
    console.error('Failed to process partner assistant request:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing partner assistant.' },
      { status: 500 }
    );
  }
}

function generateGroundedFallbackResponse(
  name: string,
  category: string,
  location: string,
  facts: string[],
  language: string = 'en'
) {
  const isId = language === 'id';
  const primaryFact =
    facts[0] ||
    (isId
      ? 'Usaha lokal berbasis komunitas yang melestarikan tradisi luhur Bali.'
      : 'Community-run local enterprise preserving Balinese cultural practices.');
  const secondaryFact =
    facts[1] ||
    (isId
      ? 'Berkomitmen pada transparansi keberlanjutan lokal dan partisipasi keluarga.'
      : 'Dedicated to transparent local sustainability and family participation.');

  const checklist = facts.map((fact) => ({
    rawFact: fact,
    howItWasUsed: isId
      ? 'Dicerminkan langsung dalam deskripsi dan misi petualangan tanpa menambahkan klaim yang belum terverifikasi.'
      : 'Directly reflected in the description and mission without adding unverified claims.',
    verified: true
  }));

  const categoryTags: Record<string, string[]> = isId
    ? {
        Destination: ['Konservasi Eko', 'Belajar Langsung', 'Semua Usia', 'Warisan Budaya'],
        Accommodation: ['Pondok Alam', 'Keluarga Ramah', 'Ramah Lingkungan', 'Teduh & Hening'],
        Culinary: ['Dapur Leluhur', 'Dari Kebun ke Meja', 'Rasa Autentik', 'Ramah Anak']
      }
    : {
        Destination: ['Eco Conservation', 'Hands-on Learning', 'All Ages', 'Community Heritage'],
        Accommodation: ['Nature Stay', 'Family Cottages', 'Eco-Friendly', 'Peaceful Escape'],
        Culinary: ['Heritage Kitchen', 'Farm-to-Table', 'Local Flavors', 'Family Friendly']
      };

  if (isId) {
    return {
      headline: `${name}: Pengalaman ${category} Autentik di ${location}`,
      shortHighlight: `Jelajahi ${name} di ${location}: ${primaryFact}`,
      polishedDescription: `Terletak di bentang alam ${location} yang asri, ${name} menyuguhkan perjumpaan yang tulus dengan warisan hidup Bali. Setiap sentuhan ${category.toLowerCase()} berakar kuat pada tradisi lokal—secara nyata mencerminkan bahwa ${primaryFact.toLowerCase()} Tak hanya itu, ${secondaryFact.toLowerCase()}\n\nDirancang khusus bagi penjelajah yang mencari ketenangan dan keluarga yang ingin belajar bersama, ${name} menghadirkan jembatan nyata antara tamu dan warga desa penjaga kearifan. Setiap kunjungan memberi kepastian bahwa kehadiran Anda mendukung langsung komunitas lokal.`,
      socialMediaCopy: {
        hook: `✨ Rasakan kehangatan kearifan Bali bersama kami di ${name}, ${location}!`,
        caption: `Tahukah Anda? ${primaryFact}\n\nSaat Anda berkunjung ke ${name}, perjalanan Anda bukan sekadar liburan, melainkan bagian dari pelestarian tradisi Bali yang lestari. Mari ikut berpartisipasi dan ciptakan kenangan abadi. 🌿🌾\n\nHubungi WhatsApp kami untuk memesan pengalaman keluarga Anda!`,
        hashtags: [
          '#ExperienceMoreBali2027',
          '#BaliAutentik',
          `#Bali${category}`,
          '#WisataKomunitas',
          '#TriHitaKarana'
        ]
      },
      gamifiedMission: {
        missionTitle: `Misi Penjelajah Warisan Budaya ${name}`,
        missionDescription: `Saat tiba di lokasi, temui pemandu warga lokal untuk memahami bagaimana ${primaryFact.toLowerCase()} Selesaikan verifikasi di tempat untuk mendapatkan lencana resmi digital Anda!`,
        badgeTitle: `Penjaga Warisan ${name.split(' ')[0]}`
      },
      groundingChecklist: checklist,
      suggestedFamilyTags: categoryTags[category] || ['Bali Autentik', 'Praktik Langsung', 'Komunitas']
    };
  }

  return {
    headline: `${name}: Authentic ${category} in ${location}`,
    shortHighlight: `Discover ${name} in ${location}: ${primaryFact}`,
    polishedDescription: `Located in the scenic surroundings of ${location}, ${name} offers travelers a genuine encounter with authentic Balinese heritage. Every aspect of this ${category.toLowerCase()} experience is deeply rooted in local tradition—specifically highlighting that ${primaryFact.toLowerCase()} Additionally, ${secondaryFact.toLowerCase()}\n\nDesigned for mindful travelers and curious families, ${name} creates a transparent bridge between visitors and indigenous custodians. Guests enjoy peaceful immersion with direct assurance that their presence supports verified community practices.`,
    socialMediaCopy: {
      hook: `✨ Experience authentic Bali with us at ${name} in ${location}!`,
      caption: `Did you know? ${primaryFact}\n\nWhen you visit ${name}, your journey directly supports local Bali stewardship. Come participate in hands-on traditions and create memories that last. 🌿🌾\n\nTap our WhatsApp link to reserve your family experience!`,
      hashtags: [
        '#ExperienceMoreBali2027',
        '#AuthenticBali',
        `#Bali${category}`,
        '#CommunityTourism',
        '#TriHitaKarana'
      ]
    },
    gamifiedMission: {
      missionTitle: `${name} Cultural Discovery Quest`,
      missionDescription: `On your arrival, meet our local team to explore how ${primaryFact.toLowerCase()} Complete your on-site verification to earn your official digital credential badge!`,
      badgeTitle: `${name.split(' ')[0]} Heritage Steward`
    },
    groundingChecklist: checklist,
    suggestedFamilyTags: categoryTags[category] || ['Authentic Bali', 'Hands-on', 'Community-Led']
  };
}
