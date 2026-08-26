import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

// Records a human decision on a `destinations` visa_type conflict (visa-data-review.md
// §2 — 5,319 pairs where duplicate rows disagree on visa_type itself). This route
// NEVER edits or deletes any `destinations` row — it only writes to the separate
// destination_conflict_resolutions audit table, so a wrong click can't corrupt live
// visa data. Physical dedupe of the losing rows is a deliberate follow-up, not this.
const ResolveSchema = z.object({
  passport_country: z.string().min(1),
  country_name: z.string().min(1),
  decision: z.enum(['kept_row', 'needs_research', 'flagged_corrupt']),
  kept_row_id: z.coerce.number().int().positive().optional(),
  note: z.string().max(2000).optional(),
}).refine(
  (v) => v.decision !== 'kept_row' || v.kept_row_id !== undefined,
  { message: 'kept_row_id is required when decision is kept_row', path: ['kept_row_id'] },
)

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = Object.fromEntries((await req.formData()).entries())
  const parsed = ResolveSchema.safeParse({
    passport_country: formData.passport_country,
    country_name: formData.country_name,
    decision: formData.decision,
    kept_row_id: formData.kept_row_id ? formData.kept_row_id : undefined,
    note: formData.note ? formData.note : undefined,
  })
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { passport_country, country_name, decision, kept_row_id, note } = parsed.data

  // If kept_row_id was supplied, confirm it actually belongs to this pair —
  // prevents an admin (or a malformed request) from pointing the resolution
  // at an unrelated destinations row.
  if (kept_row_id !== undefined) {
    const svc = getServiceClient()
    const { data: row } = await svc
      .from('destinations')
      .select('id')
      .eq('id', kept_row_id)
      .eq('passport_country', passport_country)
      .eq('country_name', country_name)
      .maybeSingle()
    if (!row) {
      return NextResponse.json({ error: 'kept_row_id does not belong to this passport/destination pair' }, { status: 400 })
    }
  }

  const svc = getServiceClient()
  const { error } = await svc
    .from('destination_conflict_resolutions')
    .upsert(
      {
        passport_country,
        country_name,
        decision,
        kept_row_id: kept_row_id ?? null,
        note: note ?? null,
        resolved_by: actor,
        resolved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'passport_country,country_name' },
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({
    actor,
    actorType: 'admin',
    action: 'destination_conflict.resolve',
    entityType: 'destination_conflict',
    entityId: `${passport_country}→${country_name}`,
    metadata: { decision, kept_row_id, note },
  })

  return NextResponse.redirect(
    new URL(`/admin/data-quality/conflicts?resolved=${encodeURIComponent(passport_country + '→' + country_name)}`, req.url),
  )
}
