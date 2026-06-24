// ─────────────────────────────────────────────────────────────────────────────
// Render-time, READ-ONLY conflicting-status detection.
//
// Sprint 16 found ~5,319 routes whose duplicate rows disagree about the visa
// status. This helper detects that inconsistency at render time so we can flag
// it honestly to the traveller. It NEVER changes, picks, or asserts a "correct"
// status — it only answers the yes/no question "do this route's own rows
// disagree about the fundamental short-stay entry requirement?".
// ─────────────────────────────────────────────────────────────────────────────

import type { VisaRecord } from '@/app/visa/[passport]/[destination]/VisaPageClient'

// Purpose-based visas that legitimately coexist with a tourism status — excluded
// from the conflict check (a route can be "Visa Free" for tourists yet require a
// work/student visa; that is not a contradiction).
const LONG_STAY_KEYWORDS = [
  'work', 'student', 'residence', 'official', 'diplomatic',
  'working holiday', 'investor', 'immigration', 'employment', 'skilled worker',
]

function visaName(r: VisaRecord): string {
  return (r.visa_type ?? r.type ?? '').toString()
}

function isLongStayOrWork(name: string): boolean {
  const lower = name.toLowerCase()
  return LONG_STAY_KEYWORDS.some((k) => lower.includes(k))
}

export type EntryStatus = 'free' | 'arrival' | 'evisa' | 'required'

function classifyEntryStatus(name: string): EntryStatus | null {
  const v = name.toLowerCase().trim()
  if (!v) return null
  if (/free|no visa|visa not required|visa-free/.test(v)) return 'free'
  if (/arrival/.test(v)) return 'arrival'
  if (/evisa|e-visa|electronic/.test(v)) return 'evisa'
  // Any other tourist/visit/standard visa requires a visa in advance.
  if (/visa|sticker|consulate|embassy|required|tourist|visit/.test(v)) return 'required'
  return null
}

/**
 * Returns true when the route's own rows disagree about the fundamental
 * short-stay entry status (e.g. one row says "Visa Free" while another says
 * "Visa Required" or "eVisa"). Read-only: reads the records already fetched for
 * the page and asserts nothing about which status is correct.
 */
export function hasConflictingStatus(records: VisaRecord[] | null | undefined): boolean {
  if (!records || records.length < 2) return false
  const statuses = new Set<EntryStatus>()
  for (const r of records) {
    const name = visaName(r)
    if (!name || isLongStayOrWork(name)) continue
    const s = classifyEntryStatus(name)
    if (s) statuses.add(s)
  }
  return statuses.size >= 2
}
