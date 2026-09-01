import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

// Writes admin_tags / admin_note on email_subscribers only. Never touches
// confirmed_at, unsubscribed_at, or any other column, and never sends email.
export const dynamic = 'force-dynamic'

const Schema = z.object({
  email: z.string().email(),
  admin_tags: z.string().max(2000).optional().default(''),
  admin_note: z.string().max(4000).optional().default(''),
})

export async function POST(req: NextRequest) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = Object.fromEntries((await req.formData()).entries())
  const parsed = Schema.safeParse(formData)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const { email, admin_tags, admin_note } = parsed.data
  const tags = admin_tags.split(',').map(t => t.trim()).filter(Boolean)

  const svc = getServiceClient()
  const { error } = await svc
    .from('email_subscribers')
    .update({ admin_tags: tags, admin_note: admin_note.trim() || null })
    .eq('email', email)

  if (error) {
    console.error('[subscribers.update]', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  await writeAudit({
    actor, actorType: 'admin', action: 'subscribers.annotate',
    entityType: 'email_subscriber', entityId: email,
    metadata: { admin_tags: tags, admin_note_set: Boolean(admin_note.trim()) },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })

  const redirectTo = req.headers.get('referer') || `/admin/subscribers/${encodeURIComponent(email)}`
  return NextResponse.redirect(redirectTo, { status: 303 })
}
