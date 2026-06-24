import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/admin/guard'
import { setSetting } from '@/lib/admin/settings'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const FLAGS = ['payments_enabled', 'email_broadcasts_enabled'] as const
const Schema = z.object({ key: z.enum(FLAGS), value: z.coerce.boolean() })

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = Schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })

  await setSetting(parsed.data.key, parsed.data.value, actor)
  await writeAudit({
    actor, actorType: 'admin', action: 'settings.flag_change',
    entityType: 'setting', entityId: parsed.data.key, metadata: { value: parsed.data.value },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  return NextResponse.json({ ok: true })
}
