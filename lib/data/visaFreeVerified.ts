// ─────────────────────────────────────────────────────────────────────────────
// World visa-free / visa-on-arrival data for the homepage "No Visa Required"
// section — every passport, sourced and dated (NOT the unverified Supabase table).
//
// WHY: the `destinations` table is flagged `data_confidence = 'unverified'` on
// every row and contains duplicate / self-contradicting entries (e.g. China
// stored as "Visa Free" for a Pakistani passport, which is FALSE). For YMYL
// content we instead drive this section from a maintained, citable dataset.
//
// SOURCE: `visaFreeWorld.json` is compiled from the open Passport Index dataset
// (github.com/ilyankou/passport-index-dataset), itself derived from IATA Timatic
// and official immigration sources. We keep ONLY entries that need no advance
// visa — "visa-free" (a numeric day count or a plain visa-free grant) and
// "visa-on-arrival". e-Visa, ETA, visa-required and "no admission" are excluded.
// Names are mapped to our 197-country system so flags + /visa/<p>/<d> links work.
//
// HONESTY: this is the best-available, dated snapshot — NOT a guarantee. Visa
// rules change frequently and depend on each traveller's situation, so the
// site-wide "reconfirm at the official source before you fly" disclaimer always
// applies. We never assert "100% confirmed". Re-compile periodically and bump
// `LAST_VERIFIED` (see scripts note in the section component / commit history).
// ─────────────────────────────────────────────────────────────────────────────

import worldData from './visaFreeWorld.json'

export type VisaFreeKind = 'visa-free' | 'visa-on-arrival'

export interface VerifiedDestination {
  name: string
  kind: VisaFreeKind
  /** Maximum stay in days, where the source states it. */
  days: number | null
}

export interface VerifiedPassport {
  lastVerified: string
  sourceLabel: string
  sourceUrl: string
  destinations: VerifiedDestination[]
}

const WORLD = worldData as Record<string, VerifiedDestination[]>

const LAST_VERIFIED = '2026-06'
const SOURCE_LABEL = 'Compiled from the Passport Index dataset (IATA-derived)'
const SOURCE_URL = 'https://github.com/ilyankou/passport-index-dataset'

/** Case-insensitive lookup of the sourced visa-free/VoA list for a passport. */
export function getVerifiedVisaFree(passport: string): VerifiedPassport | null {
  if (!passport) return null
  const key = passport.trim().toLowerCase()
  for (const name of Object.keys(WORLD)) {
    if (name.toLowerCase() === key) {
      return {
        lastVerified: LAST_VERIFIED,
        sourceLabel: SOURCE_LABEL,
        sourceUrl: SOURCE_URL,
        destinations: WORLD[name],
      }
    }
  }
  return null
}
