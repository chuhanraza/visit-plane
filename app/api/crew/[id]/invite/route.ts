import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient, getSessionUser } from '@/lib/supabase/server'
import { getInviteForLeader, rotateInvite } from '@/lib/crew/service'

export const dynamic = 'force-dynamic'

/** Leader check via the caller's own RLS-scoped session (not service role). */
async function requireLeader(crewId: string): Promise<{ userId: string } | null> {
  const user = await getSessionUser()
  if (!user) return null
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from('crew_members')
    .select('role')
    .eq('crew_id', crewId)
    .eq('user_id', user.id)
    .maybeSingle()
  return data?.role === 'leader' ? { userId: user.id } : null
}

/** GET: the leader fetches the share link. Tokens are never readable client-side. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const leader = await requireLeader(id)
  if (!leader) return NextResponse.json({ error: 'Only the crew leader can view the invite link' }, { status: 403 })

  const invite = await getInviteForLeader(id)
  if (!invite) return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
  return NextResponse.json(invite)
}

/** POST: rotate — new token + fresh expiry; all previously shared links die. */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const leader = await requireLeader(id)
  if (!leader) return NextResponse.json({ error: 'Only the crew leader can rotate the invite link' }, { status: 403 })

  const invite = await rotateInvite(id, leader.userId)
  if (!invite) return NextResponse.json({ error: 'Could not rotate the link' }, { status: 500 })
  return NextResponse.json(invite)
}
