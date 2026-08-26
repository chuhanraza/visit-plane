import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requirePermissionApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const Body = z.object({
  action: z.enum(['approve', 'reject']),
  destinationId: z.string().uuid(),
})

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requirePermissionApi('content', 'edit')
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const parsed = Body.safeParse(await req.json().catch(() => ({})))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  const { action, destinationId } = parsed.data

  const svc = getServiceClient()
  const { data: photo } = await svc
    .from('destination_photos')
    .select('id, destination_id, is_active')
    .eq('id', id)
    .maybeSingle()
  if (!photo || (photo as { destination_id: string }).destination_id !== destinationId) {
    return NextResponse.json({ error: 'Photo not found for this destination' }, { status: 404 })
  }

  if (action === 'approve') {
    // Only one live photo per destination — demote any other candidate first.
    await svc
      .from('destination_photos')
      .update({ is_active: false, is_primary: false })
      .eq('destination_id', destinationId)
      .neq('id', id)

    const { error } = await svc
      .from('destination_photos')
      .update({ is_active: true, is_primary: true })
      .eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const wasActive = (photo as { is_active: boolean }).is_active
    if (wasActive) {
      // Unpublish: keep the row (still a candidate) but take it off the blog.
      const { error } = await svc
        .from('destination_photos')
        .update({ is_active: false, is_primary: false })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      // Reject a never-approved candidate: remove it so ingestion can try again.
      const { error } = await svc.from('destination_photos').delete().eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  await writeAudit({
    actor, actorType: 'admin',
    action: `destination_photo_${action}`,
    entityType: 'destination_photo', entityId: id,
    metadata: { destinationId },
    ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
  })

  return NextResponse.json({ ok: true })
}
