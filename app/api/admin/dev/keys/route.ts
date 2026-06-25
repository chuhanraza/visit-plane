import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/admin/guard'
import { createApiKey, revokeApiKey, API_SCOPES } from '@/lib/admin/apikeys'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  scopes: z.array(z.enum(API_SCOPES)).min(1),
})
const RevokeSchema = z.object({ op: z.literal('revoke'), id: z.string().uuid() })

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json().catch(() => ({}))
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null

  if (body?.op === 'revoke') {
    const parsed = RevokeSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    await revokeApiKey(parsed.data.id)
    await writeAudit({ actor, actorType: 'admin', action: 'apikey.revoke', entityType: 'api_key', entityId: parsed.data.id, metadata: {}, ip })
    return NextResponse.json({ ok: true })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })
  const { row, raw } = await createApiKey(parsed.data.name, parsed.data.scopes, actor)
  await writeAudit({ actor, actorType: 'admin', action: 'apikey.create', entityType: 'api_key', entityId: row.id, metadata: { name: row.name, scopes: row.scopes }, ip })
  // raw is returned ONCE — never stored or logged.
  return NextResponse.json({ ok: true, key: raw, row })
}
