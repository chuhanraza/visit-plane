import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { performTransition } from '@/lib/orders/transition'
import { ORDER_STATUSES, type OrderStatus } from '@/lib/orders/lifecycle'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const actor = await requireAdminApi()
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const body = await req.json().catch(() => ({}))
  const to = body.status as OrderStatus
  if (!ORDER_STATUSES.includes(to)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

  try {
    const result = await performTransition({
      orderId: id, toStatus: to, actor, actorType: 'admin',
      note: typeof body.note === 'string' ? body.note.slice(0, 500) : undefined,
      notifyCustomer: body.notify === true,
      ip: req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? null,
    })
    return NextResponse.json(result)
  } catch (e) {
    const msg = (e as Error).message
    if (msg === 'illegal_transition') return NextResponse.json({ error: 'That status change is not allowed from the current state.' }, { status: 422 })
    if (msg === 'order_not_found') return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
