/**
 * Visitplane — Internal Linking Algorithm
 *
 * Strategy:
 *  - Every page links to 5 related pages
 *  - Passport authority: pages about same passport link to each other
 *  - Destination hub: pages about same destination link to each other
 *  - Cross-template links: each template links to the equivalent page
 *    on other templates for the same route
 *
 * This builds two topical authority clusters:
 *  1. Passport clusters  (e.g., all Pakistani passport pages)
 *  2. Destination hubs   (e.g., all UAE visa pages)
 */

import { COUNTRIES, BY_ISO3, type Country } from './countries'

// ── Types ─────────────────────────────────────────────────────────────────────

export type InternalLink = {
  href: string
  label: string
  type: 'same-passport' | 'same-destination' | 'cross-template' | 'tool'
  relevanceScore: number  // 0–100, higher = more relevant to show first
}

// ── Popular destinations per region (for contextual suggestions) ──────────────

const POPULAR_BY_REGION: Record<string, string[]> = {
  AS: ['uae', 'saudi-arabia', 'turkey', 'thailand', 'malaysia', 'singapore', 'japan', 'china'],
  EU: ['germany', 'france', 'united-kingdom', 'italy', 'spain', 'netherlands'],
  NA: ['united-states', 'canada'],
  OC: ['australia', 'new-zealand'],
  AF: ['kenya', 'south-africa', 'egypt', 'morocco'],
  SA: ['brazil', 'argentina'],
}

// ── Cross-template links for a given passport+destination ─────────────────────

export function getCrossTemplateLinks(
  passportSlug: string,
  passportNationality: string,
  destinationSlug: string,
  currentTemplate: 1 | 2 | 3 | 4,
): InternalLink[] {
  const links: InternalLink[] = []

  if (currentTemplate !== 1) {
    links.push({
      href: `/visa-requirements-for-${passportNationality}-citizens-to-${destinationSlug}`,
      label: `Visa Requirements (Full Details)`,
      type: 'cross-template',
      relevanceScore: 95,
    })
  }

  if (currentTemplate !== 4) {
    links.push({
      // Non-plural nationality — this is the canonical form the sitemap emits;
      // the plural variant resolves too but self-canonicalises as a duplicate.
      href: `/${destinationSlug}-visa-guide-for-${passportNationality}`,
      label: `${destinationSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Complete Visa Guide`,
      type: 'cross-template',
      relevanceScore: 90,
    })
  }

  if (currentTemplate !== 2) {
    links.push({
      href: `/visa-free-countries-for-${passportNationality}-passport`,
      label: `All Visa-Free Destinations`,
      type: 'cross-template',
      relevanceScore: 80,
    })
  }

  if (currentTemplate !== 3) {
    links.push({
      href: `/cheapest-visas-from-${passportSlug}-passport`,
      label: `Cheapest Visa Destinations`,
      type: 'cross-template',
      relevanceScore: 75,
    })
  }

  return links
}

// ── Related routes for same passport ─────────────────────────────────────────

export function getRelatedPassportLinks(
  passportNationality: string,
  passportContinent: string,
  excludeDestinationSlug: string,
  count = 5,
): InternalLink[] {
  const popularDests = POPULAR_BY_REGION[passportContinent] ?? POPULAR_BY_REGION['AS']

  return popularDests
    .filter(slug => slug !== excludeDestinationSlug)
    .slice(0, count)
    .map((destSlug, i) => {
      const destCountry = COUNTRIES.find(c => c.slug === destSlug)
      return {
        href: `/visa-requirements-for-${passportNationality}-citizens-to-${destSlug}`,
        label: `${destCountry?.flag ?? ''} ${destCountry?.name ?? destSlug} Visa Requirements`,
        type: 'same-passport' as const,
        relevanceScore: 85 - i * 5,
      }
    })
}

// ── Related routes for same destination ───────────────────────────────────────

export function getRelatedDestinationLinks(
  destinationSlug: string,
  destinationName: string,
  excludePassportNationality: string,
  topNationalities: string[] = ['pakistani', 'indian', 'bangladeshi', 'nigerian', 'british', 'american'],
): InternalLink[] {
  return topNationalities
    .filter(nat => nat !== excludePassportNationality)
    .slice(0, 5)
    .map((nat, i) => {
      const ppCountry = COUNTRIES.find(c => c.nationality === nat)
      return {
        href: `/visa-requirements-for-${nat}-citizens-to-${destinationSlug}`,
        label: `${ppCountry?.flag ?? ''} ${ppCountry?.name ?? nat} Citizens → ${destinationName}`,
        type: 'same-destination' as const,
        relevanceScore: 70 - i * 3,
      }
    })
}

// ── Tool links (always included) ──────────────────────────────────────────────

export const TOOL_LINKS: InternalLink[] = [
  { href: '/checklist',        label: '✅ Document Checklist Generator', type: 'tool', relevanceScore: 60 },
  { href: '/embassy-finder',   label: '🏛️ Embassy Finder',              type: 'tool', relevanceScore: 58 },
  { href: '/travel-insurance', label: '🛡️ Travel Insurance',            type: 'tool', relevanceScore: 56 },
  { href: '/cost-calculator',  label: '🧮 Visa Cost Calculator',        type: 'tool', relevanceScore: 54 },
  { href: '/processing-times', label: '⏱️ Processing Times',            type: 'tool', relevanceScore: 52 },
  { href: '/interview-prep',   label: '🎤 Visa Interview Prep',         type: 'tool', relevanceScore: 50 },
  { href: '/compare',          label: '⚖️ Compare Passports',           type: 'tool', relevanceScore: 48 },
  { href: '/visa-free-map',    label: '🗺️ Visa-Free Map',               type: 'tool', relevanceScore: 46 },
]

// ── Master function: get top N links for a page ───────────────────────────────

export function getTopInternalLinks(opts: {
  passportSlug: string
  passportNationality: string
  passportContinent: string
  destinationSlug: string
  destinationName: string
  currentTemplate: 1 | 2 | 3 | 4
  count?: number
}): InternalLink[] {
  const { passportSlug, passportNationality, passportContinent,
          destinationSlug, destinationName, currentTemplate, count = 5 } = opts

  const allLinks = [
    ...getCrossTemplateLinks(passportSlug, passportNationality, destinationSlug, currentTemplate),
    ...getRelatedPassportLinks(passportNationality, passportContinent, destinationSlug, 3),
    ...getRelatedDestinationLinks(destinationSlug, destinationName, passportNationality, ['pakistani', 'indian', 'british', 'american', 'german']),
    ...TOOL_LINKS.slice(0, 3),
  ]

  // Deduplicate and sort by relevance
  const seen = new Set<string>()
  return allLinks
    .filter(l => {
      if (seen.has(l.href)) return false
      seen.add(l.href)
      return true
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, count)
}

// ── Sitemap priority calculator ───────────────────────────────────────────────
// Higher traffic routes get higher priority in sitemap

const HIGH_TRAFFIC_PASSPORTS = new Set(['PAK', 'IND', 'BGD', 'NGA', 'IDN', 'PHL', 'EGY', 'IRN'])
const HIGH_TRAFFIC_DESTINATIONS = new Set(['ARE', 'SAU', 'GBR', 'USA', 'DEU', 'AUS', 'CAN', 'SGP', 'JPN', 'THA'])

export function getSitemapPriority(
  template: 1 | 2 | 3 | 4,
  passportIso?: string,
  destinationIso?: string,
): number {
  let base = 0.7

  // Template weight
  const templateWeights = { 1: 0.85, 2: 0.8, 3: 0.75, 4: 0.9 }
  base = templateWeights[template]

  // Boost for high-traffic routes
  if (passportIso && HIGH_TRAFFIC_PASSPORTS.has(passportIso)) base += 0.05
  if (destinationIso && HIGH_TRAFFIC_DESTINATIONS.has(destinationIso)) base += 0.05

  return Math.min(1.0, Math.round(base * 100) / 100)
}
