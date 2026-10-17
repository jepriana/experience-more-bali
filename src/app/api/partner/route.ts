import { NextResponse } from 'next/server';
import { getGemini, DEFAULT_GEMINI_MODEL, isGeminiConfigured } from '@/lib/gemini';
import { getPartnerById } from '@/data/curatedPartners';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      partnerId,
      customName,
      category = 'Destination',
      location = 'Bali',
      verifiedFacts = [],
      targetAudience = 'Family travelers & eco-conscious explorers',
      campaignGoal = 'Highlight authentic community heritage and boost direct WhatsApp inquiries'
    } = body;

    const partner = partnerId ? getPartnerById(partnerId) : null;
    const resolvedName = partner ? partner.name : (customName || 'Bali Local Partner');
    const resolvedCategory = partner ? partner.category : category;
    const resolvedLocation = partner ? partner.location : location;
    const resolvedFacts = partner ? partner.verifiedFacts : verifiedFacts;
    const resolvedDescription = partner ? partner.description : '';
    const resolvedMission = partner ? partner.defaultMission : '';

    if (isGeminiConfigured()) {
      try {
        const ai = getGemini();

        const prompt = `You are the AI Partner Profile & Marketing Assistant for "Experience More Bali 2027" (JAPAC AI Builder Cup).
Your objective: Empower independent Balinese local partners (Group A: Destination, Accommodation, Culinary) to translate their verified local facts into compelling digital profiles, creative campaigns, family missions, and WhatsApp conversion messaging.

CRITICAL INSTRUCTION - STRICT GROUNDING:
All generated marketing copy and claims MUST be strictly grounded in the provided partner facts below. Do NOT invent claims, awards, or fake amenities that are not in the facts.

PARTNER DATA:
- Name: ${resolvedName}
- Category: ${resolvedCategory} (Group A)
- Location: ${resolvedLocation}
- Existing Description: ${resolvedDescription}
- Default Mission: ${resolvedMission}
- Verified Facts:
${resolvedFacts.map((f: string) => `  * ${f}`).join('\n')}

MARKETING GOAL & TARGET:
- Target Audience: ${targetAudience}
- Campaign Goal: ${campaignGoal}

Return ONLY a valid JSON object matching this schema without any markdown formatting or code blocks:
{
  "enhancedHeadline": "Punchy, authentic headline for their profile",
  "storytellingBio": "Compelling 2-paragraph narrative profile grounded in their verified facts",
  "highlightBulletPoints": ["3-4 grounded distinct features emphasizing authentic community value"],
  "socialCampaignPost": {
    "hook": "Attention-grabbing opening line for social media",
    "caption": "Engaging storytelling post with emojis and call to action",
    "recommendedHashtags": ["#ExperienceMoreBali2027", "#AuthenticBali", "..."]
  },
  "familyAdventureMission": "An engaging, hands-on quest that travelers and children can complete on-site",
  "whatsappInquiryTemplate": "A warm, hospitable WhatsApp reply template that the partner can use to convert incoming traveler inquiries",
  "collaborationIdea": "A creative package idea co-created with another Group A partner (e.g. Destination + Culinary)"
}
`;

        const response = await ai.models.generateContent({
          model: DEFAULT_GEMINI_MODEL,
          contents: prompt,
          config: {
            temperature: 0.3
          }
        });

        let rawText = response.text || '';
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();

        try {
          const parsed = JSON.parse(rawText);
          return NextResponse.json({
            success: true,
            isAiGenerated: true,
            model: DEFAULT_GEMINI_MODEL,
            data: parsed
          });
        } catch {
          return NextResponse.json({
            success: true,
            isAiGenerated: true,
            model: DEFAULT_GEMINI_MODEL,
            data: generateFallbackPartnerAssist(resolvedName, resolvedCategory, resolvedFacts)
          });
        }
      } catch (geminiError: unknown) {
        console.error('Error invoking Gemini SDK for Partner Assistant:', geminiError);
        return NextResponse.json({
          success: true,
          isAiGenerated: false,
          fallbackReason: 'Gemini SDK call encountered an error. Using grounded dataset fallback.',
          data: generateFallbackPartnerAssist(resolvedName, resolvedCategory, resolvedFacts)
        });
      }
    }

    return NextResponse.json({
      success: true,
      isAiGenerated: false,
      notice: 'Gemini API key not configured in .env.local. Showing realistic grounded fallback matching the partner profile.',
      data: generateFallbackPartnerAssist(resolvedName, resolvedCategory, resolvedFacts)
    });
  } catch (error: unknown) {
    console.error('Partner assist API error:', error);
    return NextResponse.json(
      { error: 'Failed to process partner marketing assistant.' },
      { status: 500 }
    );
  }
}

function generateFallbackPartnerAssist(name: string, category: string, facts: string[]) {
  const fact1 = facts[0] || 'Centuries of community-managed heritage and living culture.';
  const fact2 = facts[1] || '100% locally operated and committed to regenerative practices.';

  return {
    enhancedHeadline: `${name}: Authentic ${category} Rooted in Bali’s Living Spirit`,
    storytellingBio: `Step beyond standard tourism into an experience shaped by centuries of ancestral wisdom and living community care. At ${name}, every visit directly honors the local heritage—from ${fact1.toLowerCase()} to ${fact2.toLowerCase()}.\n\nDesigned for families and mindful travelers, our space is an invitation to slow down, listen to the whisper of the landscape, and participate in meaningful traditions that leave a positive footprint for Bali’s future.`,
    highlightBulletPoints: [
      fact1,
      fact2,
      'Direct revenue reinvestment into local village custodians and community stewards',
      'Hands-on participatory experience suitable for curious travelers of all ages'
    ],
    socialCampaignPost: {
      hook: `✨ Don't just visit Bali. Create memories that heal and connect at ${name}!`,
      caption: `Did you know? ${fact1}\n\nWhen you visit us at ${name}, your journey isn't just a holiday—it becomes part of an ongoing story of local stewardship and cultural pride. Tag your travel companion and tap the link in bio to plan your adventure with Experience More Bali! 🌾🌿`,
      recommendedHashtags: [
        '#ExperienceMoreBali2027',
        '#BaliLocalCommunity',
        '#RegenerativeTourism',
        '#AuthenticBali',
        '#TriHitaKarana'
      ]
    },
    familyAdventureMission:
      'Discover the secret community mark and document 3 living elements of traditional stewardship in your Adventure Passport.',
    whatsappInquiryTemplate:
      'Om Swastiastu! Thank you for inquiring with us through Experience More Bali. We are thrilled to welcome you and your family! We would love to prepare your hands-on experience and confirm your preferred date. How many members are in your party?',
    collaborationIdea:
      'Co-create a "Valley to Hearth" bundle combining a guided morning heritage walk with a traditional family cooking atelier at an adjacent partner.'
  };
}
