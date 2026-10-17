import { NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdmin } from '@/lib/server/adminAuth';
import { applyAdminAction, listAll } from '@/lib/server/partnerStore';
import { CHECK_IDS } from '@/lib/verification';

/** Admin-only: every partner with its full verification record, and batch actions. */

const unauthorized = () => NextResponse.json({ error: 'Please sign in as KOSSI admin.' }, { status: 401 });

export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  return NextResponse.json({ partners: await listAll() }, { headers: { 'Cache-Control': 'no-store' } });
}

const ActionSchema = z
  .object({
    ids: z.array(z.string().max(80)).min(1).max(200),
    action: z.enum(['review', 'verify', 'needs_changes', 'remove', 'restore', 'checklist']),
    by: z.string().trim().min(1).max(60),
    note: z.string().trim().max(500).optional(),
    checklist: z.partialRecord(z.enum(CHECK_IDS as [string, ...string[]]), z.boolean()).optional()
  })
  .refine((v) => v.action !== 'needs_changes' || !!v.note, { message: 'Tell the partner what to change.' })
  .refine((v) => v.action !== 'checklist' || (v.ids.length === 1 && !!v.checklist), { message: 'Checklist is per partner.' });

export async function POST(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  const parsed = ActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid action.' }, { status: 400 });
  }
  const { ids, action, by, note, checklist } = parsed.data;
  const result = await applyAdminAction(ids, action, by, { note, checklist });
  return NextResponse.json({ ...result, partners: await listAll() });
}
