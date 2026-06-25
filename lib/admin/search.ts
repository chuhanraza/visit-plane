import { getServiceClient } from '@/lib/supabase/admin'

/**
 * Global operator search across leads, orders, content, and partners.
 * Service-role, behind requireAdmin(). Returns a flat, typed result list.
 */

export interface SearchHit {
  type: 'lead' | 'manual_order' | 'evisa_order' | 'content' | 'partner'
  label: string
  sublabel: string
  href: string
}

export async function globalSearch(qRaw: string): Promise<SearchHit[]> {
  const q = qRaw.trim().replace(/[%,]/g, '')
  if (q.length < 2) return []
  const svc = getServiceClient()
  const like = `%${q}%`

  const [leads, manual, evisa, content, partners] = await Promise.all([
    svc.from('email_subscribers').select('id, email, captured_from').ilike('email', like).limit(6),
    svc.from('manual_orders').select('id, order_ref, customer_email, status').or(`order_ref.ilike.${like},customer_email.ilike.${like}`).limit(6),
    svc.from('orders').select('id, order_ref, contact_email, status').or(`order_ref.ilike.${like},contact_email.ilike.${like}`).limit(6),
    svc.from('seo_page_content').select('id, url_slug, title').or(`url_slug.ilike.${like},title.ilike.${like}`).limit(6),
    svc.from('affiliate_partners').select('id, slug, name, type').or(`name.ilike.${like},slug.ilike.${like}`).limit(6),
  ])

  const hits: SearchHit[] = []
  for (const l of (leads.data ?? []) as { id: number; email: string; captured_from: string | null }[])
    hits.push({ type: 'lead', label: l.email, sublabel: `lead · ${l.captured_from ?? 'unknown'}`, href: `/admin/leads?q=${encodeURIComponent(l.email)}` })
  for (const o of (manual.data ?? []) as { id: string; order_ref: string; customer_email: string; status: string }[])
    hits.push({ type: 'manual_order', label: o.order_ref, sublabel: `revenue · ${o.customer_email} · ${o.status}`, href: `/admin/revenue?q=${encodeURIComponent(o.order_ref)}` })
  for (const o of (evisa.data ?? []) as { id: string; order_ref: string; contact_email: string; status: string }[])
    hits.push({ type: 'evisa_order', label: o.order_ref, sublabel: `e-visa · ${o.contact_email} · ${o.status}`, href: `/admin/orders/${o.id}` })
  for (const c of (content.data ?? []) as { id: string; url_slug: string; title: string | null }[])
    hits.push({ type: 'content', label: c.title || c.url_slug, sublabel: `content · /${c.url_slug}`, href: `/admin/content?q=${encodeURIComponent(c.url_slug)}` })
  for (const p of (partners.data ?? []) as { id: string; slug: string; name: string; type: string }[])
    hits.push({ type: 'partner', label: p.name, sublabel: `partner · ${p.type}`, href: `/admin/affiliate-mgmt` })

  return hits
}
