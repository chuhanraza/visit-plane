import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient, getSessionUser } from '@/lib/supabase/server'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * Delete the crew (leader only — enforced by the RLS delete policy on crews).
 * All child rows (members, invites, progress) go via ON DELETE CASCADE.
 */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: crewId } = await ctx.params
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const supabase = await getSupabaseServerClient()
  const { data: deleted, error } = await supabase
    .from('crews')
    .delete()
    .eq('id', crewId)
    .select('id')
  if (error) return NextResponse.json({ error: 'Could not delete crew' }, { status: 500 })
  if (!deleted?.length) return NextResponse.json({ error: 'Only the crew leader can delete a crew' }, { status: 403 })

  await writeAudit({
    actor: `customer:${user.id}`, actorType: 'customer',
    action: 'crew.deleted', entityType: 'crew', entityId: crewId,
    metadata: {},
  })

  return NextResponse.json({ ok: true })
}
