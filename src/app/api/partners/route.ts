import { NextResponse, connection } from 'next/server';
import { z } from 'zod';
import { listAll, publishPartner } from '@/lib/server/partnerStore';
import { toPublic, type PublicStatus } from '@/lib/verification';
import { BALI_REGIONS } from '@/data/regions';
import type { CuratedPartner } from '@/data/curatedPartners';

/**
 * Public partner directory.
 * GET  → partners published through the app + the verification status of every partner.
 * POST → a partner publishes their listing (starts as "published", not verified).
 */

export async function GET() {
  await connection(); // always read the latest store, never a build-time snapshot
  const all = await listAll();
  const statuses: Record<string, PublicStatus> = {};
  for (const { partner, record } of all) statuses[partner.id] = toPublic(record);
  const customs = all.filter((p) => !p.builtIn && p.record.status !== 'removed').map((p) => p.partner);
  return NextResponse.json({ customs, statuses }, { headers: { 'Cache-Control': 'no-store' } });
}

const text = (max: number) => z.string().trim().max(max);
const PartnerSchema = z.object({
  id: z.string().regex(/^partner-[\w-]{4,60}$/),
  name: text(80).min(1),
  category: z.enum(['Destination', 'Accommodation', 'Culinary', 'Activity']),
  group: z.enum(['Group A', 'Group B']).default('Group A'),
  location: text(120),
  priceTier: z.enum(['$', '$$', '$$$', '$$$$']),
  familyTags: z.array(text(40)).max(8),
  verifiedFacts: z.array(text(300)).max(12),
  description: text(2000),
  defaultMission: text(400),
  whatsappInquiryNumber: text(30),
  heroImage: z.string().url().max(500),
  shortHighlight: text(200),
  badgeTitle: text(60),
  isNewlyPublished: z.boolean().optional(),
  regionId: z.enum(BALI_REGIONS.map((r) => r.id) as [string, ...string[]]).optional(),
  area: text(60).optional(),
  coords: z.object({ lat: z.number().min(-9.2).max(-7.8), lng: z.number().min(114.3).max(115.8) }).optional()
});

export async function POST(request: Request) {
  const parsed = PartnerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid partner listing.' }, { status: 400 });
  }
  try {
    const stored = await publishPartner({ ...(parsed.data as CuratedPartner), isNewlyPublished: true });
    return NextResponse.json({ partner: stored.partner, status: toPublic(stored.record) });
  } catch (err) {
    if ((err as Error).message === 'store-full') {
      return NextResponse.json({ error: 'The partner directory is full.' }, { status: 507 });
    }
    console.error('[partners] publish failed:', err);
    return NextResponse.json({ error: 'Could not save the listing. Please try again.' }, { status: 500 });
  }
}
