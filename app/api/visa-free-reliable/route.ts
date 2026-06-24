import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────────────────────
// RELIABLE visa-free list for the homepage "No Visa Required" section.
//
// This is a YMYL accuracy guardrail, NOT a styling helper. The destinations
// table is flagged unverified end-to-end (every row data_confidence='unverified')
// and ~26k passport→country pairs carry duplicate rows, ~5.3k of which disagree
// on visa_type (see visa-data-review.md). Showing that raw data as a confident
// "visa-free" list produces real, harmful errors — e.g. China rendered as
// "visa-free" for a Pakistani passport, which is false.
//
// So we surface a destination ONLY when ALL of the following hold for the
// selected passport. We never invent, change, or "correct" a stored value — we
// only DECIDE WHAT TO SHOW, and exclude anything we cannot stand behind:
//
//   1) EXACTLY ONE row exists for that (passport → country) pair. Any duplicate
//      makes the route part of the conflicting/duplicate set from sprint16 /
//      visa-data-review — excluded, even if the duplicates happen to agree
//      (this is precisely what removes the wrong China-for-Pakistan entry).
//   2) That single row's visa_type CLEARLY means no visa is required — plain
//      "Visa Free" or an explicit "Free Visa on Arrival". eVisa, ETA, plain
//      visa-on-arrival, embassy/tourist/business/etc. are all excluded: an eVisa
//      is still a visa, and a plain VoA is not guaranteed free.
//   3) The cost is not self-contradictory — pricing is Free / $0 / absent. A row
//      typed "Visa Free" but priced "$135" is internally inconsistent, so we
//      treat it as ambiguous and leave it out.
//
// Result: FEWER but trustworthy entries. Strong passports keep a healthy list;
// weak passports legitimately show very few (or none), which is the honest
// outcome — the section's empty/thin states handle that gracefully.
// ─────────────────────────────────────────────────────────────────────────────

export interface ReliableDestination {
  name: string
  kind: 'free' | 'arrival'
  days: number | null
}

export interface ReliableVisaFreeResponse {
  passport: string
  count: number
  destinations: ReliableDestination[]
}

const norm = (s: string | null | undefined) => (s || '').toLowerCase().trim()

// Returns the "no visa required" kind for a CLEARLY visa-free type, else null.
function clearKind(visaType: string | null): 'free' | 'arrival' | null {
  const v = norm(visaType)
  // Hard-exclude anything that is actually a visa (electronic or otherwise),
  // a required entry, or an online/transit/category-specific permit.
  if (
    v.includes('evisa') || v.includes('e-visa') || v.includes('electronic') ||
    v.includes('eta') || v.includes('required') || v.includes('embassy') ||
    v.includes('business') || v.includes('tourist') || v.includes('student') ||
    v.includes('transit') || v.includes('work') || v.includes('employment') ||
    v.includes('residence') || v.includes('online')
  ) return null

  if (v === 'free visa on arrival') return 'arrival'
  if (v === 'visa free' || v === 'visa-free' || v === 'no visa' || v.startsWith('visa free')) return 'free'
  return null
}

// Cost must not contradict a "free entry" claim.
function costIsFree(pricing: string | null): boolean {
  const v = norm(pricing)
  return v === '' || v === 'free' || v === '$0' || v === '0' || v === 'n/a' || v === 'none'
}

function parseDays(validity: string | null): number | null {
  if (!validity) return null
  const m = validity.match(/\d+/)
  if (!m) return null
  const n = parseInt(m[0], 10)
  return Number.isFinite(n) && n > 0 && n <= 366 ? n : null
}

export async function GET(req: NextRequest) {
  const passport = req.nextUrl.searchParams.get('passport')?.trim()
  if (!passport) {
    return NextResponse.json({ error: 'Missing passport query param' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data, error } = await supabase
    .from('destinations')
    .select('country_name, visa_type, validity, pricing')
    .ilike('passport_country', passport)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const empty: ReliableVisaFreeResponse = { passport, count: 0, destinations: [] }
  if (!data?.length) return NextResponse.json(empty)

  // Group every row by distinct destination country (case-insensitive).
  const byCountry = new Map<string, { name: string; rows: typeof data }>()
  for (const row of data) {
    const name = (row.country_name ?? '').trim()
    if (!name) continue
    const key = name.toLowerCase()
    const bucket = byCountry.get(key)
    if (bucket) bucket.rows.push(row)
    else byCountry.set(key, { name, rows: [row] })
  }

  const destinations: ReliableDestination[] = []
  for (const { name, rows } of byCountry.values()) {
    // Guardrail 1: any duplicate → part of the conflicting/duplicate set → exclude.
    if (rows.length !== 1) continue
    const row = rows[0]
    // Guardrail 2: visa_type must clearly mean "no visa required".
    const kind = clearKind(row.visa_type)
    if (!kind) continue
    // Guardrail 3: cost must not contradict the free-entry claim.
    if (!costIsFree(row.pricing)) continue

    destinations.push({ name, kind, days: parseDays(row.validity) })
  }

  // Longest free stay first (where known), then alphabetical. Cap for the carousel.
  destinations.sort((a, b) => {
    const da = a.days ?? -1
    const db = b.days ?? -1
    if (db !== da) return db - da
    return a.name.localeCompare(b.name)
  })

  const response: ReliableVisaFreeResponse = {
    passport,
    count: destinations.length,
    destinations: destinations.slice(0, 24),
  }
  return NextResponse.json(response)
}
