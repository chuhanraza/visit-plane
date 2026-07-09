/**
 * Crew checklist slot seeding + doc_type→slot mapping.
 *
 * Slots are copied per-member at join time (so later service edits never
 * rewrite existing crews). Source: the destination's active `services` row
 * (required_documents jsonb) when one matches, else the generic default set.
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { RequiredDoc } from '@/lib/orders/types'
import type { CrewSlot } from './types'

/** Generic fallback checklist when no service matches the destination. */
export const DEFAULT_SLOTS: CrewSlot[] = [
  { key: 'passport',       label: 'Passport (6+ months valid)' },
  { key: 'photo',          label: 'Passport photo' },
  { key: 'bank_statement', label: 'Bank statement' },
  { key: 'itinerary',      label: 'Travel itinerary / flight booking' },
  { key: 'accommodation',  label: 'Accommodation proof' },
]

const MAX_SLOTS = 12

/**
 * Resolve the checklist for a crew destination. Uses the service client
 * (services are public-read anyway; this also runs inside service-role routes).
 */
export async function resolveSlotsForDestination(
  svc: SupabaseClient,
  destinationIso: string | null,
  destinationName: string,
): Promise<CrewSlot[]> {
  try {
    let query = svc
      .from('services')
      .select('required_documents')
      .eq('active', true)
      .eq('is_test', false)
      .limit(1)
    query = destinationIso
      ? query.eq('country_iso', destinationIso.toUpperCase())
      : query.ilike('country_name', destinationName)

    const { data } = await query.maybeSingle()
    const docs = (data?.required_documents ?? []) as RequiredDoc[]
    const slots = docs
      .filter((d) => d?.key && d?.label)
      .slice(0, MAX_SLOTS)
      .map((d) => ({ key: String(d.key).slice(0, 60), label: String(d.label).slice(0, 120) }))
    return slots.length > 0 ? slots : DEFAULT_SLOTS
  } catch {
    return DEFAULT_SLOTS
  }
}

/**
 * Map an order-document doc_type to a crew slot key. Service-defined slots use
 * the same keys as required_documents, so most map 1:1; the aliases cover the
 * generic fallback checklist.
 */
const DOC_TYPE_ALIASES: Record<string, string> = {
  passport_scan: 'passport',
  passport_copy: 'passport',
  photograph: 'photo',
  passport_photo: 'photo',
  bank: 'bank_statement',
  flight_booking: 'itinerary',
  flight_itinerary: 'itinerary',
  hotel_booking: 'accommodation',
  hotel: 'accommodation',
}

export function docTypeToSlotKey(docType: string): string {
  const t = docType.toLowerCase()
  return DOC_TYPE_ALIASES[t] ?? t
}
