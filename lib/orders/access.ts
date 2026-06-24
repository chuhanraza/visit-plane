import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/admin'
import { getAdminIdentity } from '@/lib/admin/guard'

export interface OrderAccess {
  allowed: boolean
  isAdmin: boolean
  actor: string
  actorType: 'admin' | 'customer'
  userId?: string
  email?: string
}

/**
 * Decide whether the current request may act on `orderId`. Admins (legacy secret or
 * app_admins) always may. Otherwise the signed-in user must own the order (their
 * customers row is the order's customer). Server-side; uses the service client only
 * after establishing identity.
 */
export async function resolveOrderAccess(orderId: string): Promise<OrderAccess> {
  const admin = await getAdminIdentity()
  if (admin.isAdmin) {
    return { allowed: true, isAdmin: true, actor: admin.actor, actorType: 'admin' }
  }

  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { allowed: false, isAdmin: false, actor: 'anonymous', actorType: 'customer' }

  const svc = getServiceClient()
  const { data: order } = await svc
    .from('orders')
    .select('id, customer_id, customers!inner(user_id)')
    .eq('id', orderId)
    .maybeSingle()

  const ownerUserId = (order as { customers?: { user_id?: string } } | null)?.customers?.user_id
  const allowed = !!order && ownerUserId === user.id
  return {
    allowed, isAdmin: false,
    actor: `customer:${user.email ?? user.id}`, actorType: 'customer',
    userId: user.id, email: user.email ?? undefined,
  }
}
