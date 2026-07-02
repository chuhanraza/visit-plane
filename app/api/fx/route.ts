/**
 * /api/fx — daily USD-based exchange rates for the currencies our travelers
 * actually think in (PKR, INR, NGN, BDT, PHP, …).
 *
 * Source: fawazahmed0/exchange-api — free, keyless, CDN-served daily rates
 * (https://github.com/fawazahmed0/exchange-api), with its documented fallback
 * host. Served from our own origin so client pages make one same-origin fetch
 * and never depend on a third-party CDN at render time.
 *
 * Response is ISR-cached for 24h; amounts rendered from it must always be
 * presented as approximate ("≈"), consistent with the site's honesty layer.
 */
import { NextResponse } from 'next/server'

export const revalidate = 86400

const PRIMARY  = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.min.json'
const FALLBACK = 'https://latest.currency-api.pages.dev/v1/currencies/usd.min.json'

// Keep the payload small: only currencies we map visitors to (hooks/useLocalCurrency).
const KEEP = [
  'pkr', 'inr', 'bdt', 'ngn', 'php', 'idr', 'vnd', 'lkr', 'npr', 'egp',
  'kes', 'ghs', 'zar', 'mad', 'dzd', 'tnd', 'try', 'irr', 'uzs', 'kzt',
  'aed', 'sar', 'qar', 'kwd', 'omr', 'bhd', 'jod', 'lbp', 'myr', 'thb',
  'cny', 'krw', 'jpy', 'sgd', 'brl', 'mxn', 'cop', 'pen', 'ars', 'clp',
  'etb', 'tzs', 'ugx', 'rwf', 'xof', 'xaf', 'eur', 'gbp', 'cad', 'aud',
] as const

type UsdTable = { date?: string; usd?: Record<string, number> }

async function fetchRates(url: string): Promise<UsdTable | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    return (await res.json()) as UsdTable
  } catch {
    return null
  }
}

export async function GET() {
  const table = (await fetchRates(PRIMARY)) ?? (await fetchRates(FALLBACK))
  if (!table?.usd) {
    return NextResponse.json({ error: 'rates unavailable' }, { status: 503 })
  }

  const rates: Record<string, number> = {}
  for (const c of KEEP) {
    const r = table.usd[c]
    if (typeof r === 'number' && Number.isFinite(r) && r > 0) rates[c] = r
  }

  return NextResponse.json(
    { base: 'usd', date: table.date ?? null, rates },
    { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400' } },
  )
}
