'use client'

/**
 * useLocalCurrency — formats USD amounts in the visitor's local currency,
 * client-side, so ISR/edge-cached pages stay cacheable (no per-request geo on
 * the server). Country comes from the existing useUserCountry() hook; rates
 * come from /api/fx (daily, same-origin).
 *
 * format() returns null until (a) the visitor's country maps to a non-USD
 * currency and (b) rates have loaded — callers render nothing in that case,
 * which also keeps server HTML and first client render identical (no
 * hydration mismatch). Amounts are approximate by design: always rendered
 * with a "≈" prefix.
 */
import { useEffect, useState } from 'react'
import { useUserCountry } from '@/hooks/useUserCountry'

// Visitor country (ISO-2) → local currency. Emerging-market coverage first.
const COUNTRY_CURRENCY: Record<string, string> = {
  PK: 'PKR', IN: 'INR', BD: 'BDT', NG: 'NGN', PH: 'PHP', ID: 'IDR',
  VN: 'VND', LK: 'LKR', NP: 'NPR', EG: 'EGP', KE: 'KES', GH: 'GHS',
  ZA: 'ZAR', MA: 'MAD', DZ: 'DZD', TN: 'TND', TR: 'TRY', IR: 'IRR',
  UZ: 'UZS', KZ: 'KZT', AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD',
  OM: 'OMR', BH: 'BHD', JO: 'JOD', MY: 'MYR', TH: 'THB', CN: 'CNY',
  KR: 'KRW', JP: 'JPY', SG: 'SGD', BR: 'BRL', MX: 'MXN', CO: 'COP',
  PE: 'PEN', AR: 'ARS', CL: 'CLP', ET: 'ETB', TZ: 'TZS', UG: 'UGX',
  RW: 'RWF', GB: 'GBP', CA: 'CAD', AU: 'AUD',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR', PT: 'EUR',
  GR: 'EUR', AT: 'EUR', BE: 'EUR', IE: 'EUR', FI: 'EUR',
}

type FxPayload = { base: string; date: string | null; rates: Record<string, number> }

let ratesPromise: Promise<FxPayload | null> | null = null

function loadRates(): Promise<FxPayload | null> {
  // Module-level promise: one /api/fx fetch per page load regardless of how
  // many components use the hook; sessionStorage carries it across pages.
  if (!ratesPromise) {
    ratesPromise = (async () => {
      try {
        const cached = sessionStorage.getItem('vp_fx')
        if (cached) return JSON.parse(cached) as FxPayload
      } catch { /* ignore storage errors */ }
      try {
        const res = await fetch('/api/fx')
        if (!res.ok) return null
        const data = (await res.json()) as FxPayload
        try { sessionStorage.setItem('vp_fx', JSON.stringify(data)) } catch { /* ignore */ }
        return data
      } catch {
        return null
      }
    })()
  }
  return ratesPromise
}

export function useLocalCurrency(): {
  /** "≈ PKR 25,400" for the visitor, or null when USD/unknown/not yet loaded. */
  format: (usd: number) => string | null
  currency: string | null
} {
  const { countryCode } = useUserCountry()
  const [rates, setRates] = useState<Record<string, number> | null>(null)

  const currency = COUNTRY_CURRENCY[countryCode] ?? null

  useEffect(() => {
    if (!currency) return
    let alive = true
    loadRates().then((data) => {
      if (alive && data?.rates) setRates(data.rates)
    })
    return () => { alive = false }
  }, [currency])

  const format = (usd: number): string | null => {
    if (!currency || !rates || !Number.isFinite(usd) || usd <= 0) return null
    const rate = rates[currency.toLowerCase()]
    if (!rate) return null
    try {
      const formatted = new Intl.NumberFormat('en', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
      }).format(usd * rate)
      return `≈ ${formatted}`
    } catch {
      return null
    }
  }

  return { format, currency }
}
