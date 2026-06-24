import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function bucketVisa(raw: string): 'free' | 'arrival' | 'required' {
  const v = (raw || '').toLowerCase().trim()
  if (
    v.includes('visa free') || v.includes('visa-free') || v.includes('no visa') ||
    v === 'free' || v.includes('evisa') || v.includes('e-visa') ||
    v.includes('electronic visa') || v.includes('tourist evisa') ||
    v.includes('eta') || v.includes('electronic travel')
  ) return 'free'
  if (v.includes('arrival') || v.includes('on arrival') || v.includes('voa'))
    return 'arrival'
  return 'required'
}

export interface VisaCountry {
  name: string
  processing_time?: string | null
  fee?: string | null
}

export interface VisaMapResponse {
  passport: string
  visa_free: VisaCountry[]
  on_arrival: VisaCountry[]
  required: VisaCountry[]
  stats: {
    free_count: number
    arrival_count: number
    required_count: number
    coverage_percent: number
    total: number
  }
}

export async function GET(req: NextRequest) {
  const passport = req.nextUrl.searchParams.get('passport')
  if (!passport) {
    return NextResponse.json({ error: 'Missing passport query param' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const { data, error } = await supabase
    .from('destinations')
    .select('id, country_name, visa_type, processing_time, pricing')
    .ilike('passport_country', passport)
    .order('id', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data?.length) return NextResponse.json({ error: 'No data found' }, { status: 404 })

  // ── Dedupe by distinct destination country ─────────────────────────────────
  // The destinations table holds multiple rows per (passport → country) pair —
  // one per visa-type variant — so counting raw rows inflated totals well past
  // the ~197 real-world maximum. We collapse to ONE entry per distinct country,
  // keeping the first row by id (lowest-id, deterministic). This is a COUNT/
  // display fix only: each kept entry uses an EXISTING stored visa_type — no
  // visa status, fee, or rule is invented or changed. Rows where variants
  // disagree on visa_type are flagged in visa-data-review.md for human review.
  const seen = new Set<string>()
  const visa_free: VisaCountry[] = []
  const on_arrival: VisaCountry[] = []
  const required: VisaCountry[] = []

  for (const row of data) {
    const key = (row.country_name ?? '').trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)

    const item: VisaCountry = {
      name: row.country_name,
      processing_time: row.processing_time,
      fee: row.pricing,
    }
    const bucket = bucketVisa(row.visa_type ?? '')
    if (bucket === 'free') visa_free.push(item)
    else if (bucket === 'arrival') on_arrival.push(item)
    else required.push(item)
  }

  // Distinct-country total (the count display fix), not raw row count.
  const total = seen.size
  const response: VisaMapResponse = {
    passport,
    visa_free,
    on_arrival,
    required,
    stats: {
      free_count: visa_free.length,
      arrival_count: on_arrival.length,
      required_count: required.length,
      coverage_percent: Math.round(((visa_free.length + on_arrival.length) / total) * 100),
      total,
    },
  }

  return NextResponse.json(response)
}
