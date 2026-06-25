import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Discount/promo codes over the existing `promo_codes` table (from the e-Visa
 * system). Service-role behind requireAdmin() (revenue:edit).
 */

export interface PromoRow {
  id: string; code: string; description: string | null
  discount_type: 'percent' | 'fixed'; discount_value: number; currency: string
  max_redemptions: number | null; times_redeemed: number; active: boolean
  valid_from: string | null; valid_until: string | null; created_at: string
}

export async function listPromos(): Promise<PromoRow[]> {
  const svc = getServiceClient()
  const { data } = await svc.from('promo_codes')
    .select('id, code, description, discount_type, discount_value, currency, max_redemptions, times_redeemed, active, valid_from, valid_until, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as PromoRow[]
}

export function promoStatus(p: PromoRow): 'active' | 'scheduled' | 'expired' | 'exhausted' | 'inactive' {
  if (!p.active) return 'inactive'
  const now = Date.now()
  if (p.valid_from && new Date(p.valid_from).getTime() > now) return 'scheduled'
  if (p.valid_until && new Date(p.valid_until).getTime() < now) return 'expired'
  if (p.max_redemptions != null && p.times_redeemed >= p.max_redemptions) return 'exhausted'
  return 'active'
}
