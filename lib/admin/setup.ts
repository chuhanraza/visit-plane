import { getServiceClient } from '@/lib/supabase/admin'
import { getSettings } from '@/lib/admin/settings'

/**
 * Operator setup checklist — a "0→100" guide computed from REAL signals
 * (env presence + table counts + flags). Service-role, behind requireAdmin().
 */

export interface SetupItem { key: string; label: string; done: boolean; hint: string; href: string }

export async function setupChecklist(): Promise<{ items: SetupItem[]; done: number; total: number }> {
  const svc = getServiceClient()
  const env = process.env
  const has = (k: string) => !!(env[k] && String(env[k]).length > 0)

  const [admins, partners, keys, segments, flowsActive, settings] = await Promise.all([
    svc.from('app_admins').select('user_id', { count: 'exact', head: true }),
    svc.from('affiliate_partners').select('id', { count: 'exact', head: true }),
    svc.from('api_keys').select('id', { count: 'exact', head: true }).eq('active', true),
    svc.from('marketing_segments').select('id', { count: 'exact', head: true }),
    svc.from('flows').select('id', { count: 'exact', head: true }).eq('active', true),
    getSettings(),
  ])

  const items: SetupItem[] = [
    { key: 'resend', label: 'Email sending configured (Resend)', done: has('RESEND_API_KEY'), hint: 'Set RESEND_API_KEY in Vercel so transactional + campaign email sends.', href: '/admin/settings' },
    { key: 'admin', label: 'Per-user admin login', done: (admins.count ?? 0) > 0, hint: 'Add yourself under Settings → Admin allowlist (you are currently on the shared secret).', href: '/admin/settings' },
    { key: 'engagement', label: 'Email open/click tracking', done: has('RESEND_WEBHOOK_SECRET'), hint: 'Set RESEND_WEBHOOK_SECRET and point Resend’s webhook at /api/webhooks/resend.', href: '/admin/email' },
    { key: 'cron', label: 'Flows cron secured', done: has('CRON_SECRET'), hint: 'Set CRON_SECRET so the daily flows worker is authenticated.', href: '/admin/marketing' },
    { key: 'partners', label: 'Affiliate partners configured', done: (partners.count ?? 0) > 0, hint: 'Add your real affiliate IDs and partners.', href: '/admin/affiliate-mgmt' },
    { key: 'apikey', label: 'API key for affiliate postbacks', done: (keys.count ?? 0) > 0, hint: 'Create an affiliate:write key in Developers and give partners the postback URL.', href: '/admin/developers' },
    { key: 'segment', label: 'First audience segment', done: (segments.count ?? 0) > 0, hint: 'Build a segment in Marketing to target campaigns.', href: '/admin/marketing' },
    { key: 'flow', label: 'Welcome flow active', done: (flowsActive.count ?? 0) > 0, hint: 'Create + activate a welcome flow in Marketing.', href: '/admin/marketing' },
    { key: 'broadcasts', label: 'Email broadcasts enabled', done: settings.email_broadcasts_enabled === true, hint: 'Flip email_broadcasts_enabled in Settings when ready to send for real.', href: '/admin/settings' },
  ]
  return { items, done: items.filter(i => i.done).length, total: items.length }
}
