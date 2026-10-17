import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getGemini, DEFAULT_GEMINI_MODEL, REASONING_STREAM_CONFIG, logGeminiUsage, isGeminiConfigured } from '@/lib/gemini';
import { makeTripPlanSchema, toGeminiSchema, safeJson, type TripPlan } from '@/lib/schemas';
import { ndjsonResponse, streamGeminiToClient } from '@/lib/streaming';
import {
  autoArrange,
  fillUnassigned,
  formatDuration,
  summarizeDay,
  travelMinutes,
  type ArrangedTrip,
  type Stop
} from '@/lib/tripPlanning';
import { BALI_REGIONS, getBaliRegion } from '@/data/regions';

/**
 * POST /api/trip-plan — "Arrange my days".
 * The traveler picked the stops (their basket); the AI decides which day each goes on and why.
 * Streams like the other AI routes; the final answer is validated and repaired so every stop
 * appears exactly once. Without AI (or if the answer is unusable) the instant planner is used.
 */

const RequestSchema = z.object({
  days: z.number().int().min(1).max(10),
  stops: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        name: z.string().min(1).max(120),
        category: z.enum(['Destination', 'Accommodation', 'Culinary', 'Activity']),
        regionId: z.enum(BALI_REGIONS.map((r) => r.id) as [string, ...string[]]),
        area: z.string().max(60).optional(),
        coords: z.object({ lat: z.number().min(-9.2).max(-7.8), lng: z.number().min(114.3).max(115.8) }),
        requiresBoat: z.boolean()
      })
    )
    .min(1)
    .max(30),
  travelerName: z.string().max(60).optional(),
  homeRegion: z.string().max(80).optional(),
  categories: z.array(z.string().max(20)).max(4).optional(),
  pace: z.string().max(60).optional(),
  language: z.enum(['en', 'id']).default('en')
});

export async function POST(request: Request) {
  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid trip request.' }, { status: 400 });
  }
  const { days, travelerName, homeRegion, categories = [], pace, language } = parsed.data;
  const stops = parsed.data.stops as Stop[];
  const isId = language === 'id';

  const fallbackPlan = (): ArrangedTrip => {
    const assignment = autoArrange(stops, days);
    return {
      tripTitle: isId ? 'Petualangan Bali Anda' : 'Your Bali Adventure',
      travelerType: '',
      days: Array.from({ length: days }, (_, d) => {
        const onDay = stops.filter((s) => assignment[s.id] === d);
        const summary = summarizeDay(onDay);
        const regionNames = summary.regions.map((r) => getBaliRegion(r)?.name).join(' & ');
        return {
          title: onDay.length ? regionNames : isId ? 'Hari santai' : 'Free day',
          why: onDay.length
            ? isId
              ? `Tempat-tempat yang berdekatan, sekitar ${formatDuration(summary.travelMinutes)} di jalan.`
              : `Places close to each other, about ${formatDuration(summary.travelMinutes)} on the road.`
            : isId
              ? 'Waktu bebas untuk beristirahat atau kembali ke tempat favorit.'
              : 'Free time to rest or revisit a favourite spot.',
          stopIds: summary.route.map((s) => s.id)
        };
      }),
      tips: []
    };
  };

  if (!isGeminiConfigured()) {
    return ndjsonResponse<ArrangedTrip>(async (send) =>
      send({
        type: 'final',
        isAiGenerated: false,
        fallbackReason: 'Gemini API key not configured. Arranged by the instant planner.',
        data: fallbackPlan()
      })
    );
  }

  const ids = stops.map((s) => s.id);
  const TripSchema = makeTripPlanSchema(ids, days);

  // Give the model real driving estimates instead of making it guess Bali geography.
  const stopLines = stops
    .map(
      (s) =>
        `- id=${s.id} | ${s.name} | ${s.category} | ${getBaliRegion(s.regionId)?.name}${s.area ? ` (${s.area})` : ''}${s.requiresBoat ? ' | island, boat needed' : ''}`
    )
    .join('\n');
  const nearest = stops
    .map((s) => {
      const others = stops
        .filter((o) => o.id !== s.id)
        .map((o) => ({ o, m: travelMinutes(s, o) }))
        .sort((a, b) => a.m - b.m)
        .slice(0, 3)
        .map(({ o, m }) => `${o.id} ${formatDuration(m)}`)
        .join(', ');
      return `- ${s.id}: ${others}`;
    })
    .join('\n');

  const prompt = `You are the trip planner for "Experience More Bali 2027" (KOSSI Adventure).
The traveler already chose every place they want to visit. Your job: arrange these stops into exactly ${days} day(s).

${isId ? 'Write all text (tripTitle, travelerType, day titles, why, tips) in natural BAHASA INDONESIA.' : 'Write all text in English.'}

RULES
1. Use every stop id exactly once. Use only ids from the list.
2. Put stops that are close together on the same day; keep driving under about 3 hours per day.
3. Accommodation stops go last on their day (that is where they sleep).
4. Island stops that need a boat get their own day.
5. Balance the days for the pace "${pace || 'balanced family'}"; a lighter day is fine.
6. travelerType: infer the kind of traveler from their choices — do not ask.

TRAVELER: ${travelerName || 'Traveler'}${homeRegion ? ` from ${homeRegion}` : ''}; interests: ${categories.join(', ') || 'mixed'}

STOPS
${stopLines}

ESTIMATED DRIVING TIME TO THE 3 NEAREST STOPS
${nearest}
`;

  const ai = getGemini();
  return ndjsonResponse<ArrangedTrip>(async (send) => {
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
            ...REASONING_STREAM_CONFIG,
            responseMimeType: 'application/json',
            responseJsonSchema: toGeminiSchema(TripSchema),
            abortSignal: request.signal
          }
        },
        send
      );
    } catch (err) {
      console.error('Trip plan stream failed:', err);
      return fallback('Gemini call failed. Arranged by the instant planner.');
    }
    logGeminiUsage('trip-plan', DEFAULT_GEMINI_MODEL, startedAt, generation.usage);

    const result = TripSchema.safeParse(safeJson(generation.text));
    if (!result.success) {
      console.warn('Trip plan failed schema validation:', result.error.issues);
      return fallback('AI answer did not match the plan format. Arranged by the instant planner.');
    }

    const aiPlan = repairPlan(result.data, stops, days);

    // Trust but verify: if the AI's days need far more driving than the instant planner's,
    // the traveler gets the better plan (honestly labelled) instead of a long day in the car.
    const aiMinutes = totalTravelMinutes(aiPlan, stops);
    const instantMinutes = totalTravelMinutes(fallbackPlan(), stops);
    if (aiMinutes > instantMinutes * 1.5 + 60) {
      console.warn(`AI plan rejected: ${aiMinutes} min on the road vs ${instantMinutes} min for the instant plan`);
      return fallback(
        `AI plan needed ${formatDuration(aiMinutes)} of driving vs ${formatDuration(instantMinutes)}; used the shorter instant plan.`
      );
    }

    send({ type: 'final', isAiGenerated: true, model: DEFAULT_GEMINI_MODEL, data: aiPlan });
  });
}

/** Total estimated time on the road across all days of a plan. */
function totalTravelMinutes(plan: ArrangedTrip, stops: Stop[]): number {
  const byId = new Map(stops.map((s) => [s.id, s]));
  return plan.days.reduce(
    (sum, day) => sum + summarizeDay(day.stopIds.map((id) => byId.get(id)).filter((s): s is Stop => !!s)).travelMinutes,
    0
  );
}

/** Every stop exactly once, exactly `days` days: drop duplicates, place forgotten stops on the nearest day. */
function repairPlan(plan: TripPlan, stops: Stop[], days: number): ArrangedTrip {
  const seen = new Set<string>();
  const assignment: Record<string, number> = {};
  plan.days.forEach((day, d) =>
    day.stopIds.forEach((id) => {
      if (!seen.has(id)) {
        seen.add(id);
        assignment[id] = d;
      }
    })
  );
  const complete = fillUnassigned(stops, assignment, days);
  return {
    tripTitle: plan.tripTitle,
    travelerType: plan.travelerType,
    tips: plan.tips,
    days: Array.from({ length: days }, (_, d) => ({
      title: plan.days[d]?.title ?? '',
      why: plan.days[d]?.why ?? '',
      stopIds: [
        ...(plan.days[d]?.stopIds.filter((id) => complete[id] === d) ?? []),
        ...stops.filter((s) => complete[s.id] === d && !plan.days[d]?.stopIds.includes(s.id)).map((s) => s.id)
      ].filter((id, i, arr) => arr.indexOf(id) === i)
    }))
  };
}
