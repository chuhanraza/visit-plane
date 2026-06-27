import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { setSetting } from '@/lib/admin/settings'
import { EPC_SETTINGS_KEY } from '@/lib/admin/funnel'
import { AFFILIATE_PARTNERS } from '@/src/lib/affiliates'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const VALID = new Set(Object.keys(AFFILIATE_PARTNERS))

/**
 * Save operator-entered earnings-per-click (EPC) estimates per affiliate partner.
 * These power the value-per-visitor ESTIMATE on the Revenue & Funnel view. They
 * are estimates only — they never represent confirmed affiliate revenue.
 */
export async function POST(req: NextRequest) {
  const actor = await requirePermissionApi('revenue', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const parsed = z.object({ epc: z.record(z.string(), z.coerce.number().min(0).max(10000)) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid EPC payload' }, { status: 400 })

  const clean: Record<string, number> = {}
  for (const [k, v] of Object.entries(parsed.data.epc)) {
    if (VALID.has(k) && Number.isFinite(v) && v > 0) clean[k] = Math.round(v * 100) / 100
  }

  await setSetting(EPC_SETTINGS_KEY, clean, actor)
  await writeAudit({
    actor, actorType: 'admin', action: 'funnel.epc.update', entityType: 'app_settings',
    entityId: EPC_SETTINGS_KEY, metadata: clean,
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  return NextResponse.json({ ok: true, epc: clean })
}
