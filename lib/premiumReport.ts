/** Builds the paid Premium Visa Report content from EXISTING visa data (no new/invented facts). */
import { getVisaData } from '@/lib/visa-engine'
import { getOfficialRequirements, type ReqGroup } from '@/lib/data/officialRequirements'
import { getOfficialPortal } from '@/lib/data/officialPortals'
import { getCuratedDestinationFee } from '@/lib/data/destinationFees'

export interface PremiumReport {
  passport: string
  destination: string
  visaType: string
  processingTime: string
  estimatedFee: string
  maxStayDays: number
  leadTimeDays: number
  notes: string | null
  groups: ReqGroup[]
  /** true when transcribed from an official source sheet; false = general guide. */
  officialSourced: boolean
  processNote: string | null
  source: { label: string; url: string } | null
  lastVerified: string | null
  disclaimer: string
}

export function buildPremiumReport(passport: string, destination: string): PremiumReport {
  const v = getVisaData(passport, destination)
  const official = getOfficialRequirements(passport, destination)
  const portal = getOfficialPortal(destination)
  const curatedFee = getCuratedDestinationFee(destination)

  const groups: ReqGroup[] = official
    ? official.groups
    : [
        { tier: 'mandatory', label: 'Required documents', items: v.requiredDocs.map((name) => ({ name })) },
        ...(v.conditionalDocs.length
          ? [{ tier: 'conditional' as const, label: 'Depending on your situation', items: v.conditionalDocs.map((name) => ({ name })) }]
          : []),
      ]

  return {
    passport,
    destination,
    visaType: official?.visaType ?? v.visaLabel,
    processingTime: v.processingDays,
    estimatedFee: curatedFee ?? (v.costUSD == null ? 'No fee / not applicable' : `approx. US$${v.costUSD}`),
    maxStayDays: v.maxStayDays,
    leadTimeDays: v.leadTimeDays,
    notes: v.notes ?? null,
    groups,
    officialSourced: !!official,
    processNote: official?.processNote ?? null,
    source: official ? { label: official.sourceLabel, url: official.sourceUrl } : portal,
    lastVerified: official?.lastVerified ?? null,
    disclaimer:
      'Guidance only, not legal or immigration advice. Visa rules change without notice — always confirm the final requirements and fees on the official source before applying.',
  }
}
