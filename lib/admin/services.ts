/** Shared service-product parsing/validation for the admin services routes. */

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80)

export interface ServiceValue {
  country_iso: string; country_name: string; visa_type: string; description: string | null
  govt_fee: number; service_fee: number; currency: string
  processing_days_min: number; processing_days_max: number
  required_documents: { key: string; label: string; required: boolean }[]
  active: boolean; is_test: boolean
}

export function parseServiceBody(body: Record<string, unknown>):
  { value: ServiceValue } | { error: string } {
  const country_name = String(body.country_name ?? '').trim()
  const visa_type = String(body.visa_type ?? '').trim()
  if (country_name.length < 2 || visa_type.length < 2) return { error: 'Country and visa type are required' }
  const num = (v: unknown, d = 0) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : d }
  const reqDocs = Array.isArray(body.required_documents)
    ? (body.required_documents as unknown[]).map(d => {
        const o = d as Record<string, unknown>
        return { key: slugify(String(o.key ?? o.label ?? 'doc')), label: String(o.label ?? o.key ?? 'Document').slice(0, 120), required: o.required !== false }
      }).slice(0, 30)
    : []
  return {
    value: {
      country_iso: String(body.country_iso ?? '').toUpperCase().slice(0, 2) || 'XX',
      country_name, visa_type,
      description: body.description ? String(body.description).slice(0, 1000) : null,
      govt_fee: num(body.govt_fee), service_fee: num(body.service_fee),
      currency: String(body.currency ?? 'USD').toUpperCase().slice(0, 3),
      processing_days_min: Math.max(0, parseInt(String(body.processing_days_min ?? 1), 10) || 1),
      processing_days_max: Math.max(1, parseInt(String(body.processing_days_max ?? 30), 10) || 30),
      required_documents: reqDocs,
      active: body.active !== false,
      is_test: body.is_test === true,
    },
  }
}
