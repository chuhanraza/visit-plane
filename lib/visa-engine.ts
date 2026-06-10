// ── VisitPlane Visa Decision Engine ─────────────────────────────────────────
// Decision-tree based visa lookup. Used as Phase 1-4 foundation; AI adds
// a personalization layer on top in Phase 5.

export type VisaType = 'visa_free' | 'visa_on_arrival' | 'evisa' | 'visa_required'

export interface VisaData {
  visaType: VisaType
  visaLabel: string
  icon: string
  badgeColor: string // tailwind bg class
  processingDays: string
  costUSD: number | null
  maxStayDays: number
  applyUrl?: string
  requiredDocs: string[]
  conditionalDocs: string[]
  leadTimeDays: number
  notes?: string
}

// ── Short display names ───────────────────────────────────────────────────────
export const SHORT_NAMES: Record<string, string> = {
  'United Arab Emirates': 'UAE',
  'United States': 'USA',
  'United Kingdom': 'UK',
  'Democratic Republic of the Congo': 'DR Congo',
  'Republic of the Congo': 'Congo',
  'Bosnia and Herzegovina': 'Bosnia',
  'Trinidad and Tobago': 'T&T',
  'Sao Tome and Principe': 'São Tomé',
  'Saint Kitts and Nevis': 'St. Kitts',
  'Saint Vincent and the Grenadines': 'St. Vincent',
  'Papua New Guinea': 'PNG',
  'Central African Republic': 'CAR',
}

export function shortName(country: string): string {
  return SHORT_NAMES[country] ?? country
}

// ── Passport tiers ────────────────────────────────────────────────────────────
const STRONG_PASSPORTS = new Set([
  'United States', 'United Kingdom', 'Canada', 'Australia', 'New Zealand',
  'Germany', 'France', 'Italy', 'Spain', 'Japan', 'South Korea', 'Singapore',
  'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland',
  'Austria', 'Belgium', 'Ireland', 'Portugal', 'Greece', 'Czech Republic',
  'Poland', 'Hungary', 'Luxembourg', 'Malta', 'Iceland', 'Estonia', 'Latvia',
  'Lithuania', 'Slovakia', 'Slovenia', 'Croatia', 'Cyprus',
  'Brunei', 'Malaysia', 'Israel', 'Taiwan', 'Chile', 'Argentina', 'Uruguay',
  'Mauritius', 'Seychelles', 'Barbados', 'Bahamas', 'Saint Kitts and Nevis',
])

const GCC_PASSPORTS = new Set([
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman',
])

const WEAK_PASSPORTS = new Set([
  'Afghanistan', 'Iraq', 'Syria', 'Yemen', 'Somalia', 'Libya', 'Sudan',
  'South Sudan', 'Eritrea', 'North Korea',
])

// ── Document templates ────────────────────────────────────────────────────────
const BASE_DOCS = [
  'Valid passport (min. 6 months validity beyond travel dates)',
  'Completed visa application form',
  'Recent passport-size photographs (white background)',
  'Bank statements — last 3 months (sufficient funds)',
  'Round-trip flight itinerary / confirmed tickets',
  'Hotel booking confirmation',
  'Travel insurance (min. USD $30,000 coverage)',
]

const CONDITIONAL_DOCS: Record<string, string[]> = {
  Tourism:  ['Proof of sufficient funds (sponsor letter if applicable)', 'Invitation letter (if staying with family/friends)', 'Previous visa copies (if any)'],
  Business: ['Invitation letter from host company', 'Company registration documents', 'Employment letter / NOC from employer'],
  Student:  ['University / school acceptance letter', 'Academic transcripts', 'Proof of tuition payment or scholarship'],
  Work:     ['Employment contract from destination country', 'Work permit / authorization letter', 'Employer NOC / experience letters'],
  Transit:  ['Onward flight tickets', 'Visa for final destination (if applicable)'],
  Family:   ['Host\'s proof of residence / citizenship', 'Relationship proof (marriage / birth certificates)', 'Invitation letter from family member'],
}

type PairData = {
  visaType: VisaType
  costUSD: number | null
  maxStayDays: number
  processingDays: string
  applyUrl?: string
  leadTimeDays: number
  notes?: string
}

// ── Known country-pair overrides ─────────────────────────────────────────────
// Key format: "Passport|Destination"
const PAIRS: Record<string, PairData> = {
  // ── Pakistan outbound ─────────────────────────────────────────────────────
  'Pakistan|United Arab Emirates': { visaType: 'evisa', costUSD: 90, maxStayDays: 30, processingDays: '3-5 business days', applyUrl: 'https://smartservices.icp.gov.ae', leadTimeDays: 14 },
  'Pakistan|Saudi Arabia': { visaType: 'evisa', costUSD: 105, maxStayDays: 90, processingDays: '3-7 business days', applyUrl: 'https://visa.mofa.gov.sa', leadTimeDays: 21 },
  'Pakistan|Turkey': { visaType: 'evisa', costUSD: 55, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.tr', leadTimeDays: 14 },
  'Pakistan|Malaysia': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Pakistan|Thailand': { visaType: 'visa_on_arrival', costUSD: 35, maxStayDays: 15, processingDays: 'On arrival', leadTimeDays: 0 },
  'Pakistan|Maldives': { visaType: 'visa_on_arrival', costUSD: null, maxStayDays: 30, processingDays: 'On arrival (free)', leadTimeDays: 0 },
  'Pakistan|Sri Lanka': { visaType: 'evisa', costUSD: 20, maxStayDays: 30, processingDays: '2-3 business days', applyUrl: 'https://www.eta.gov.lk', leadTimeDays: 7 },
  'Pakistan|Egypt': { visaType: 'visa_on_arrival', costUSD: 25, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Pakistan|Jordan': { visaType: 'visa_on_arrival', costUSD: 40, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Pakistan|China': { visaType: 'visa_free', costUSD: null, maxStayDays: 15, processingDays: 'No visa (15-day policy)', leadTimeDays: 0, notes: 'Pakistan is included in China\'s 15-day visa-free pilot' },
  'Pakistan|United Kingdom': { visaType: 'visa_required', costUSD: 145, maxStayDays: 180, processingDays: '15-20 business days', applyUrl: 'https://www.gov.uk/apply-uk-visa', leadTimeDays: 30 },
  'Pakistan|United States': { visaType: 'visa_required', costUSD: 185, maxStayDays: 180, processingDays: '30-60 business days', applyUrl: 'https://travel.state.gov', leadTimeDays: 90 },
  'Pakistan|Canada': { visaType: 'visa_required', costUSD: 100, maxStayDays: 180, processingDays: '20-40 business days', applyUrl: 'https://www.canada.ca/en/immigration', leadTimeDays: 60 },
  'Pakistan|Australia': { visaType: 'visa_required', costUSD: 150, maxStayDays: 90, processingDays: '20-40 business days', applyUrl: 'https://immi.homeaffairs.gov.au', leadTimeDays: 60 },
  'Pakistan|Germany': { visaType: 'visa_required', costUSD: 90, maxStayDays: 90, processingDays: '15 business days', applyUrl: 'https://www.vfs-germany.com.pk', leadTimeDays: 30 },
  'Pakistan|France': { visaType: 'visa_required', costUSD: 90, maxStayDays: 90, processingDays: '15 business days', leadTimeDays: 30 },
  'Pakistan|Azerbaijan': { visaType: 'evisa', costUSD: 25, maxStayDays: 30, processingDays: '3 business days', applyUrl: 'https://evisa.gov.az', leadTimeDays: 7 },
  'Pakistan|Georgia': { visaType: 'visa_free', costUSD: null, maxStayDays: 365, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Pakistan|Nepal': { visaType: 'visa_on_arrival', costUSD: 25, maxStayDays: 15, processingDays: 'On arrival', leadTimeDays: 0 },
  'Pakistan|Kenya': { visaType: 'evisa', costUSD: 51, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://evisa.go.ke', leadTimeDays: 14 },
  'Pakistan|Qatar': { visaType: 'visa_on_arrival', costUSD: null, maxStayDays: 30, processingDays: 'On arrival (free)', leadTimeDays: 0 },
  'Pakistan|Oman': { visaType: 'evisa', costUSD: 20, maxStayDays: 30, processingDays: '3-5 business days', applyUrl: 'https://evisa.rop.gov.om', leadTimeDays: 14 },
  'Pakistan|Bahrain': { visaType: 'evisa', costUSD: 28, maxStayDays: 14, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.bh', leadTimeDays: 7 },
  'Pakistan|Indonesia': { visaType: 'visa_on_arrival', costUSD: 35, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Pakistan|Cambodia': { visaType: 'evisa', costUSD: 30, maxStayDays: 30, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.kh', leadTimeDays: 7 },
  'Pakistan|Rwanda': { visaType: 'visa_on_arrival', costUSD: 50, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Pakistan|Ethiopia': { visaType: 'evisa', costUSD: 52, maxStayDays: 30, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.et', leadTimeDays: 14 },
  'Pakistan|Morocco': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Pakistan|Tunisia': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },

  // ── India outbound ────────────────────────────────────────────────────────
  'India|United Arab Emirates': { visaType: 'evisa', costUSD: 90, maxStayDays: 30, processingDays: '3-5 business days', applyUrl: 'https://smartservices.icp.gov.ae', leadTimeDays: 14 },
  'India|Saudi Arabia': { visaType: 'evisa', costUSD: 100, maxStayDays: 90, processingDays: '3-7 business days', applyUrl: 'https://visa.mofa.gov.sa', leadTimeDays: 21 },
  'India|Thailand': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'India|Malaysia': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'India|Sri Lanka': { visaType: 'evisa', costUSD: 20, maxStayDays: 30, processingDays: '2-3 business days', applyUrl: 'https://www.eta.gov.lk', leadTimeDays: 7 },
  'India|Maldives': { visaType: 'visa_on_arrival', costUSD: null, maxStayDays: 30, processingDays: 'On arrival (free)', leadTimeDays: 0 },
  'India|Turkey': { visaType: 'evisa', costUSD: 55, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.tr', leadTimeDays: 14 },
  'India|United Kingdom': { visaType: 'visa_required', costUSD: 145, maxStayDays: 180, processingDays: '15-20 business days', applyUrl: 'https://www.gov.uk/apply-uk-visa', leadTimeDays: 30 },
  'India|United States': { visaType: 'visa_required', costUSD: 185, maxStayDays: 180, processingDays: '30-60 business days', applyUrl: 'https://travel.state.gov', leadTimeDays: 90 },
  'India|Canada': { visaType: 'visa_required', costUSD: 100, maxStayDays: 180, processingDays: '20-40 business days', applyUrl: 'https://www.canada.ca/en/immigration', leadTimeDays: 60 },
  'India|Australia': { visaType: 'visa_required', costUSD: 150, maxStayDays: 90, processingDays: '20-40 business days', applyUrl: 'https://immi.homeaffairs.gov.au', leadTimeDays: 60 },
  'India|Germany': { visaType: 'visa_required', costUSD: 90, maxStayDays: 90, processingDays: '15 business days', leadTimeDays: 30 },
  'India|Egypt': { visaType: 'visa_on_arrival', costUSD: 25, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'India|Indonesia': { visaType: 'visa_on_arrival', costUSD: 35, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'India|Nepal': { visaType: 'visa_free', costUSD: null, maxStayDays: 150, processingDays: 'No visa needed', leadTimeDays: 0 },
  'India|Bhutan': { visaType: 'visa_required', costUSD: 200, maxStayDays: 30, processingDays: '5-7 business days', applyUrl: 'https://www.tourism.gov.bt', leadTimeDays: 21, notes: 'Sustainable Development Fee (SDF) of $100/day applies' },
  'India|China': { visaType: 'visa_required', costUSD: 140, maxStayDays: 30, processingDays: '5-7 business days', leadTimeDays: 21 },
  'India|Japan': { visaType: 'visa_required', costUSD: 30, maxStayDays: 90, processingDays: '5-7 business days', leadTimeDays: 21 },
  'India|South Korea': { visaType: 'visa_required', costUSD: 50, maxStayDays: 90, processingDays: '5-7 business days', leadTimeDays: 21 },
  'India|Singapore': { visaType: 'evisa', costUSD: 30, maxStayDays: 30, processingDays: '3-5 business days', applyUrl: 'https://www.ica.gov.sg', leadTimeDays: 14 },
  'India|Vietnam': { visaType: 'evisa', costUSD: 25, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://evisa.xuatnhapcanh.gov.vn', leadTimeDays: 7 },
  'India|Kenya': { visaType: 'evisa', costUSD: 51, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://evisa.go.ke', leadTimeDays: 14 },
  'India|Qatar': { visaType: 'visa_on_arrival', costUSD: null, maxStayDays: 30, processingDays: 'On arrival (free)', leadTimeDays: 0 },
  'India|Oman': { visaType: 'evisa', costUSD: 20, maxStayDays: 30, processingDays: '3-5 business days', applyUrl: 'https://evisa.rop.gov.om', leadTimeDays: 14 },
  'India|Bahrain': { visaType: 'evisa', costUSD: 28, maxStayDays: 14, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.bh', leadTimeDays: 7 },

  // ── Bangladesh outbound ───────────────────────────────────────────────────
  'Bangladesh|United Arab Emirates': { visaType: 'visa_required', costUSD: 120, maxStayDays: 30, processingDays: '5-10 business days', applyUrl: 'https://smartservices.icp.gov.ae', leadTimeDays: 21 },
  'Bangladesh|Saudi Arabia': { visaType: 'evisa', costUSD: 105, maxStayDays: 90, processingDays: '3-7 business days', applyUrl: 'https://visa.mofa.gov.sa', leadTimeDays: 21 },
  'Bangladesh|Turkey': { visaType: 'evisa', costUSD: 55, maxStayDays: 30, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.tr', leadTimeDays: 14 },
  'Bangladesh|Malaysia': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Bangladesh|Thailand': { visaType: 'visa_on_arrival', costUSD: 35, maxStayDays: 15, processingDays: 'On arrival', leadTimeDays: 0 },
  'Bangladesh|United Kingdom': { visaType: 'visa_required', costUSD: 145, maxStayDays: 180, processingDays: '15-20 business days', applyUrl: 'https://www.gov.uk/apply-uk-visa', leadTimeDays: 30 },
  'Bangladesh|United States': { visaType: 'visa_required', costUSD: 185, maxStayDays: 180, processingDays: '30-60 business days', applyUrl: 'https://travel.state.gov', leadTimeDays: 90 },
  'Bangladesh|India': { visaType: 'visa_required', costUSD: 80, maxStayDays: 180, processingDays: '5-10 business days', leadTimeDays: 21 },
  'Bangladesh|Nepal': { visaType: 'visa_on_arrival', costUSD: 25, maxStayDays: 15, processingDays: 'On arrival', leadTimeDays: 0 },
  'Bangladesh|Indonesia': { visaType: 'visa_on_arrival', costUSD: 35, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Bangladesh|Qatar': { visaType: 'visa_on_arrival', costUSD: null, maxStayDays: 30, processingDays: 'On arrival (free)', leadTimeDays: 0 },

  // ── Nigeria outbound ──────────────────────────────────────────────────────
  'Nigeria|United Kingdom': { visaType: 'visa_required', costUSD: 145, maxStayDays: 180, processingDays: '15-20 business days', applyUrl: 'https://www.gov.uk/apply-uk-visa', leadTimeDays: 30 },
  'Nigeria|United States': { visaType: 'visa_required', costUSD: 185, maxStayDays: 180, processingDays: '30-60 business days', applyUrl: 'https://travel.state.gov', leadTimeDays: 90 },
  'Nigeria|United Arab Emirates': { visaType: 'visa_on_arrival', costUSD: 100, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Nigeria|Turkey': { visaType: 'evisa', costUSD: 55, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.tr', leadTimeDays: 14 },
  'Nigeria|Germany': { visaType: 'visa_required', costUSD: 90, maxStayDays: 90, processingDays: '15 business days', leadTimeDays: 30 },
  'Nigeria|Canada': { visaType: 'visa_required', costUSD: 100, maxStayDays: 180, processingDays: '20-40 business days', leadTimeDays: 60 },
  'Nigeria|China': { visaType: 'visa_free', costUSD: null, maxStayDays: 15, processingDays: 'No visa (15-day policy)', leadTimeDays: 0 },
  'Nigeria|Malaysia': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },

  // ── Ghana outbound ────────────────────────────────────────────────────────
  'Ghana|United Kingdom': { visaType: 'visa_required', costUSD: 145, maxStayDays: 180, processingDays: '15-20 business days', applyUrl: 'https://www.gov.uk/apply-uk-visa', leadTimeDays: 30 },
  'Ghana|United States': { visaType: 'visa_required', costUSD: 185, maxStayDays: 180, processingDays: '30-60 business days', applyUrl: 'https://travel.state.gov', leadTimeDays: 90 },
  'Ghana|United Arab Emirates': { visaType: 'visa_on_arrival', costUSD: 100, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Ghana|Turkey': { visaType: 'evisa', costUSD: 55, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.tr', leadTimeDays: 14 },
  'Ghana|Germany': { visaType: 'visa_required', costUSD: 90, maxStayDays: 90, processingDays: '15 business days', leadTimeDays: 30 },

  // ── Philippines outbound ──────────────────────────────────────────────────
  'Philippines|United Arab Emirates': { visaType: 'visa_required', costUSD: 90, maxStayDays: 30, processingDays: '5-7 business days', applyUrl: 'https://smartservices.icp.gov.ae', leadTimeDays: 21 },
  'Philippines|Japan': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Philippines|South Korea': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Philippines|United States': { visaType: 'visa_required', costUSD: 185, maxStayDays: 180, processingDays: '30-60 business days', applyUrl: 'https://travel.state.gov', leadTimeDays: 90 },
  'Philippines|United Kingdom': { visaType: 'visa_required', costUSD: 145, maxStayDays: 180, processingDays: '15-20 business days', applyUrl: 'https://www.gov.uk/apply-uk-visa', leadTimeDays: 30 },
  'Philippines|Singapore': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Philippines|Thailand': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Philippines|Malaysia': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },

  // ── USA outbound ──────────────────────────────────────────────────────────
  'United States|United Kingdom': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United States|France': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United States|Germany': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United States|Japan': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United States|Australia': { visaType: 'evisa', costUSD: 20, maxStayDays: 90, processingDays: '1-2 business days', applyUrl: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601', leadTimeDays: 3, notes: 'ETA required — apply online before travel' },
  'United States|China': { visaType: 'visa_free', costUSD: null, maxStayDays: 15, processingDays: 'No visa (15-day policy)', leadTimeDays: 0 },
  'United States|Canada': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United States|Brazil': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United States|Thailand': { visaType: 'visa_free', costUSD: null, maxStayDays: 60, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United States|India': { visaType: 'evisa', costUSD: 25, maxStayDays: 60, processingDays: '3-5 business days', applyUrl: 'https://indianvisaonline.gov.in', leadTimeDays: 7 },
  'United States|Turkey': { visaType: 'evisa', costUSD: 55, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.tr', leadTimeDays: 7 },
  'United States|Vietnam': { visaType: 'evisa', costUSD: 25, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://evisa.xuatnhapcanh.gov.vn', leadTimeDays: 7 },
  'United States|Sri Lanka': { visaType: 'evisa', costUSD: 20, maxStayDays: 30, processingDays: '2-3 business days', applyUrl: 'https://www.eta.gov.lk', leadTimeDays: 7 },
  'United States|Mexico': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United States|South Korea': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United States|Singapore': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United States|United Arab Emirates': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },

  // ── UK outbound ───────────────────────────────────────────────────────────
  'United Kingdom|France': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Kingdom|Germany': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Kingdom|Spain': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Kingdom|United States': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0, notes: 'ESTA ($21) required for air/sea travel — apply in advance' },
  'United Kingdom|Australia': { visaType: 'evisa', costUSD: 20, maxStayDays: 90, processingDays: '1-2 business days', applyUrl: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/electronic-travel-authority-601', leadTimeDays: 3 },
  'United Kingdom|India': { visaType: 'evisa', costUSD: 25, maxStayDays: 60, processingDays: '3-5 business days', applyUrl: 'https://indianvisaonline.gov.in', leadTimeDays: 7 },
  'United Kingdom|Thailand': { visaType: 'visa_free', costUSD: null, maxStayDays: 60, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Kingdom|Turkey': { visaType: 'evisa', costUSD: 55, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.tr', leadTimeDays: 7 },
  'United Kingdom|Vietnam': { visaType: 'evisa', costUSD: 25, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://evisa.xuatnhapcanh.gov.vn', leadTimeDays: 7 },
  'United Kingdom|Canada': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Kingdom|Mexico': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Kingdom|Japan': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Kingdom|United Arab Emirates': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Kingdom|China': { visaType: 'visa_free', costUSD: null, maxStayDays: 15, processingDays: 'No visa (15-day policy)', leadTimeDays: 0 },

  // ── Canada outbound ───────────────────────────────────────────────────────
  'Canada|United Kingdom': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Canada|France': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Canada|United States': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Canada|Mexico': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Canada|Thailand': { visaType: 'visa_free', costUSD: null, maxStayDays: 60, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Canada|Japan': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Canada|India': { visaType: 'evisa', costUSD: 25, maxStayDays: 60, processingDays: '3-5 business days', applyUrl: 'https://indianvisaonline.gov.in', leadTimeDays: 7 },
  'Canada|Australia': { visaType: 'evisa', costUSD: 20, maxStayDays: 90, processingDays: '1-2 business days', applyUrl: 'https://immi.homeaffairs.gov.au', leadTimeDays: 3 },
  'Canada|United Arab Emirates': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Canada|China': { visaType: 'visa_free', costUSD: null, maxStayDays: 15, processingDays: 'No visa (15-day policy)', leadTimeDays: 0 },

  // ── Australia outbound ────────────────────────────────────────────────────
  'Australia|United Kingdom': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Australia|United States': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Australia|Japan': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Australia|Thailand': { visaType: 'visa_free', costUSD: null, maxStayDays: 60, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Australia|Maldives': { visaType: 'visa_on_arrival', costUSD: null, maxStayDays: 30, processingDays: 'On arrival (free)', leadTimeDays: 0 },
  'Australia|India': { visaType: 'evisa', costUSD: 25, maxStayDays: 60, processingDays: '3-5 business days', applyUrl: 'https://indianvisaonline.gov.in', leadTimeDays: 7 },
  'Australia|Vietnam': { visaType: 'evisa', costUSD: 25, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://evisa.xuatnhapcanh.gov.vn', leadTimeDays: 7 },
  'Australia|United Arab Emirates': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Australia|Indonesia': { visaType: 'visa_on_arrival', costUSD: 35, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Australia|China': { visaType: 'visa_required', costUSD: 140, maxStayDays: 30, processingDays: '5-7 business days', leadTimeDays: 21 },

  // ── UAE outbound (strong passport) ───────────────────────────────────────
  'United Arab Emirates|United Kingdom': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Arab Emirates|United States': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Arab Emirates|France': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Arab Emirates|Germany': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Arab Emirates|Thailand': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Arab Emirates|Japan': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Arab Emirates|Turkey': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Arab Emirates|India': { visaType: 'evisa', costUSD: 25, maxStayDays: 60, processingDays: '3-5 business days', applyUrl: 'https://indianvisaonline.gov.in', leadTimeDays: 7 },
  'United Arab Emirates|Malaysia': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'United Arab Emirates|Singapore': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },

  // ── Nepal outbound ────────────────────────────────────────────────────────
  'Nepal|India': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Nepal|China': { visaType: 'visa_required', costUSD: 50, maxStayDays: 30, processingDays: '5-7 business days', leadTimeDays: 21 },
  'Nepal|United Arab Emirates': { visaType: 'visa_on_arrival', costUSD: 90, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Nepal|Thailand': { visaType: 'visa_on_arrival', costUSD: 35, maxStayDays: 15, processingDays: 'On arrival', leadTimeDays: 0 },
  'Nepal|Malaysia': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Nepal|United Kingdom': { visaType: 'visa_required', costUSD: 145, maxStayDays: 180, processingDays: '15-20 business days', applyUrl: 'https://www.gov.uk/apply-uk-visa', leadTimeDays: 30 },
  'Nepal|United States': { visaType: 'visa_required', costUSD: 185, maxStayDays: 180, processingDays: '30-60 business days', applyUrl: 'https://travel.state.gov', leadTimeDays: 90 },

  // ── Sri Lanka outbound ────────────────────────────────────────────────────
  'Sri Lanka|United Arab Emirates': { visaType: 'visa_on_arrival', costUSD: 90, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Sri Lanka|Thailand': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Sri Lanka|Malaysia': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Sri Lanka|India': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Sri Lanka|Singapore': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Sri Lanka|United Kingdom': { visaType: 'visa_required', costUSD: 145, maxStayDays: 180, processingDays: '15-20 business days', applyUrl: 'https://www.gov.uk/apply-uk-visa', leadTimeDays: 30 },
  'Sri Lanka|United States': { visaType: 'visa_required', costUSD: 185, maxStayDays: 180, processingDays: '30-60 business days', applyUrl: 'https://travel.state.gov', leadTimeDays: 90 },

  // ── Japan outbound ────────────────────────────────────────────────────────
  'Japan|United States': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Japan|United Kingdom': { visaType: 'visa_free', costUSD: null, maxStayDays: 180, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Japan|France': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Japan|Germany': { visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Japan|Thailand': { visaType: 'visa_free', costUSD: null, maxStayDays: 30, processingDays: 'No visa needed', leadTimeDays: 0 },
  'Japan|China': { visaType: 'visa_free', costUSD: null, maxStayDays: 15, processingDays: 'No visa (15-day policy)', leadTimeDays: 0 },
  'Japan|India': { visaType: 'evisa', costUSD: 25, maxStayDays: 60, processingDays: '3-5 business days', applyUrl: 'https://indianvisaonline.gov.in', leadTimeDays: 7 },
  'Japan|Australia': { visaType: 'evisa', costUSD: 20, maxStayDays: 90, processingDays: '1-2 business days', applyUrl: 'https://immi.homeaffairs.gov.au', leadTimeDays: 3 },
}

// ── Destination blanket rules (apply to all passport holders) ─────────────────
const DESTINATION_BLANKET: Record<string, PairData> = {
  'Maldives': { visaType: 'visa_on_arrival', costUSD: null, maxStayDays: 30, processingDays: 'On arrival (free)', leadTimeDays: 0 },
  'Rwanda': { visaType: 'visa_on_arrival', costUSD: 50, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Cambodia': { visaType: 'evisa', costUSD: 30, maxStayDays: 30, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.kh', leadTimeDays: 7 },
  'Ethiopia': { visaType: 'evisa', costUSD: 52, maxStayDays: 30, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.et', leadTimeDays: 14 },
  'Kenya': { visaType: 'evisa', costUSD: 51, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://evisa.go.ke', leadTimeDays: 14 },
  'Seychelles': { visaType: 'visa_on_arrival', costUSD: null, maxStayDays: 30, processingDays: 'On arrival (free)', leadTimeDays: 0 },
  'Nepal': { visaType: 'visa_on_arrival', costUSD: 25, maxStayDays: 15, processingDays: 'On arrival', leadTimeDays: 0 },
  'Georgia': { visaType: 'visa_free', costUSD: null, maxStayDays: 365, processingDays: 'No visa needed (up to 1 year)', leadTimeDays: 0 },
}

// ── Strong passport fallback destinations (overrides) ────────────────────────
// Destinations that are not visa_free even for strong passports
const STRONG_PASSPORT_EXCEPTIONS: Record<string, PairData> = {
  'India': { visaType: 'evisa', costUSD: 25, maxStayDays: 60, processingDays: '3-5 business days', applyUrl: 'https://indianvisaonline.gov.in', leadTimeDays: 7 },
  'China': { visaType: 'visa_free', costUSD: null, maxStayDays: 15, processingDays: 'No visa (15-day policy)', leadTimeDays: 0, notes: '15-day visa-free policy for many nationalities' },
  'Vietnam': { visaType: 'evisa', costUSD: 25, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://evisa.xuatnhapcanh.gov.vn', leadTimeDays: 7 },
  'Turkey': { visaType: 'evisa', costUSD: 55, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://www.evisa.gov.tr', leadTimeDays: 7 },
  'Australia': { visaType: 'evisa', costUSD: 20, maxStayDays: 90, processingDays: '1-2 business days', applyUrl: 'https://immi.homeaffairs.gov.au', leadTimeDays: 3, notes: 'ETA required — apply online before travel' },
  'Sri Lanka': { visaType: 'evisa', costUSD: 20, maxStayDays: 30, processingDays: '2-3 business days', applyUrl: 'https://www.eta.gov.lk', leadTimeDays: 7 },
  'Russia': { visaType: 'evisa', costUSD: 60, maxStayDays: 16, processingDays: '4-8 business days', applyUrl: 'https://evisa.kdmid.ru', leadTimeDays: 14 },
  'Cuba': { visaType: 'visa_required', costUSD: 50, maxStayDays: 30, processingDays: '5-10 business days', leadTimeDays: 21 },
  'Egypt': { visaType: 'visa_on_arrival', costUSD: 25, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 },
  'Tanzania': { visaType: 'evisa', costUSD: 50, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://immigration.go.tz', leadTimeDays: 14 },
  'Uganda': { visaType: 'evisa', costUSD: 50, maxStayDays: 90, processingDays: '3-5 business days', applyUrl: 'https://visas.immigration.go.ug', leadTimeDays: 14 },
  'Iran': { visaType: 'visa_required', costUSD: 75, maxStayDays: 30, processingDays: '5-10 business days', leadTimeDays: 21 },
  'North Korea': { visaType: 'visa_required', costUSD: 200, maxStayDays: 15, processingDays: '30+ business days', leadTimeDays: 60, notes: 'Extremely restricted; must book through authorized tour operator' },
  'Bhutan': { visaType: 'visa_required', costUSD: 200, maxStayDays: 30, processingDays: '5-7 business days', applyUrl: 'https://www.tourism.gov.bt', leadTimeDays: 21, notes: 'Sustainable Development Fee (SDF) $100/day applies' },
  'Saudi Arabia': { visaType: 'evisa', costUSD: 105, maxStayDays: 90, processingDays: '3-7 business days', applyUrl: 'https://visa.mofa.gov.sa', leadTimeDays: 14 },
}

// ── Build helpers ─────────────────────────────────────────────────────────────

function visaTypeLabel(type: VisaType): { label: string; icon: string; badgeColor: string } {
  switch (type) {
    case 'visa_free':
      return { label: 'Visa Free', icon: '✅', badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
    case 'visa_on_arrival':
      return { label: 'Visa on Arrival', icon: '🛬', badgeColor: 'bg-blue-100 text-blue-700 border-blue-200' }
    case 'evisa':
      return { label: 'eVisa Required', icon: '⚡', badgeColor: 'bg-amber-100 text-amber-700 border-amber-200' }
    case 'visa_required':
      return { label: 'Visa Required', icon: '📋', badgeColor: 'bg-rose-100 text-rose-700 border-rose-200' }
  }
}

function buildDocs(visaType: VisaType, purpose: string): { required: string[]; conditional: string[] } {
  if (visaType === 'visa_free') {
    return {
      required: ['Valid passport (min. 6 months validity)', 'Return flight tickets'],
      conditional: ['Proof of accommodation', 'Sufficient funds', 'Travel insurance (recommended)'],
    }
  }
  if (visaType === 'visa_on_arrival') {
    return {
      required: [
        'Valid passport (min. 6 months validity)',
        'Recent passport photos',
        'Return flight tickets',
        'Hotel booking confirmation',
        'Sufficient cash for visa fee',
      ],
      conditional: ['Bank statements (3 months)', 'Travel insurance', 'Invitation letter (if visiting friends/family)'],
    }
  }
  // eVisa or visa_required
  const purposeKey = ['Tourism', 'Business', 'Student', 'Work', 'Transit', 'Family'].find(
    p => purpose.toLowerCase().includes(p.toLowerCase())
  ) ?? 'Tourism'
  const conditional = CONDITIONAL_DOCS[purposeKey] ?? CONDITIONAL_DOCS.Tourism
  return { required: BASE_DOCS.slice(), conditional }
}

function buildVisaData(pair: PairData, purpose: string): VisaData {
  const { label, icon, badgeColor } = visaTypeLabel(pair.visaType)
  const docs = buildDocs(pair.visaType, purpose)
  return {
    visaType: pair.visaType,
    visaLabel: label,
    icon,
    badgeColor,
    processingDays: pair.processingDays,
    costUSD: pair.costUSD,
    maxStayDays: pair.maxStayDays,
    applyUrl: pair.applyUrl,
    requiredDocs: docs.required,
    conditionalDocs: docs.conditional,
    leadTimeDays: pair.leadTimeDays,
    notes: pair.notes,
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

export function getVisaData(
  passport: string,
  destination: string,
  purpose: string = 'Tourism'
): VisaData {
  // Same country
  if (passport === destination) {
    const { label, icon, badgeColor } = visaTypeLabel('visa_free')
    return {
      visaType: 'visa_free',
      visaLabel: label,
      icon,
      badgeColor,
      processingDays: 'No visa needed',
      costUSD: null,
      maxStayDays: 365,
      requiredDocs: ['Valid national ID or passport'],
      conditionalDocs: [],
      leadTimeDays: 0,
      notes: 'You are traveling to your home country — no visa required.',
    }
  }

  // 1. Check known pair
  const pairKey = `${passport}|${destination}`
  if (PAIRS[pairKey]) return buildVisaData(PAIRS[pairKey], purpose)

  // 2. Check destination blanket rules
  if (DESTINATION_BLANKET[destination]) return buildVisaData(DESTINATION_BLANKET[destination], purpose)

  // 3. Strong passport
  if (STRONG_PASSPORTS.has(passport)) {
    if (STRONG_PASSPORT_EXCEPTIONS[destination]) {
      return buildVisaData(STRONG_PASSPORT_EXCEPTIONS[destination], purpose)
    }
    // Default: strong passport → visa free
    return buildVisaData({ visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 }, purpose)
  }

  // 4. GCC passports — strong access
  if (GCC_PASSPORTS.has(passport)) {
    if (STRONG_PASSPORT_EXCEPTIONS[destination]) {
      return buildVisaData(STRONG_PASSPORT_EXCEPTIONS[destination], purpose)
    }
    if (['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia', 'New Zealand'].includes(destination)) {
      return buildVisaData({ visaType: 'visa_free', costUSD: null, maxStayDays: 90, processingDays: 'No visa needed', leadTimeDays: 0 }, purpose)
    }
    return buildVisaData({ visaType: 'visa_on_arrival', costUSD: null, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 }, purpose)
  }

  // 5. Very weak passports
  if (WEAK_PASSPORTS.has(passport)) {
    return buildVisaData({
      visaType: 'visa_required',
      costUSD: 100,
      maxStayDays: 30,
      processingDays: '15-30 business days',
      leadTimeDays: 60,
      notes: 'Additional scrutiny may apply. Consult the embassy directly for current requirements.',
    }, purpose)
  }

  // 6. Default fallback — middle-tier passport
  if (['United States', 'United Kingdom', 'Canada', 'Germany', 'France', 'Australia', 'New Zealand', 'Japan', 'South Korea', 'Singapore'].includes(destination)) {
    return buildVisaData({ visaType: 'visa_required', costUSD: 150, maxStayDays: 180, processingDays: '15-30 business days', leadTimeDays: 45 }, purpose)
  }
  if (['Thailand', 'Malaysia', 'Indonesia', 'Vietnam', 'Philippines', 'Cambodia', 'Laos'].includes(destination)) {
    return buildVisaData({ visaType: 'visa_on_arrival', costUSD: 35, maxStayDays: 30, processingDays: 'On arrival', leadTimeDays: 0 }, purpose)
  }
  if (['Turkey', 'Egypt', 'Jordan', 'Azerbaijan'].includes(destination)) {
    return buildVisaData({ visaType: 'evisa', costUSD: 50, maxStayDays: 30, processingDays: '3-5 business days', leadTimeDays: 14 }, purpose)
  }
  if (['Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Bahrain', 'Oman', 'Kuwait'].includes(destination)) {
    return buildVisaData({ visaType: 'evisa', costUSD: 90, maxStayDays: 30, processingDays: '5-10 business days', leadTimeDays: 21 }, purpose)
  }

  // Absolute fallback
  return buildVisaData({
    visaType: 'visa_required',
    costUSD: 80,
    maxStayDays: 30,
    processingDays: '10-15 business days',
    leadTimeDays: 30,
  }, purpose)
}
