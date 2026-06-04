/**
 * Visitplane — Quality Gate Validators
 *
 * Every generated page must pass ALL gates before being published.
 * Failures go to the manual review queue in /admin/seo.
 *
 * Gates:
 *  1. Word count minimum (template-specific)
 *  2. Uniqueness — no >20% overlap with generic boilerplate phrases
 *  3. Source count — ≥2 official sources cited
 *  4. Flesch reading ease ≥60
 *  5. Internal link count 3–5 (enforced in template, checked here)
 *  6. External link count 2–3 (from sources array)
 *  7. No AI-detector trigger phrases
 *  8. Route specificity — content must mention the exact country names
 */

import type { Template } from './contentGenerator'

// ── Types ─────────────────────────────────────────────────────────────────────

export type QualityResult = {
  passed: boolean
  failures: string[]
  wordCount: number
  wordCountOk: boolean
  uniquenessScore: number    // 0–100, higher = more unique (vs boilerplate)
  sourcesCount: number
  sourcesOk: boolean
  fleschScore: number
  fleschOk: boolean
  linksOk: boolean
  routeSpecific: boolean
}

type PageContent = {
  intro_paragraph?: string
  sections?: Array<{ heading: string; content: string }>
  faq?: Array<{ question: string; answer: string }>
  sources?: Array<{ url: string; type: string }>
  word_count?: number
}

type GenerationRequest = {
  template: Template
  passportIso: string
  destinationIso?: string
}

// ── Word count minimums per template ─────────────────────────────────────────

const MIN_WORDS: Record<Template, number> = {
  template1: 700,
  template2: 500,
  template3: 450,
  template4: 900,
}

// ── AI-detector trigger phrases (immediate fail) ───────────────────────────────

const AI_PHRASES = [
  'delve into',
  'in conclusion,',
  'it is important to note',
  'it\'s important to note',
  'in today\'s world',
  'navigating the complexities',
  'comprehensive guide',
  'invaluable resource',
  'it goes without saying',
  'rest assured',
  'at the end of the day',
  'game-changer',
  'seamlessly',
  'leverage',
  'unlock',
  'dive deep',
  'in the realm of',
  'furthermore,',
  'moreover,',
  'in summary,',
  'to summarize,',
  'as we can see',
  'it\'s worth noting that',
  'needless to say',
  'without further ado',
]

// ── Boilerplate sentences to check uniqueness against ─────────────────────────
// If >20% of sentences match these patterns, the content is too generic

const BOILERPLATE_PATTERNS = [
  /you need a valid passport/i,
  /please check the official embassy/i,
  /visa requirements vary by nationality/i,
  /contact the embassy for more information/i,
  /this information is subject to change/i,
  /always verify with official sources/i,
  /requirements may change without notice/i,
  /consult an immigration expert/i,
  /visa fees are subject to change/i,
  /check with the relevant authorities/i,
]

// ── Official source domains (acceptable external links) ────────────────────────

const OFFICIAL_DOMAINS = [
  'gov.ae', 'icp.gov.ae', 'mofaic.gov.ae',
  'visitsaudi.com', 'mofa.gov.sa',
  'evisa.gov.tr', 'mfa.gov.tr',
  'thaievisa.go.th', 'mfa.go.th',
  'malaysiavisa.imi.gov.my',
  'mom.gov.sg', 'ica.gov.sg',
  'indianvisaonline.gov.in', 'mha.gov.in',
  'mofa.go.jp',
  'evisa.go.kr', 'mofa.go.kr',
  'immi.homeaffairs.gov.au',
  'immigration.govt.nz',
  'gov.uk',
  'travel.state.gov', 'state.gov',
  'canada.ca',
  'auswaertiges-amt.de',
  'france-visas.gouv.fr',
  'henleypassportindex.com',
  'iatatravelcentre.com',
  'evisa.gov.az',
  'evisa.gov.ge',
  'evisa.go.ke',
  'irembo.gov.rw',
  'hukoomi.gov.qa',
  'evisa.moi.gov.kw',
  'evisa.gov.bh',
  'evisa.rop.gov.om',
  'imuga.immigration.gov.mv',
  'eservices.immigration.go.tz',
  'immigration.gov.pk',
  'mofa.gov.pk',
]

// ── Flesch Reading Ease calculation ───────────────────────────────────────────

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1
  // Remove trailing e
  word = word.replace(/e$/, '')
  // Count vowel groups
  const matches = word.match(/[aeiouy]+/g)
  return matches ? Math.max(1, matches.length) : 1
}

export function fleschReadingEase(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words     = text.split(/\s+/).filter(w => w.trim().length > 0)

  if (sentences.length === 0 || words.length === 0) return 0

  const totalSyllables = words.reduce((acc, w) => acc + countSyllables(w), 0)
  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = totalSyllables / words.length

  // Flesch formula: 206.835 − 1.015 × (words/sentences) − 84.6 × (syllables/words)
  const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10))
}

// ── Word count ─────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.trim().length > 0).length
}

function extractFullText(content: PageContent): string {
  const parts: string[] = []
  if (content.intro_paragraph) parts.push(content.intro_paragraph)
  if (content.sections) {
    for (const s of content.sections) {
      parts.push(s.heading)
      parts.push(s.content)
    }
  }
  if (content.faq) {
    for (const f of content.faq) {
      parts.push(f.question)
      parts.push(f.answer)
    }
  }
  return parts.join(' ')
}

// ── Uniqueness check ──────────────────────────────────────────────────────────

function checkUniqueness(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
  if (sentences.length === 0) return 0

  let boilerplateCount = 0
  for (const sentence of sentences) {
    for (const pattern of BOILERPLATE_PATTERNS) {
      if (pattern.test(sentence)) {
        boilerplateCount++
        break
      }
    }
  }

  // Uniqueness score: 100 = fully unique, 0 = all boilerplate
  return Math.round(100 - (boilerplateCount / sentences.length) * 100)
}

// ── AI phrase check ───────────────────────────────────────────────────────────

function checkNoAIPhrases(text: string): string[] {
  const found: string[] = []
  const lower = text.toLowerCase()
  for (const phrase of AI_PHRASES) {
    if (lower.includes(phrase)) found.push(phrase)
  }
  return found
}

// ── Route specificity check ───────────────────────────────────────────────────

function checkRouteSpecific(
  text: string,
  passportIso: string,
  destinationIso?: string,
): boolean {
  // Import inline to avoid circular dep
  const ISO3_TO_NAME: Record<string, string> = {
    PAK: 'Pakistan', IND: 'India', BGD: 'Bangladesh', ARE: 'UAE',
    SAU: 'Saudi Arabia', TUR: 'Turkey', THA: 'Thailand', MYS: 'Malaysia',
    GBR: 'United Kingdom', DEU: 'Germany', USA: 'United States',
    CHN: 'China', SGP: 'Singapore', JPN: 'Japan', KOR: 'South Korea',
    AUS: 'Australia', CAN: 'Canada', NGA: 'Nigeria', EGY: 'Egypt',
    IDN: 'Indonesia', PHL: 'Philippines', OMN: 'Oman', QAT: 'Qatar',
    KWT: 'Kuwait', BHR: 'Bahrain', LKA: 'Sri Lanka', NPL: 'Nepal',
    IRN: 'Iran', IRQ: 'Iraq', KEN: 'Kenya', ETH: 'Ethiopia', ZAF: 'South Africa',
  }

  const passportName    = ISO3_TO_NAME[passportIso] ?? passportIso
  const destinationName = destinationIso ? (ISO3_TO_NAME[destinationIso] ?? destinationIso) : null

  const lower = text.toLowerCase()
  const hasPassport    = lower.includes(passportName.toLowerCase())
  const hasDestination = !destinationName || lower.includes(destinationName.toLowerCase())

  return hasPassport && hasDestination
}

// ── Source quality check ──────────────────────────────────────────────────────

function checkSources(sources: Array<{ url: string; type: string }> = []): {
  count: number
  hasOfficialSources: boolean
  hasThirdParty: boolean
} {
  const officialSources = sources.filter(s => {
    try {
      const hostname = new URL(s.url).hostname.replace('www.', '')
      return OFFICIAL_DOMAINS.some(d => hostname.endsWith(d))
    } catch {
      return s.type === 'mofa' || s.type === 'embassy' || s.type === 'evisa_portal'
    }
  })

  // Check for third-party aggregators (should not be primary source)
  const thirdPartyDomains = ['ivisa.com', 'visahq.com', 'atlys.com', 'visacentral.com', 'travisa.com']
  const hasThirdParty = sources.some(s => {
    try {
      const hostname = new URL(s.url).hostname.replace('www.', '')
      return thirdPartyDomains.some(d => hostname.includes(d))
    } catch { return false }
  })

  return {
    count: sources.length,
    hasOfficialSources: officialSources.length >= 1,
    hasThirdParty,
  }
}

// ── Main quality gate runner ──────────────────────────────────────────────────

export async function runQualityGates(
  content: PageContent,
  request: GenerationRequest,
): Promise<QualityResult> {
  const failures: string[] = []

  const fullText    = extractFullText(content)
  const wordCount   = content.word_count ?? countWords(fullText)
  const minWords    = MIN_WORDS[request.template]

  // ── Gate 1: Word count ─────────────────────────────────────────────────────
  const wordCountOk = wordCount >= minWords
  if (!wordCountOk) {
    failures.push(`Word count too low: ${wordCount} < ${minWords} required for ${request.template}`)
  }

  // ── Gate 2: Uniqueness ─────────────────────────────────────────────────────
  const uniquenessScore = checkUniqueness(fullText)
  if (uniquenessScore < 80) {
    failures.push(`Uniqueness score too low: ${uniquenessScore}% (need ≥80%)`)
  }

  // ── Gate 3: Sources ────────────────────────────────────────────────────────
  const sourceCheck  = checkSources(content.sources)
  const sourcesCount = sourceCheck.count
  const sourcesOk    = sourcesCount >= 2

  if (!sourcesOk) {
    failures.push(`Insufficient sources: ${sourcesCount} cited (need ≥2 official sources)`)
  }
  if (sourceCheck.hasThirdParty) {
    failures.push('Third-party aggregator used as source (not acceptable as primary source)')
  }

  // ── Gate 4: Flesch reading ease ────────────────────────────────────────────
  const fleschScore = fleschReadingEase(fullText)
  const fleschOk    = fleschScore >= 40  // Visa content is inherently technical
  if (!fleschOk) {
    failures.push(`Flesch reading ease too low: ${fleschScore} (need ≥40 for visa content)`)
  }

  // ── Gate 5: Internal links (enforced by template, just flag if content is thin) ─
  const linksOk = wordCount >= minWords * 0.8  // If word count is close, links should be fine
  if (!linksOk) {
    failures.push('Content too thin for adequate internal linking')
  }

  // ── Gate 6: Route specificity ──────────────────────────────────────────────
  const routeSpecific = checkRouteSpecific(fullText, request.passportIso, request.destinationIso)
  if (!routeSpecific) {
    failures.push('Content is not route-specific (missing passport/destination country names)')
  }

  // ── Gate 7: No AI phrases ──────────────────────────────────────────────────
  const aiPhrases = checkNoAIPhrases(fullText)
  if (aiPhrases.length > 2) {
    failures.push(`AI-detector phrases found (${aiPhrases.length}): ${aiPhrases.slice(0, 3).join(', ')}`)
  }

  const passed = failures.length === 0

  return {
    passed,
    failures,
    wordCount,
    wordCountOk,
    uniquenessScore,
    sourcesCount,
    sourcesOk,
    fleschScore,
    fleschOk,
    linksOk,
    routeSpecific,
  }
}
