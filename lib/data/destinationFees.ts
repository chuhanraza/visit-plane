// ── Single source of truth for curated destination visa fees ──────────────────
// The /destinations grid already stores a curated fee per destination in
// app/destinations/data.ts (field `fee_usd`). The visa detail page reads its fee
// from Supabase, which is often empty for a route. To guarantee the hero card,
// the apply steps and the destinations card never show CONTRADICTING numbers,
// the visa page falls back to this same curated value when Supabase has none.
//
// Returned strings are already display-ready (e.g. "$90", "$36", "Free").

import { ALL_COUNTRIES } from '@/app/destinations/data'

// Build a lookup keyed on the destination name + its known aliases.
const FEE_LOOKUP: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const c of ALL_COUNTRIES) {
    const fee = (c.fee_usd ?? '').trim()
    if (!fee || fee === '—') continue
    map.set(c.name.trim().toLowerCase(), fee)
    for (const alias of c.alt ?? []) {
      const a = (alias ?? '').trim().toLowerCase()
      if (a && !map.has(a)) map.set(a, fee)
    }
  }
  return map
})()

/**
 * Returns the curated display fee for a destination (e.g. "$90"), or null when
 * none is curated. Always read this as a FALLBACK after the route's own data.
 */
export function getCuratedDestinationFee(destinationName: string): string | null {
  if (!destinationName) return null
  return FEE_LOOKUP.get(destinationName.trim().toLowerCase()) ?? null
}
