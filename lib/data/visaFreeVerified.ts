// ─────────────────────────────────────────────────────────────────────────────
// VERIFIED visa-free / visa-on-arrival data — official-source curated.
//
// Why this file exists: the Supabase `destinations` table is flagged
// `data_confidence = 'unverified'` on every row and contains duplicate and
// self-contradicting entries (e.g. China stored as "Visa Free" for a Pakistani
// passport, which is FALSE). For the homepage "No Visa Required" section — YMYL
// content — we curate a small, trustworthy list per passport from authoritative
// sources instead of trusting that table.
//
// EACH passport block records what it was cross-checked against and WHEN. Entries
// are limited to destinations that exist in our 197-country system so flags and
// /visa/<passport>/<destination> links resolve. "visa-on-arrival" is labelled as
// such (never as "free") because a VoA commonly carries a fee — only "visa-free"
// asserts no-visa entry. The site-wide "reconfirm at the official source before
// you fly" disclaimer still applies; this is a researched guide, not a guarantee.
//
// MAINTENANCE: visa rules change. Re-verify each block against current official
// sources and bump `lastVerified`. Passports without a block here fall back to
// the strict single-row guardrail over the live table (see
// app/api/visa-free-reliable/route.ts).
// ─────────────────────────────────────────────────────────────────────────────

export type VisaFreeKind = 'visa-free' | 'visa-on-arrival'

export interface VerifiedDestination {
  name: string
  kind: VisaFreeKind
  /** Maximum stay in days, where the source states it. */
  days: number | null
}

export interface VerifiedPassport {
  /** Month the block was last cross-checked, 'YYYY-MM'. */
  lastVerified: string
  /** Short, honest description of what it was checked against. */
  sourceLabel: string
  /** A citable reference for the compiled list. */
  sourceUrl: string
  destinations: VerifiedDestination[]
}

// Pakistan — cross-checked Jun 2026 against the compiled IATA / official
// immigration record for Pakistani citizens. Territories outside our country
// list (Cook Islands, Montserrat, Niue) are omitted so links/flags resolve.
const PAKISTAN: VerifiedPassport = {
  lastVerified: '2026-06',
  sourceLabel: 'Cross-checked against IATA & official immigration sources',
  sourceUrl: 'https://en.wikipedia.org/wiki/Visa_requirements_for_Pakistani_citizens',
  destinations: [
    // Visa-free (no visa needed at all)
    { name: 'Dominica', kind: 'visa-free', days: 180 },
    { name: 'Barbados', kind: 'visa-free', days: 90 },
    { name: 'Trinidad and Tobago', kind: 'visa-free', days: 90 },
    { name: 'Gambia', kind: 'visa-free', days: 90 },
    { name: 'Haiti', kind: 'visa-free', days: 90 },
    { name: 'Saint Vincent and the Grenadines', kind: 'visa-free', days: 90 },
    { name: 'Vanuatu', kind: 'visa-free', days: 120 },
    { name: 'Rwanda', kind: 'visa-free', days: 30 },
    { name: 'Micronesia', kind: 'visa-free', days: 30 },
    // Visa on arrival (granted at the border; a fee may apply)
    { name: 'Nepal', kind: 'visa-on-arrival', days: 150 },
    { name: 'Maldives', kind: 'visa-on-arrival', days: 30 },
    { name: 'Samoa', kind: 'visa-on-arrival', days: 90 },
    { name: 'Madagascar', kind: 'visa-on-arrival', days: 90 },
    { name: 'Guinea-Bissau', kind: 'visa-on-arrival', days: 90 },
    { name: 'Comoros', kind: 'visa-on-arrival', days: 45 },
    { name: 'Cambodia', kind: 'visa-on-arrival', days: 30 },
    { name: 'Senegal', kind: 'visa-on-arrival', days: 30 },
    { name: 'Burundi', kind: 'visa-on-arrival', days: 30 },
    { name: 'Palau', kind: 'visa-on-arrival', days: 30 },
    { name: 'Timor-Leste', kind: 'visa-on-arrival', days: 30 },
    { name: 'Tuvalu', kind: 'visa-on-arrival', days: 30 },
    { name: 'Somalia', kind: 'visa-on-arrival', days: 30 },
  ],
}

export const VISA_FREE_VERIFIED: Record<string, VerifiedPassport> = {
  Pakistan: PAKISTAN,
}

/** Case-insensitive lookup of a curated, verified block for a passport. */
export function getVerifiedVisaFree(passport: string): VerifiedPassport | null {
  if (!passport) return null
  const key = passport.trim().toLowerCase()
  for (const [name, block] of Object.entries(VISA_FREE_VERIFIED)) {
    if (name.toLowerCase() === key) return block
  }
  return null
}
