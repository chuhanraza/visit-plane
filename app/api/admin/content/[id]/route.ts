import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const Schema = z.object({
  title: z.string().trim().max(200).nullish(),
  meta_description: z.string().trim().max(400).nullish(),
  h1: z.string().trim().max(200).nullish(),
}).refine(b => b.title !== undefined || b.meta_description !== undefined || b.h1 !== undefined, {
  message: 'Provide at least one field to update',
})

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requirePermissionApi('content', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const parsed = Schema.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid body' }, { status: 400 })

  const svc = getServiceClient()
  const { data: before } = await svc.from('seo_page_content').select('id, url_slug, title, meta_description, h1').eq('id', id).maybeSingle()
  if (!before) return NextResponse.json({ error: 'Page not found' }, { status: 404 })

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (parsed.data.title !== undefined) patch.title = parsed.data.title
  if (parsed.data.meta_description !== undefined) patch.meta_description = parsed.data.meta_description
  if (parsed.data.h1 !== undefined) patch.h1 = parsed.data.h1

  const { data: after, error } = await svc.from('seo_page_content').update(patch).eq('id', id)
    .select('id, url_slug, title, meta_description, h1').maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await writeAudit({
    actor, actorType: 'admin', action: 'content.update_meta',
    entityType: 'seo_page', entityId: id,
    metadata: { url_slug: (before as { url_slug: string }).url_slug, before, after },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })
  return NextResponse.json({ ok: true, page: after })
}
