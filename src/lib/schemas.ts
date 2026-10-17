import { z } from 'zod';

export function makeItinerarySchema(partnerIds: string[]) {
    const PartnerId = z.enum(partnerIds as [string, ...string[]]);

    return z.object({
        title: z.string().describe('Short inspiring journey title'),
        theme: z.string().describe('Theme, e.g. "Highland Culture & Living Reef Guardians"'),
        whyThisFits: z.string().describe('Max 40 words: how this selection fits the travelers preferences and pace'),
        recommendedPartnerIds: z.array(PartnerId).min(1).max(6),
        days: z.array(
            z.object({
                dayNumber: z.number().int().min(1),
                title: z.string(),
                partnerId: PartnerId.describe('id of the partner featured on this day'),
                activityHighlight: z.string().describe("Max 30 words, taken ONLY from that partner's verifiedFacts"),
                familyMission: z.string().describe('Max 25 words: gamified on-site challenge for kids/family'),
                whyChosen: z.string().describe('Max 20 words: why this partner fits this day')
            })
        ).min(1).max(7),
        passportBadgeToEarn: z.string(),
        sustainabilityPledge: z.string()
    });
}

export type Itinerary = z.infer<ReturnType<typeof makeItinerarySchema>>;
export type ItineraryDay = Itinerary['days'][number] & { partnerName: string };
export type ItineraryResponse = Omit<Itinerary, 'days'> & { days: ItineraryDay[] };

export const PartnerProfileSchema = z.object({
    headline: z.string().describe('Punchy, evocative headline grounded in the business facts'),
    polishedDescription: z.string().describe('2 short paragraphs, max 120 words total, using ONLY the supplied facts'),
    shortHighlight: z.string().describe('One sentence, max 20 words, for cards and quick discovery'),
    socialMediaCopy: z.object({
        hook: z.string().describe('Attention-grabbing hook line'),
        caption: z.string().describe('Max 60 words: storytelling body with emojis and a clear call to action'),
        hashtags: z.array(z.string()).min(3).max(8).describe('Must include #ExperienceMoreBali2027')
    }),
    gamifiedMission: z.object({
        missionTitle: z.string(),
        missionDescription: z.string().describe('Max 40 words: interactive challenge travelers can complete on-site'),
        badgeTitle: z.string()
    }),
    groundingChecklist: z.array(
        z.object({
            rawFact: z.string().describe('The original supplied fact, copied verbatim'),
            howItWasUsed: z.string().describe('Max 20 words: where this fact appears in the generated copy')
        })
    ).describe('Exactly one entry per supplied fact'),
    suggestedFamilyTags: z.array(z.string()).min(3).max(5)
});

export type PartnerProfile = z.infer<typeof PartnerProfileSchema>;

export function toGeminiSchema(schema: z.ZodType): Record<string,unknown> {
    const json = z.toJSONSchema(schema) as Record<string,unknown>;
    delete json.$schema;
    return json;
}

export function safeJson(text: string | undefined): unknown {
    try {
        return JSON.parse(text ?? '');
    } catch {
        return undefined;
    }
}
// ───────── Traveler: "Arrange my days" (trip planner) ─────────

/**
 * Built per request: stopIds may only be the traveler's basket items, and there can't be
 * more days than they chose. The server still repairs missing/duplicate stops afterwards.
 */
export function makeTripPlanSchema(stopIds: string[], days: number) {
  const StopId = z.enum(stopIds as [string, ...string[]]);
  return z.object({
    tripTitle: z.string().describe('Inspiring trip title, max 8 words'),
    travelerType: z
      .string()
      .describe('Short label for this traveler inferred from their choices, e.g. "Nature-loving family explorer". Max 6 words'),
    days: z
      .array(
        z.object({
          title: z.string().describe('Theme of the day, max 6 words'),
          stopIds: z.array(StopId).describe('Stops for this day, in visiting order'),
          why: z.string().describe('Max 25 words: why these stops belong together today')
        })
      )
      .min(1)
      .max(days),
    tips: z.array(z.string().describe('Practical tip, max 20 words')).max(3)
  });
}

export type TripPlan = z.infer<ReturnType<typeof makeTripPlanSchema>>;

// ───────── Partner: AI support plan (from the "Need help" answers) ─────────

export const SUPPORT_PLAN_CHANNELS = ['website', 'landing', 'gmaps', 'meta', 'tiktok', 'shopee', 'other', 'ai'] as const;

export const SupportPlanSchema = z.object({
  headline: z.string().describe('One encouraging sentence for the business owner, max 18 words'),
  actions: z
    .array(
      z.object({
        channel: z
          .enum(SUPPORT_PLAN_CHANNELS)
          .describe('Which channel this action improves; "ai" for an AI-help request that is not one channel'),
        title: z.string().describe('Action title starting with a verb, max 8 words'),
        why: z.string().describe('Max 20 words: what the business gains'),
        steps: z.array(z.string().describe('One simple step a non-technical owner can do, max 16 words')).min(2).max(4),
        effort: z.enum(['quick', 'medium', 'project']).describe('quick = under 1 hour, medium = half a day, project = needs help'),
        kossiHelp: z.string().describe('Max 18 words: how KOSSI Adventure or its AI tools help with this')
      })
    )
    .min(1)
    .max(6),
  firstWeek: z.array(z.string().describe('A concrete task for this week, max 14 words')).min(1).max(3)
});

export type SupportPlan = z.infer<typeof SupportPlanSchema>;
