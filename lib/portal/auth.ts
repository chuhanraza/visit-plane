import { redirect } from 'next/navigation'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export interface CustomerRecord {
  id: string
  user_id: string | null
  email: string
  full_name: string | null
  phone: string | null
}

/**
 * Require a signed-in customer for a portal page. Redirects to /portal/login if not
 * authenticated. Returns the auth user + their customers row (RLS-scoped read).
 */
export async function requireCustomer(): Promise<{ userId: string; email: string; customer: CustomerRecord | null }> {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/portal/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, user_id, email, full_name, phone')
    .eq('user_id', user.id)
    .maybeSingle()

  return { userId: user.id, email: user.email ?? '', customer: customer as CustomerRecord | null }
}
