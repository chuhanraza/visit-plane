import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient, getSessionUser } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

/**
 * Leave the crew (self) or remove a member (leader).
 *
 * The membership delete runs on the RLS-scoped session client — the delete
 * policy allows exactly: self-leave (non-leader) or leader-removes-someone-
 * else. Leaders delete the crew instead of leaving. Only AFTER RLS has
 * authorized and performed that delete do we sweep the departed member's
 * status rows with the service client (their own-only delete policy would
 * otherwise leave leader-removed members' ticks visible to the crew).
 */
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string; userId: string }> }) {
  const { id: crewId, userId: targetUserId } = await ctx.params
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const supabase = await getSupabaseServerClient()

  const { data: deleted, error } = await supabase
    .from('crew_members')
    .delete()
    .eq('crew_id', crewId)
    .eq('user_id', targetUserId)
    .select('id')
  if (error) return NextResponse.json({ error: 'Could not remove member' }, { status: 500 })
  if (!deleted?.length) return NextResponse.json({ error: 'Not allowed' }, { status: 403 })

  // Membership is gone (RLS-authorized above) — remove the departed member's
  // status rows so nothing about them remains visible to the crew.
  await getServiceClient()
    .from('crew_member_progress')
    .delete()
    .eq('crew_id', crewId)
    .eq('user_id', targetUserId)

  await writeAudit({
    actor: `customer:${user.id}`, actorType: 'customer',
    action: targetUserId === user.id ? 'crew.member_left' : 'crew.member_removed',
    entityType: 'crew', entityId: crewId,
    metadata: {},
  })

  return NextResponse.json({ ok: true })
}
