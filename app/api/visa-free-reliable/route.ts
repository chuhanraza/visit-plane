import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getVerifiedVisaFree, type VisaFreeKind } from '@/lib/data/visaFreeVerified'

export const dynamic = 'force-dynamic'

// ─────────────────────────────────────────────────────────────────────────────
// RELIABLE visa-free / visa-on-arrival list for the homepage "No Visa Required"
// section. Two tiers, accuracy first (this is YMYL content):
//
//   1) VERIFIED (preferred) — if the passport has an official-source-curated
//      block in lib/data/visaFreeVerified.ts, we serve that, with provenance
//      (what it was checked against + when). This is how Pakistan shows its real
//      ~20+ destinations rather than 1.
//
//   2) GUARDED FALLBACK — otherwise we derive a conservative list from the live
//      `destinations` table (every row is flagged unverified and many duplicate /
//      contradict). A destination is included ONLY if, for that passport, it has
//      EXACTLY ONE row (any duplicate → conflicting/duplicate set → excluded —
//      this is what removes the false China-for-Pakistan entry), the visa_type
//      clearly means no advance visa, and the cost doesn't contradict that. We
//      never invent or change a stored value — we only decide what to show.
//
// "visa-on-arrival" is reported as its own kind (never relabelled "free"): a VoA
// can carry a fee. Only "visa-free" asserts no-visa entry.
// ─────────────────────────────────────────────────────────────────────────────

export interface ReliableDestination {
  name: string
  kind: VisaFreeKind // 'visa-free' | 'visa-on-arrival'
  days: number | null
}

export interface ReliableVisaFreeResponse {
  passport: string
  count: number
  destinations: ReliableDestination[]
  /** 'official-curated' when served from the verified dataset, else 'guarded-db'. */
  source: 'official-curated' | 'guarded-db'
  /** Provenance, present only for the verified tier. */
  verified: { lastVerified: string; sourceLabel: string; sourceUrl: string } | null
}

const norm = (s: string | null | undefined) => (s || '').toLowerCase().trim()

// Returns the no-advance-visa kind for a CLEARLY visa-free type, else null.
function clearKind(visaType: string | null): VisaFreeKind | null {
  const v = norm(visaType)
  if (
    v.includes('evisa') || v.includes('e-visa') || v.includes('electronic') ||
    v.includes('eta') || v.includes('required') || v.includes('embassy') ||
    v.includes('business') || v.includes('tourist') || v.includes('student') ||
    v.includes('transit') || v.includes('work') || v.includes('employment') ||
    v.includes('residence') || v.includes('online')
  ) return null

  if (v === 'free visa on arrival') return 'visa-on-arrival'
  if (v === 'visa free' || v === 'visa-free' || v === 'no visa' || v.startsWith('visa free')) return 'visa-free'
  return null
}

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

  // ── Tier 1: official-source-curated verified data ──────────────────────────
  const verified = getVerifiedVisaFree(passport)
  if (verified) {
    const response: ReliableVisaFreeResponse = {
      passport,
      count: verified.destinations.length,
      destinations: verified.destinations,
      source: 'official-curated',
      verified: {
        lastVerified: verified.lastVerified,
        sourceLabel: verified.sourceLabel,
        sourceUrl: verified.sourceUrl,
      },
    }
    return NextResponse.json(response)
  }

  // ── Tier 2: conservative guardrail over the live (unverified) table ────────
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data, error } = await supabase
    .from('destinations')
    .select('country_name, visa_type, validity, pricing')
    .ilike('passport_country', passport)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const empty: ReliableVisaFreeResponse = { passport, count: 0, destinations: [], source: 'guarded-db', verified: null }
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
    if (rows.length !== 1) continue // duplicate/conflicting → exclude
    const row = rows[0]
    const kind = clearKind(row.visa_type)
    if (!kind) continue
    if (!costIsFree(row.pricing)) continue
    destinations.push({ name, kind, days: parseDays(row.validity) })
  }

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
    source: 'guarded-db',
    verified: null,
  }
  return NextResponse.json(response)
}
