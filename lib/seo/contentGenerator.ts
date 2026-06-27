/**
 * Visitplane — Gemini Flash Content Generation Pipeline
 *
 * Generates unique, high-quality SEO content for all 4 programmatic templates.
 * Uses Gemini 1.5 Flash with Google Search grounding for real-time fact verification.
 *
 * Architecture:
 *  - generatePageContent()  → single page generation
 *  - batchGenerate()        → bulk pipeline for scaling to 50K pages
 *  - Content cached in seo_page_content Supabase table
 *  - Quality gates run automatically; failures go to review queue
 */

import { getServiceClient } from '@/lib/supabase/admin'
import { COUNTRIES, BY_ISO3 } from './countries'
import { runQualityGates, type QualityResult } from './qualityGates'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Template = 'template1' | 'template2' | 'template3' | 'template4'

export type ContentGenerationRequest = {
  template: Template
  passportIso: string       // ISO 3166-1 alpha-3
  destinationIso?: string   // optional for passport-only templates
  forceRegenerate?: boolean
}

export type GeneratedContent = {
  title: string
  meta_description: string
  h1: string
  intro_paragraph: string  // 200+ words, unique per route
  sections: ContentSection[]
  faq: FAQItem[]
  sources: ContentSource[]
  word_count: number
}

type ContentSection = {
  heading: string
  content: string
}

type FAQItem = {
  question: string
  answer: string
}

type ContentSource = {
  label: string
  url: string
  type: 'mofa' | 'embassy' | 'evisa_portal' | 'official' | 'other'
}

// ─── Groq client (OpenAI-compatible, free tier: 14,400 req/day) ──────────────

async function callGroq(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set — get a free key at console.groq.com')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a senior travel writer and visa expert. Always respond with valid JSON only — no markdown, no preamble, no explanation.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error ${res.status}: ${err}`)
  }

  const data = await res.json() as { choices: Array<{ message: { content: string } }> }
  return data.choices[0].message.content
}

function getSupabase() {
  return getServiceClient()
}

// ─── Prompt templates ─────────────────────────────────────────────────────────

function buildPrompt(template: Template, passportCountry: { name: string; nationality: string }, destinationCountry?: { name: string }): string {
  const year = new Date().getFullYear()
  const passport    = passportCountry.name
  const nationality = passportCountry.nationality
  const destination = destinationCountry?.name ?? 'multiple destinations'

  const baseConstraints = `
CONSTRAINTS (NON-NEGOTIABLE):
- Do NOT use generic phrasing that could apply to any route
- Include specific facts: exact fees, processing times, embassy contacts
- Cite at least 2 official sources (MOFA, embassy website, or official eVisa portal)
- DO NOT cite third-party visa aggregator sites (iVisa, Atlys, VisaHQ etc.) as primary sources
- Use second-person voice ("you")
- Avoid AI-detector-prone phrases: "delve into", "in conclusion", "it's important to note", "navigating", "comprehensive guide"
- Include 1 personal-feeling insight per section starting with "Many travelers don't realize..."
- Every claim must be verifiable — flag anything uncertain with [VERIFY]
- Output format: valid JSON only, no markdown, no preamble
`

  if (template === 'template1') {
    return `
ROLE: Senior travel writer with 15 years of visa expertise. You are writing for ${passport} citizens planning to visit ${destination}.

TASK: Write a unique, high-quality VISA REQUIREMENTS page for the route: ${passport} → ${destination} (${year}).

${baseConstraints}

TARGET LENGTH: 800-1200 words across all content.

REQUIRED JSON STRUCTURE:
{
  "title": "Visa Requirements for ${passport} Citizens Traveling to ${destination} (${year})",
  "meta_description": "...[150-160 chars, includes: nationality, destination, visa type, year]...",
  "h1": "Visa Requirements for ${passport} Citizens Traveling to ${destination}",
  "intro_paragraph": "...[200+ words, unique to this route, mentions visa type, key requirement, specific insight about this corridor. MUST NOT be reusable for any other route]...",
  "sections": [
    {
      "heading": "Current ${destination} Visa Status for ${passport} Passport Holders",
      "content": "...[current visa category with specific details, fee in exact amount, processing time]..."
    },
    {
      "heading": "Required Documents",
      "content": "...[route-specific document requirements, not generic]..."
    },
    {
      "heading": "Application Process",
      "content": "...[step-by-step, specific to this corridor]..."
    },
    {
      "heading": "Processing Times & Fees",
      "content": "...[exact figures, multiple fee scenarios if applicable]..."
    },
    {
      "heading": "Common Rejection Reasons",
      "content": "...[specific to ${passport}→${destination} route if known, else general with insight]..."
    }
  ],
  "faq": [
    {"question": "Do ${passport} citizens need a visa for ${destination}?", "answer": "..."},
    {"question": "How long does it take to get a ${destination} visa from ${passport}?", "answer": "..."},
    {"question": "What documents do ${passport} citizens need for ${destination}?", "answer": "..."},
    {"question": "How much does a ${destination} visa cost for ${passport} citizens?", "answer": "..."},
    {"question": "Can ${passport} citizens get a ${destination} visa on arrival?", "answer": "..."}
  ],
  "sources": [
    {"label": "...", "url": "...", "type": "embassy"},
    {"label": "...", "url": "...", "type": "mofa"}
  ]
}
`
  }

  if (template === 'template4') {
    return `
ROLE: Senior travel writer with deep visa expertise writing an EVERGREEN GUIDE for ${passport} citizens visiting ${destination} (${year}).

TASK: Write a comprehensive, human-friendly ${destination} visa guide specifically for ${passport} citizens. This is the definitive guide for someone searching "${destination} visa for ${nationality}".

${baseConstraints}

TARGET LENGTH: 1500-2500 words across all content.

REQUIRED JSON STRUCTURE:
{
  "title": "${destination} Visa Guide for ${passport} Citizens (${year}) — Complete Handbook",
  "meta_description": "...[150-160 chars, conversational, includes: ${nationality}, ${destination} visa, year, key benefit/insight]...",
  "h1": "${destination} Visa Guide for ${passport} Citizens (${year})",
  "intro_paragraph": "...[250+ words, conversational and specific to this corridor. Include: the current visa type, one surprising fact about this route that most travelers don't know, and what this guide will cover. Use 'you' throughout]...",
  "sections": [
    {
      "heading": "What ${passport} Citizens Need to Know First",
      "content": "...[TL;DR style — most important facts upfront. Specific visa type, current fee, processing time. Include corridor-specific insight]..."
    },
    {
      "heading": "Visa Types Available for ${passport} Passport Holders",
      "content": "...[tourist, business, transit, student options. Specific fees for each]..."
    },
    {
      "heading": "Complete Document Checklist",
      "content": "...[mandatory vs recommended. Route-specific requirements if any. Photo specifications, bank balance requirements]..."
    },
    {
      "heading": "Step-by-Step Application Guide",
      "content": "...[detailed walkthrough. Include specific URL for official application portal. Timeline of steps]..."
    },
    {
      "heading": "Processing Times: What to Really Expect",
      "content": "...[official times vs real-world experience. Peak vs off-peak. Tips to speed up]..."
    },
    {
      "heading": "Fee Breakdown",
      "content": "...[visa fee + service charges + optional costs. Total cost range]..."
    },
    {
      "heading": "Common Mistakes ${passport} Citizens Make",
      "content": "...[route-specific pitfalls. Specific things that trip up this nationality for this destination]..."
    },
    {
      "heading": "What to Do If Your Application Is Rejected",
      "content": "...[practical steps. When to appeal vs reapply. How to strengthen reapplication]..."
    }
  ],
  "faq": [
    {"question": "Do ${passport} citizens need a visa for ${destination}?", "answer": "..."},
    {"question": "How long can ${passport} citizens stay in ${destination}?", "answer": "..."},
    {"question": "What is the ${destination} visa fee for ${passport} citizens in ${year}?", "answer": "..."},
    {"question": "How long does ${destination} visa processing take for ${passport} citizens?", "answer": "..."},
    {"question": "What documents do ${passport} citizens need for a ${destination} visa?", "answer": "..."},
    {"question": "Can ${passport} citizens get a ${destination} visa on arrival?", "answer": "..."},
    {"question": "Is travel insurance required for ${passport} citizens visiting ${destination}?", "answer": "..."},
    {"question": "What are the most common rejection reasons for ${passport} citizens applying for a ${destination} visa?", "answer": "..."},
    {"question": "Can I extend my ${destination} visa as a ${passport} citizen?", "answer": "..."},
    {"question": "Where do ${passport} citizens apply for a ${destination} visa?", "answer": "..."}
  ],
  "sources": [
    {"label": "...", "url": "...", "type": "embassy"},
    {"label": "...", "url": "...", "type": "evisa_portal"}
  ]
}
`
  }

  if (template === 'template2') {
    return `
ROLE: Travel data analyst writing a VISA-FREE COUNTRIES overview for ${passport} passport holders (${year}).

TASK: Write unique content for the "${passport} passport visa-free countries" page.

${baseConstraints}
TARGET LENGTH: 600-900 words.

REQUIRED JSON STRUCTURE:
{
  "title": "Visa-Free Countries for ${passport} Passport Holders (${year})",
  "meta_description": "...[150-160 chars, includes count of visa-free countries if known, year]...",
  "h1": "Visa-Free Countries for ${passport} Passport Holders (${year})",
  "intro_paragraph": "...[200+ words specific to ${passport} passport. Include: total visa-free count if known, Henley Index ranking or equivalent, notable recent changes, standout easy destinations]...",
  "sections": [
    {
      "heading": "${passport} Passport Power: ${year} Overview",
      "content": "...[passport strength, ranking, comparison to regional neighbors, recent changes]..."
    },
    {
      "heading": "Top Visa-Free Destinations for ${passport} Holders",
      "content": "...[highlight 5-8 popular destinations with specific entry conditions]..."
    },
    {
      "heading": "Visa on Arrival Options",
      "content": "...[countries offering VOA to ${passport} holders with fees]..."
    },
    {
      "heading": "eVisa Options",
      "content": "...[countries with eVisa available for ${passport} holders, cost and processing]..."
    },
    {
      "heading": "How to Maximize Travel with a ${passport} Passport",
      "content": "...[practical tips: best regions to travel, countries where ${passport} holders get easier access, any travel corridors or bilateral agreements]..."
    }
  ],
  "faq": [
    {"question": "How many countries can ${passport} citizens visit visa-free?", "answer": "..."},
    {"question": "Which countries offer visa on arrival to ${passport} passport holders?", "answer": "..."},
    {"question": "What is the Henley Passport Index ranking for ${passport}?", "answer": "..."},
    {"question": "Has the ${passport} passport gotten stronger or weaker recently?", "answer": "..."},
    {"question": "What are the easiest countries for ${passport} holders to visit?", "answer": "..."}
  ],
  "sources": [
    {"label": "Henley Passport Index", "url": "https://www.henleypassportindex.com", "type": "official"},
    {"label": "...", "url": "...", "type": "mofa"}
  ]
}
`
  }

  // template3
  return `
ROLE: Travel finance writer creating a CHEAPEST VISAS guide for ${passport} passport holders (${year}).

TASK: Write unique content for the "cheapest visa destinations from ${passport}" page.

${baseConstraints}
TARGET LENGTH: 500-800 words.

REQUIRED JSON STRUCTURE:
{
  "title": "Cheapest Visa Destinations for ${passport} Passport Holders (${year})",
  "meta_description": "...[150-160 chars, budget travel angle, ${passport} specific]...",
  "h1": "Cheapest Visa Destinations from ${passport} in ${year}",
  "intro_paragraph": "...[150+ words. Budget travel insight for ${passport} holders. Include: cheapest free option, cheapest paid option, total trip cost context]...",
  "sections": [
    {
      "heading": "Free Entry: Best Visa-Free Destinations for ${passport} Holders",
      "content": "...[5-8 visa-free countries with notable features and travel costs]..."
    },
    {
      "heading": "Under $30: Cheapest Paid Visas",
      "content": "...[specific countries with visa fees under $30, with exact amounts]..."
    },
    {
      "heading": "Best Value Destinations (Low Visa Fee + Low Cost of Living)",
      "content": "...[combination of cheap visa AND cheap destination]..."
    }
  ],
  "faq": [
    {"question": "What is the cheapest country to visit on a ${passport} passport?", "answer": "..."},
    {"question": "Which countries are visa-free for ${passport} citizens?", "answer": "..."},
    {"question": "What is the cheapest visa available for ${passport} holders?", "answer": "..."},
    {"question": "Can ${passport} holders travel to Southeast Asia cheaply?", "answer": "..."},
    {"question": "What are the best budget travel destinations for ${passport} passport holders?", "answer": "..."}
  ],
  "sources": [
    {"label": "...", "url": "...", "type": "official"}
  ]
}
`
}

// ─── Core generation function ─────────────────────────────────────────────────

export async function generatePageContent(
  req: ContentGenerationRequest,
): Promise<{ success: boolean; content?: GeneratedContent; error?: string; qualityResult?: QualityResult }> {
  const passportCountry     = BY_ISO3[req.passportIso]
  const destinationCountry  = req.destinationIso ? BY_ISO3[req.destinationIso] : undefined

  if (!passportCountry) return { success: false, error: `Unknown passport ISO: ${req.passportIso}` }
  if (req.destinationIso && !destinationCountry) return { success: false, error: `Unknown destination ISO: ${req.destinationIso}` }

  const prompt = buildPrompt(req.template, passportCountry, destinationCountry)

  try {
    const text = await callGroq(prompt)

    let content: GeneratedContent
    try {
      content = JSON.parse(text)
    } catch {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = text.match(/```json\s*([\s\S]+?)\s*```/) ?? text.match(/\{[\s\S]+\}/)
      if (!jsonMatch) return { success: false, error: 'Failed to parse Groq JSON response' }
      content = JSON.parse(jsonMatch[1] ?? jsonMatch[0])
    }

    // Calculate word count
    const allText = [
      content.intro_paragraph,
      ...content.sections.map(s => `${s.heading} ${s.content}`),
      ...content.faq.map(f => `${f.question} ${f.answer}`),
    ].join(' ')
    content.word_count = allText.split(/\s+/).filter(Boolean).length

    // Run quality gates
    const qualityResult = await runQualityGates(content, req)

    return { success: true, content, qualityResult }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { success: false, error: message }
  }
}

// ─── Save to Supabase ─────────────────────────────────────────────────────────

export async function saveGeneratedContent(
  req: ContentGenerationRequest,
  content: GeneratedContent,
  qualityResult: QualityResult,
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase()

  // Build URL slug
  const passportCountry    = BY_ISO3[req.passportIso]
  const destinationCountry = req.destinationIso ? BY_ISO3[req.destinationIso] : undefined
  const slug = buildSlug(req.template, passportCountry, destinationCountry)

  const record = {
    template:            req.template,
    passport_iso:        req.passportIso,
    destination_iso:     req.destinationIso ?? null,
    url_slug:            slug,
    title:               content.title,
    meta_description:    content.meta_description,
    h1:                  content.h1,
    intro_paragraph:     content.intro_paragraph,
    content_json:        content,
    word_count:          content.word_count,

    quality_passed:          qualityResult.passed,
    quality_uniqueness:      qualityResult.uniquenessScore,
    quality_sources_count:   qualityResult.sourcesCount,
    quality_min_words_ok:    qualityResult.wordCountOk,
    quality_links_ok:        qualityResult.linksOk,
    quality_notes:           qualityResult.failures.join(', ') || null,

    generation_status: qualityResult.passed ? 'published' : 'review_needed',
    generation_attempt: 1,
    generated_at: new Date().toISOString(),
    published: qualityResult.passed,
    published_at: qualityResult.passed ? new Date().toISOString() : null,
  }

  const { error } = await supabase
    .from('seo_page_content')
    .upsert(record, { onConflict: 'url_slug' })

  if (error) return { success: false, error: error.message }
  return { success: true }
}

function buildSlug(
  template: Template,
  passport: { name: string; slug: string; nationality: string; nounPlural?: string } | undefined,
  destination: { name: string; slug: string } | undefined,
): string {
  if (!passport) return 'unknown'
  switch (template) {
    case 'template1': return `visa-requirements-for-${passport.nationality}-citizens-to-${destination?.slug ?? 'unknown'}`
    case 'template2': return `visa-free-countries-for-${passport.nationality}-passport`
    case 'template3': return `cheapest-visa-from-${passport.nationality}-passport`
    case 'template4': return `${destination?.slug ?? 'unknown'}-visa-guide-for-${passport.nationality}s`
    default:          return 'unknown'
  }
}

// ─── Batch generation pipeline ────────────────────────────────────────────────

export type BatchOptions = {
  template: Template
  phase: 1 | 2 | 3 | 4  // 1=top50, 2=+500, 3=+2000, 4=full
  concurrency?: number   // parallel requests (default: 3)
  skipExisting?: boolean // skip if already generated
  onProgress?: (done: number, total: number, current: string) => void
}

/**
 * Phase definitions (from the spec):
 * Phase 1: Top 50 routes (Week 1)
 * Phase 2: +500 routes  (Week 2)
 * Phase 3: +2000 routes (Week 3)
 * Phase 4: Full matrix  (Week 4–8)
 */
export async function batchGenerate(opts: BatchOptions): Promise<{
  total: number
  succeeded: number
  failed: number
  reviewNeeded: number
}> {
  const { template, phase, concurrency = 3, skipExisting = true, onProgress } = opts
  const supabase  = getSupabase()

  // Get route pairs to generate
  const routes = getRoutesForPhase(template, phase)
  const stats  = { total: routes.length, succeeded: 0, failed: 0, reviewNeeded: 0 }

  // Skip already generated
  const toProcess: Array<typeof routes[0]> = []
  if (skipExisting) {
    for (const route of routes) {
      const slug = buildSlug(template, BY_ISO3[route.passportIso], route.destinationIso ? BY_ISO3[route.destinationIso] : undefined)
      const { data } = await supabase
        .from('seo_page_content')
        .select('id, generation_status')
        .eq('url_slug', slug)
        .single()
      if (!data || data.generation_status === 'failed') toProcess.push(route)
    }
  } else {
    toProcess.push(...routes)
  }

  // Process in batches
  let done = 0
  for (let i = 0; i < toProcess.length; i += concurrency) {
    const batch = toProcess.slice(i, i + concurrency)
    await Promise.all(batch.map(async (route) => {
      const label = `${route.passportIso}→${route.destinationIso ?? '(passport-only)'}`
      try {
        const result = await generatePageContent(route)
        if (result.success && result.content && result.qualityResult) {
          await saveGeneratedContent(route, result.content, result.qualityResult)
          if (result.qualityResult.passed) stats.succeeded++
          else stats.reviewNeeded++
        } else {
          stats.failed++
          // Log failure to DB
          await supabase.from('seo_page_content').upsert({
            template,
            passport_iso: route.passportIso,
            destination_iso: route.destinationIso ?? null,
            url_slug: buildSlug(template, BY_ISO3[route.passportIso], route.destinationIso ? BY_ISO3[route.destinationIso] : undefined),
            generation_status: 'failed',
            generation_error: result.error,
            generation_attempt: 1,
          }, { onConflict: 'url_slug' })
        }
      } catch (err) {
        stats.failed++
        console.error(`Failed ${label}:`, err)
      }
      done++
      onProgress?.(done, toProcess.length, label)
      // Rate limiting: 500ms between requests within batch
      await new Promise(r => setTimeout(r, 500))
    }))
  }

  return stats
}

// ─── Route pair definitions ────────────────────────────────────────────────────

function getRoutesForPhase(template: Template, phase: number): Array<ContentGenerationRequest> {
  const passportOnlyTemplates = ['template2', 'template3']
  const isPassportOnly = passportOnlyTemplates.includes(template)

  if (isPassportOnly) {
    // All 197 passports — split by phase
    const allPassports = COUNTRIES.map(c => c.iso3)
    const counts = { 1: 50, 2: 100, 3: 150, 4: allPassports.length }
    const limit  = counts[phase as keyof typeof counts] ?? allPassports.length
    return allPassports.slice(0, limit).map(passportIso => ({
      template,
      passportIso,
    }))
  }

  // Route-pair templates (template1 + template4)
  // Phase 1: Top 50 routes (hardcoded high-traffic)
  const TOP_50_PAIRS: Array<[string, string]> = [
    ['PAK', 'ARE'], ['PAK', 'SAU'], ['PAK', 'TUR'], ['PAK', 'THA'], ['PAK', 'MYS'],
    ['PAK', 'GBR'], ['PAK', 'DEU'], ['PAK', 'USA'], ['PAK', 'CHN'], ['PAK', 'QAT'],
    ['PAK', 'OMN'], ['PAK', 'BHR'], ['IND', 'ARE'], ['IND', 'USA'], ['IND', 'GBR'],
    ['IND', 'DEU'], ['IND', 'CAN'], ['IND', 'AUS'], ['IND', 'SGP'], ['IND', 'THA'],
    ['BGD', 'ARE'], ['BGD', 'SAU'], ['BGD', 'MYS'], ['BGD', 'GBR'], ['NGA', 'GBR'],
    ['NGA', 'USA'], ['NGA', 'DEU'], ['NGA', 'ARE'], ['IDN', 'SAU'], ['IDN', 'MYS'],
    ['IDN', 'JPN'], ['IDN', 'AUS'], ['PHL', 'JPN'], ['PHL', 'USA'], ['PHL', 'AUS'],
    ['PHL', 'KOR'], ['EGY', 'SAU'], ['EGY', 'ARE'], ['EGY', 'DEU'], ['USA', 'ARE'],
    ['USA', 'JPN'], ['GBR', 'ARE'], ['GBR', 'AUS'], ['DEU', 'ARE'], ['DEU', 'JPN'],
    ['CAN', 'ARE'], ['KEN', 'ARE'], ['ETH', 'ARE'], ['ZAF', 'ARE'], ['LKA', 'ARE'],
  ]

  if (phase === 1) {
    return TOP_50_PAIRS.map(([passportIso, destinationIso]) => ({ template, passportIso, destinationIso }))
  }

  // Phase 2+: Pull from DB routes
  // (In production, this queries the destinations table for all active routes)
  // For now return top 50 as base
  return TOP_50_PAIRS.map(([passportIso, destinationIso]) => ({ template, passportIso, destinationIso }))
}
