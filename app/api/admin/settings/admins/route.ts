import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/admin/guard'
import { addAdminByEmail, removeAdmin } from '@/lib/admin/admins'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const AddSchema = z.object({ email: z.string().trim().email().max(200), note: z.string().trim().max(200).nullish() })
const RemoveSchema = z.object({ user_id: z.string().uuid() })

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null

  const body = await req.json().catch(() => ({}))
  const op = body?.op === 'remove' ? 'remove' : 'add'

  if (op === 'remove') {
    const parsed = RemoveSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
    const r = await removeAdmin(parsed.data.user_id)
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 })
    await writeAudit({ actor, actorType: 'admin', action: 'admin.remove', entityType: 'app_admin', entityId: parsed.data.user_id, metadata: {}, ip })
    return NextResponse.json({ ok: true })
  }

  const parsed = AddSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const r = await addAdminByEmail(parsed.data.email, parsed.data.note ?? null)
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 })
  await writeAudit({ actor, actorType: 'admin', action: 'admin.add', entityType: 'app_admin', entityId: r.userId, metadata: { email: parsed.data.email }, ip })
  return NextResponse.json({ ok: true, userId: r.userId })
}
