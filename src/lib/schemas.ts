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