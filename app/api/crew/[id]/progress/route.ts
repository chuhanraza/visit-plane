import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSupabaseServerClient, getSessionUser } from '@/lib/supabase/server'
import { ORDER_BACKED_STATUSES, type SlotStatus } from '@/lib/crew/types'

export const dynamic = 'force-dynamic'

const PatchSchema = z.object({
  slotKey: z.string().min(1).max(60),
  // Members may only self-toggle the manual states; order-backed states
  // (uploaded/approved/rejected) come exclusively from their own order flow.
  status: z.enum(['not_started', 'ready']),
})

/**
 * Toggle the caller's OWN slot status. Runs on the RLS-scoped session client:
 * the update physically cannot touch another member's rows.
 */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: crewId } = await ctx.params
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = PatchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 422 })

  const supabase = await getSupabaseServerClient()

  // Never let a manual toggle clobber an order-backed status.
  const { data: current } = await supabase
    .from('crew_member_progress')
    .select('status')
    .eq('crew_id', crewId)
    .eq('user_id', user.id)
    .eq('slot_key', parsed.data.slotKey)
    .maybeSingle()
  if (!current) return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 })
  if (ORDER_BACKED_STATUSES.includes(current.status as SlotStatus)) {
    return NextResponse.json({ error: 'This item is tracked from your visa application and updates automatically.' }, { status: 409 })
  }

  const { error } = await supabase
    .from('crew_member_progress')
    .update({ status: parsed.data.status })
    .eq('crew_id', crewId)
    .eq('user_id', user.id)
    .eq('slot_key', parsed.data.slotKey)
  if (error) return NextResponse.json({ error: 'Could not update' }, { status: 500 })

  return NextResponse.json({ ok: true })
}
