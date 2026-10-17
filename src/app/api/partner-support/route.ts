import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  getGemini,
  DEFAULT_GEMINI_MODEL,
  STREAMING_GENERATION_CONFIG,
  logGeminiUsage,
  isGeminiConfigured
} from '@/lib/gemini';
import { SupportPlanSchema, toGeminiSchema, safeJson, type SupportPlan } from '@/lib/schemas';
import { ndjsonResponse, streamGeminiToClient } from '@/lib/streaming';
import { helpChannels, instantSupportPlan } from '@/lib/supportPlan';
import {
  AI_SUPPORT_OPTIONS,
  DIGITAL_CHANNELS,
  DIGITAL_STATUSES,
  type PartnerBusinessProfile
} from '@/data/partnerProfile';
import { BALI_REGIONS, getBaliRegion } from '@/data/regions';

/**
 * POST /api/partner-support — the partner's AI support plan.
 * Input is only what they tapped in the business profile (menus A–E); the plan focuses on the
 * channels marked "Need help" and the AI help they picked. Streams like the other AI routes;
 * without AI (or on an unusable answer) the instant plan is returned, honestly labelled.
 */

const short = z.string().trim().max(60);
const ChannelId = z.enum(DIGITAL_CHANNELS.map((c) => c.id) as [string, ...string[]]);

const RequestSchema = z.object({
  businessName: z.string().trim().min(1).max(80),
  regionId: z.enum(BALI_REGIONS.map((r) => r.id) as [string, ...string[]]),
  area: short.optional(),
  profile: z.object({
    type: short.optional(),
    subtypes: z.array(short).max(10).default([]),
    facilities: z.array(short).max(10).default([]),
    products: z.array(short).max(15).default([]),
    discount: z.number().min(0).max(100).optional(),
    aiSupport: z.array(z.enum(AI_SUPPORT_OPTIONS as [string, ...string[]])).max(6).default([]),
    digital: z.partialRecord(ChannelId, z.enum(DIGITAL_STATUSES as [string, ...string[]])).default({}),
    otherPlatform: short.optional()
  }),
  language: z.enum(['en', 'id']).default('en')
});

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid profile.' }, { status: 400 });
  }
  const { businessName, regionId, area, language } = parsed.data;
  const profile = parsed.data.profile as PartnerBusinessProfile;
  const fallbackPlan = () => instantSupportPlan(profile, businessName, language);

  if (!isGeminiConfigured()) {
    return ndjsonResponse<SupportPlan>(async (send) =>
      send({
        type: 'final',
        isAiGenerated: false,
        fallbackReason: 'Gemini API key not configured. Showing the ready-made plan.',
        data: fallbackPlan()
      })
    );
  }

  const statusLabel = { managed: 'well managed', onoff: 'on-off, not focused', help: 'NEEDS HELP' } as const;
  const channelLines = DIGITAL_CHANNELS.map(({ id }) => {
    const status = profile.digital[id];
    const name = id === 'other' && profile.otherPlatform ? `other (${profile.otherPlatform})` : id;
    return `- ${name}: ${status ? statusLabel[status] : 'not used'}`;
  }).join('\n');
  const help = helpChannels(profile);

  const prompt = `You are the digital coach of KOSSI Adventure, helping a small tourism business in Bali.
The owner is not technical. Write a short, practical support plan they can start this week.

${language === 'id' ? 'Write all text in natural, simple BAHASA INDONESIA.' : 'Write all text in simple English.'}

BUSINESS
- Name: ${businessName}
- Location: ${area ? `${area}, ` : ''}${getBaliRegion(regionId)?.name}, Bali
- Type: ${profile.type ?? 'not given'}${profile.subtypes.length ? ` (${profile.subtypes.join(', ')})` : ''}
- Products/services: ${profile.products.join(', ') || 'not given'}
- Facilities: ${profile.facilities.join(', ') || 'not given'}
- Discount for KOSSI travelers: ${profile.discount ? `${profile.discount}%` : 'none'}

DIGITAL CHANNELS TODAY
${channelLines}

AI HELP THEY ASKED FOR: ${profile.aiSupport.join(', ') || 'none'}

RULES
1. One action per channel marked NEEDS HELP (${help.join(', ') || 'none'}), and one per AI help asked for (channel "ai"). Max 6 actions; if there are more, keep the ones with the biggest effect for this type of business.
2. If nothing is marked, suggest the 2 actions that matter most for this type of business.
3. Do not suggest work on channels that are already well managed.
4. Quick wins first. Steps must be concrete and use their real products.
5. Never invent numbers, prices or results.
`;

  const ai = getGemini();
  return ndjsonResponse<SupportPlan>(async (send) => {
    const fallback = (reason: string) => send({ type: 'final', isAiGenerated: false, fallbackReason: reason, data: fallbackPlan() });

    let generation;
    const startedAt = Date.now();
    try {
      generation = await streamGeminiToClient(
        ai,
        {
          model: DEFAULT_GEMINI_MODEL,
          contents: prompt,
          config: {
            ...STREAMING_GENERATION_CONFIG,
            responseMimeType: 'application/json',
            responseJsonSchema: toGeminiSchema(SupportPlanSchema),
            abortSignal: request.signal
          }
        },
        send
      );
    } catch (err) {
      console.error('Partner support stream failed:', err);
      return fallback('Gemini call failed. Showing the ready-made plan.');
    }
    logGeminiUsage('partner-support', DEFAULT_GEMINI_MODEL, startedAt, generation.usage);

    const result = SupportPlanSchema.safeParse(safeJson(generation.text));
    if (!result.success) {
      console.warn('Support plan failed schema validation:', result.error.issues);
      return fallback('AI answer did not match the plan format. Showing the ready-made plan.');
    }
    send({ type: 'final', isAiGenerated: true, model: DEFAULT_GEMINI_MODEL, data: result.data });
  });
}
