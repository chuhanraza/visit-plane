#!/usr/bin/env node
/**
 * verify-visa-route.mjs
 * ─────────────────────────────────────────────────────────────────────────────
 * Verification pipeline for route-specific visa requirements.
 *
 * Flow:
 *   1. Call Gemini Flash (free tier, web search enabled) with structured prompt
 *   2. Parse & validate JSON against schema
 *   3. Cross-check against IATA Travel Centre (public scrape)
 *   4. Write to visa_requirements table via service role
 *   5. Log full audit trail to visa_pipeline_audit
 *
 * Usage:
 *   node scripts/verify-visa-route.mjs PAK ARE tourist
 *   node scripts/verify-visa-route.mjs --all-top20
 *   node scripts/verify-visa-route.mjs --overdue     (re-verify past next_review_due)
 *
 * Rate limiting: Gemini Flash free tier = 1,500 req/day ≈ 62/hr
 * The --all-top20 flag paces requests at 1 per 60 seconds to stay safe.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient }       from '@supabase/supabase-js'
import { readFileSync, existsSync, appendFileSync, mkdirSync } from 'fs'
import { resolve, dirname }   from 'path'
import { fileURLToPath }      from 'url'

// ─── Env ──────────────────────────────────────────────────────────────────────

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root      = resolve(__dirname, '..')

function loadEnv(filePath) {
  if (!existsSync(filePath)) return
  for (const line of readFileSync(filePath, 'utf-8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = val
  }
}
loadEnv(resolve(root, '.env.local'))
loadEnv(resolve(root, '.env'))

const GEMINI_API_KEY         = process.env.GEMINI_API_KEY
const SUPABASE_URL           = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!GEMINI_API_KEY)       { console.error('❌  Missing GEMINI_API_KEY');           process.exit(1) }
if (!SUPABASE_URL)         { console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL'); process.exit(1) }
if (!SUPABASE_SERVICE_KEY) { console.error('❌  Missing SUPABASE_SERVICE_ROLE_KEY'); process.exit(1) }

// ─── Clients ──────────────────────────────────────────────────────────────────

const genai    = new GoogleGenerativeAI(GEMINI_API_KEY)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ─── Constants ────────────────────────────────────────────────────────────────

// High-volatility destinations: review every 30 days instead of 90
const HIGH_VOLATILITY_ISO = new Set(['SAU', 'ARE', 'RUS', 'CHN', 'IND'])

// Top 20 routes: Pakistan to these destinations
const TOP_20_ROUTES = [
  { passport_iso: 'PAK', destination_iso: 'ARE', passport_name: 'Pakistani', destination_name: 'UAE',          destination_country: 'UAE' },
  { passport_iso: 'PAK', destination_iso: 'SAU', passport_name: 'Pakistani', destination_name: 'Saudi Arabia', destination_country: 'Saudi Arabia' },
  { passport_iso: 'PAK', destination_iso: 'TUR', passport_name: 'Pakistani', destination_name: 'Turkey',       destination_country: 'Turkey' },
  { passport_iso: 'PAK', destination_iso: 'THA', passport_name: 'Pakistani', destination_name: 'Thailand',     destination_country: 'Thailand' },
  { passport_iso: 'PAK', destination_iso: 'MYS', passport_name: 'Pakistani', destination_name: 'Malaysia',     destination_country: 'Malaysia' },
  { passport_iso: 'PAK', destination_iso: 'GBR', passport_name: 'Pakistani', destination_name: 'United Kingdom', destination_country: 'United Kingdom' },
  { passport_iso: 'PAK', destination_iso: 'DEU', passport_name: 'Pakistani', destination_name: 'Germany',      destination_country: 'Germany' },
  { passport_iso: 'PAK', destination_iso: 'USA', passport_name: 'Pakistani', destination_name: 'United States', destination_country: 'United States' },
  { passport_iso: 'PAK', destination_iso: 'CHN', passport_name: 'Pakistani', destination_name: 'China',        destination_country: 'China' },
  { passport_iso: 'PAK', destination_iso: 'SGP', passport_name: 'Pakistani', destination_name: 'Singapore',    destination_country: 'Singapore' },
  { passport_iso: 'PAK', destination_iso: 'IDN', passport_name: 'Pakistani', destination_name: 'Indonesia',    destination_country: 'Indonesia' },
  { passport_iso: 'PAK', destination_iso: 'LKA', passport_name: 'Pakistani', destination_name: 'Sri Lanka',    destination_country: 'Sri Lanka' },
  { passport_iso: 'PAK', destination_iso: 'MDV', passport_name: 'Pakistani', destination_name: 'Maldives',     destination_country: 'Maldives' },
  { passport_iso: 'PAK', destination_iso: 'QAT', passport_name: 'Pakistani', destination_name: 'Qatar',        destination_country: 'Qatar' },
  { passport_iso: 'PAK', destination_iso: 'OMN', passport_name: 'Pakistani', destination_name: 'Oman',         destination_country: 'Oman' },
  { passport_iso: 'PAK', destination_iso: 'AZE', passport_name: 'Pakistani', destination_name: 'Azerbaijan',   destination_country: 'Azerbaijan' },
  { passport_iso: 'PAK', destination_iso: 'GEO', passport_name: 'Pakistani', destination_name: 'Georgia',      destination_country: 'Georgia' },
  { passport_iso: 'PAK', destination_iso: 'JPN', passport_name: 'Pakistani', destination_name: 'Japan',        destination_country: 'Japan' },
  { passport_iso: 'PAK', destination_iso: 'KOR', passport_name: 'Pakistani', destination_name: 'South Korea',  destination_country: 'South Korea' },
  { passport_iso: 'PAK', destination_iso: 'NPL', passport_name: 'Pakistani', destination_name: 'Nepal',        destination_country: 'Nepal' },
]

// ─── Logging ──────────────────────────────────────────────────────────────────

const LOG_DIR = resolve(root, 'logs', 'visa-pipeline')
mkdirSync(LOG_DIR, { recursive: true })
const LOG_FILE = resolve(LOG_DIR, `run-${new Date().toISOString().slice(0, 10)}.jsonl`)

function logLine(obj) {
  appendFileSync(LOG_FILE, JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n')
}

function banner(msg) { console.log(`\n${'═'.repeat(60)}\n  ${msg}\n${'═'.repeat(60)}`) }
function ok(msg)     { console.log(`  ✅  ${msg}`) }
function warn(msg)   { console.log(`  ⚠️   ${msg}`) }
function err(msg)    { console.log(`  ❌  ${msg}`) }
function info(msg)   { console.log(`  ℹ️   ${msg}`) }

// ─── Schema ───────────────────────────────────────────────────────────────────
// Injected verbatim into the Gemini prompt so the model knows exactly what shape to return.

const SCHEMA_DESCRIPTION = `
{
  "passport_iso": "string (ISO 3166-1 alpha-3)",
  "destination_iso": "string (ISO 3166-1 alpha-3)",
  "purpose": "tourist | business | transit | student | work | family",
  "visa_category": "visa_free | visa_on_arrival | evisa | eta | visa_required | not_permitted | conditional",
  "max_stay_days": "integer or null",
  "multiple_entry": "boolean or null",
  "validity_days": "integer or null",
  "fee_amount": "decimal or null",
  "fee_currency": "ISO 4217 string or null",
  "fee_amount_usd": "decimal or null",
  "fee_is_free": "boolean",
  "fee_notes": "string or null",
  "processing_min_hours": "integer or null",
  "processing_max_hours": "integer or null",
  "processing_label": "string or null — human-readable e.g. '1–3 hours on arrival'",
  "passport_validity_months": "integer or null",
  "required_documents": [
    {
      "name": "string",
      "detail": "string — specific guidance e.g. 'Last 3 months, showing min AED 3,000 balance'",
      "mandatory": "boolean",
      "applies_when": "string or null — e.g. 'Only for employment visa holders'"
    }
  ],
  "eligibility_conditions": ["string"],
  "warnings": ["string"],
  "application_url": "string or null",
  "official_sources": [
    {
      "type": "mofa | embassy | evisa_portal | iata | other",
      "label": "string",
      "url": "string — exact URL",
      "verified_at": "YYYY-MM-DD",
      "is_authoritative": "boolean"
    }
  ],
  "unverified_fields": [
    {
      "field": "string",
      "reason": "string — why it could not be verified from primary sources"
    }
  ],
  "data_confidence": "high | medium | low",
  "data_confidence_reason": "string"
}
`

// ─── Step 1: Gemini call ──────────────────────────────────────────────────────

async function callGemini(route, purpose = 'tourist') {
  const { passport_iso, destination_iso, passport_name, destination_name, destination_country } = route
  const passportCountry  = passport_name.replace('i', '') // e.g. "Pakistan"

  const prompt = `ROLE: Senior immigration data analyst. Today's date: ${new Date().toISOString().slice(0,10)}.

TASK: For a ${passport_name} passport holder (passport ISO: ${passport_iso}) traveling to ${destination_name} (ISO: ${destination_iso}) for ${purpose}, find CURRENT visa requirements.

Use ONLY these source types:
- ${destination_name}'s Ministry of Foreign Affairs official site
- ${destination_name}'s embassy in Pakistan (or nearest Pakistani diplomatic mission)
- ${destination_name}'s official eVisa portal (if applicable)
- IATA Travel Centre (timaticweb2.com)

DO NOT use third-party visa aggregators (Atlys, iVisa, VisaHQ, Visitplane, Sherpa, etc.) as sources.

For required_documents, list ONLY documents actually required for THIS route via THIS application method:
- Visa-free routes: list only what border officers check (typically: valid passport, return ticket, proof of funds). Do NOT add documents not actually checked.
- eVisa routes: list only what the online portal actually requests when submitting. Do NOT add embassy-style documents that the portal doesn't ask for.
- Visa-on-arrival routes: list what officers check at the arrival counter.
- Embassy/consulate applications: list the full document set published by that specific embassy for Pakistani applicants.

CRITICAL: Pakistani passport holders applying for UAE visit visas apply via airline eVisa portals (Emirates, Air Arabia, Flydubai) or the ICP portal — NOT by submitting physical documents to an embassy. The required_documents for UAE must reflect the eVisa application, not a Schengen-style submission.

For each required_document, include "applies_when" if there is any conditionality. Set to null if it applies universally.

If you cannot verify a field from a primary source, set it to null (for scalar fields) or [] (for array fields), and add an entry to "unverified_fields" explaining why. NEVER guess fees, stay durations, or document lists.

Cite every fact: each field sourced from a URL must have a corresponding entry in "official_sources" with the exact URL.

Return STRICTLY valid JSON matching this schema — no markdown, no prose, no code fences, raw JSON only:

${SCHEMA_DESCRIPTION}

Add passport_iso: "${passport_iso}", destination_iso: "${destination_iso}", purpose: "${purpose}" to the response.`

  info(`Calling Gemini Flash for ${passport_iso}→${destination_iso} (${purpose})…`)

  // Use gemini-1.5-flash with Google Search grounding for up-to-date data
  const model = genai.getGenerativeModel({
    model: 'gemini-1.5-flash',
    tools: [{ googleSearch: {} }],
  })

  const result   = await model.generateContent(prompt)
  const rawText  = result.response.text()

  return rawText
}

// ─── Step 2: Parse & validate ─────────────────────────────────────────────────

const VALID_VISA_CATEGORIES = new Set([
  'visa_free', 'visa_on_arrival', 'evisa', 'eta', 'visa_required', 'not_permitted', 'conditional'
])
const VALID_PURPOSES = new Set(['tourist', 'business', 'transit', 'student', 'work', 'family'])
const VALID_CONFIDENCE = new Set(['high', 'medium', 'low'])

function parseAndValidate(rawText) {
  // Strip markdown code fences if present
  let cleaned = rawText.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
  }

  // Find first { to last } — model sometimes prepends prose
  const firstBrace = cleaned.indexOf('{')
  const lastBrace  = cleaned.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('No JSON object found in Gemini response')
  }
  cleaned = cleaned.slice(firstBrace, lastBrace + 1)

  let data
  try {
    data = JSON.parse(cleaned)
  } catch (e) {
    throw new Error(`JSON parse failed: ${e.message}`)
  }

  // Required field checks
  if (!data.visa_category || !VALID_VISA_CATEGORIES.has(data.visa_category)) {
    throw new Error(`Invalid or missing visa_category: "${data.visa_category}"`)
  }
  if (!data.purpose || !VALID_PURPOSES.has(data.purpose)) {
    throw new Error(`Invalid or missing purpose: "${data.purpose}"`)
  }
  if (!data.data_confidence || !VALID_CONFIDENCE.has(data.data_confidence)) {
    data.data_confidence = 'low'
    data.data_confidence_reason = (data.data_confidence_reason ?? '') + ' [auto-set to low: missing confidence field]'
  }
  if (!Array.isArray(data.required_documents)) {
    throw new Error('required_documents must be an array')
  }
  if (!Array.isArray(data.official_sources) || data.official_sources.length === 0) {
    warn('No official_sources returned — confidence degraded to low')
    data.data_confidence = 'low'
    data.data_confidence_reason = 'No official sources cited'
  }

  // Coerce types
  if (data.fee_amount !== null && data.fee_amount !== undefined) {
    data.fee_amount = parseFloat(data.fee_amount) || null
  }
  if (data.fee_amount_usd !== null && data.fee_amount_usd !== undefined) {
    data.fee_amount_usd = parseFloat(data.fee_amount_usd) || null
  }
  data.fee_is_free = Boolean(data.fee_is_free)

  return data
}

// ─── Step 3: IATA cross-check ─────────────────────────────────────────────────
// IATA Timatic is the authoritative travel document database used by airlines.
// We scrape the public-facing timaticweb2 interface.

async function iataCheck(passportIso, destinationIso) {
  // IATA Timatic uses 2-letter country codes (ISO 3166-1 alpha-2)
  // We need a mapping for the routes we care about
  const iso3toIso2 = {
    PAK: 'PK', ARE: 'AE', SAU: 'SA', TUR: 'TR', THA: 'TH', MYS: 'MY',
    GBR: 'GB', DEU: 'DE', USA: 'US', CHN: 'CN', SGP: 'SG', IDN: 'ID',
    LKA: 'LK', MDV: 'MV', QAT: 'QA', OMN: 'OM', AZE: 'AZ', GEO: 'GE',
    JPN: 'JP', KOR: 'KR', NPL: 'NP',
  }

  const nat  = iso3toIso2[passportIso]
  const dest = iso3toIso2[destinationIso]

  if (!nat || !dest) {
    warn(`IATA: No ISO2 mapping for ${passportIso} or ${destinationIso} — skipping cross-check`)
    return null
  }

  // IATA Timatic public query URL
  const url = `https://www.timaticweb2.com/integration/external_link?ref=TRIP&page=country&country=${dest}&type=passport&countryofresidence=${nat}&nationality=${nat}`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; VisitplaneBot/1.0; +https://visitplane.com)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15_000),
    })

    if (!res.ok) {
      warn(`IATA fetch failed: HTTP ${res.status}`)
      return null
    }

    const html = await res.text()

    // Parse out visa category signals from IATA HTML
    // IATA uses specific phrases we can key off
    const lowerHtml = html.toLowerCase()

    let iataCategory = null
    if (lowerHtml.includes('visa not required') || lowerHtml.includes('no visa required')) {
      iataCategory = 'visa_free'
    } else if (lowerHtml.includes('visa on arrival') || lowerHtml.includes('visa-on-arrival')) {
      iataCategory = 'visa_on_arrival'
    } else if (lowerHtml.includes('evisa') || lowerHtml.includes('e-visa') || lowerHtml.includes('electronic visa')) {
      iataCategory = 'evisa'
    } else if (lowerHtml.includes('visa required') || lowerHtml.includes('visa is required')) {
      iataCategory = 'visa_required'
    }

    // Parse max stay — look for "XX days" pattern near "stay" or "duration"
    const stayMatch = html.match(/(\d+)\s*days?/i)
    const iataMaxStay = stayMatch ? parseInt(stayMatch[1]) : null

    return {
      url,
      iataCategory,
      iataMaxStay,
      htmlLength: html.length,
      fetchedAt: new Date().toISOString(),
    }

  } catch (e) {
    warn(`IATA fetch error: ${e.message}`)
    return null
  }
}

// ─── Step 4+5: Write to DB + audit log ───────────────────────────────────────

async function writeToDB(data, iataSnapshot, diffNotes, flagged, flagReason) {
  const isHighVolatility = HIGH_VOLATILITY_ISO.has(data.destination_iso)
  const reviewDays       = isHighVolatility ? 30 : 90
  const nextReviewDue    = new Date(Date.now() + reviewDays * 86_400_000).toISOString()

  const record = {
    passport_iso:          data.passport_iso,
    destination_iso:       data.destination_iso,
    purpose:               data.purpose,
    visa_category:         data.visa_category,
    max_stay_days:         data.max_stay_days ?? null,
    multiple_entry:        data.multiple_entry ?? null,
    validity_days:         data.validity_days ?? null,
    fee_amount:            data.fee_amount ?? null,
    fee_currency:          data.fee_currency ?? null,
    fee_amount_usd:        data.fee_amount_usd ?? null,
    fee_is_free:           data.fee_is_free ?? false,
    fee_notes:             data.fee_notes ?? null,
    processing_min_hours:  data.processing_min_hours ?? null,
    processing_max_hours:  data.processing_max_hours ?? null,
    processing_label:      data.processing_label ?? null,
    passport_validity_months: data.passport_validity_months ?? null,
    required_documents:    data.required_documents ?? [],
    eligibility_conditions: data.eligibility_conditions ?? [],
    warnings:              data.warnings ?? [],
    application_url:       data.application_url ?? null,
    official_sources:      data.official_sources ?? [],
    unverified_fields:     data.unverified_fields ?? [],
    data_confidence:       data.data_confidence,
    data_confidence_reason: data.data_confidence_reason ?? null,
    verified_at:           new Date().toISOString(),
    next_review_due:       nextReviewDue,
  }

  const { data: upserted, error: upsertErr } = await supabase
    .from('visa_requirements')
    .upsert(record, { onConflict: 'passport_iso,destination_iso,purpose' })
    .select('id')
    .single()

  if (upsertErr) throw new Error(`DB upsert failed: ${upsertErr.message}`)

  const visaReqId = upserted?.id

  // Audit log
  const { error: auditErr } = await supabase
    .from('visa_pipeline_audit')
    .insert({
      passport_iso:       data.passport_iso,
      destination_iso:    data.destination_iso,
      purpose:            data.purpose,
      gemini_parsed_json: data,
      iata_snapshot:      iataSnapshot,
      diff_notes:         diffNotes,
      confidence_set:     data.data_confidence,
      flagged_for_review: flagged,
      flag_reason:        flagReason ?? null,
      visa_req_id:        visaReqId,
    })

  if (auditErr) warn(`Audit log insert failed: ${auditErr.message}`)

  return visaReqId
}

// ─── Main pipeline function ───────────────────────────────────────────────────

export async function verifyRoute(route, purpose = 'tourist', { dryRun = false } = {}) {
  const label = `${route.passport_iso}→${route.destination_iso} (${purpose})`
  banner(`Verifying: ${label}`)

  let geminiRaw  = null
  let parsed     = null
  let flagged    = false
  let flagReason = null
  let diffNotes  = null

  // Step 1: Gemini
  try {
    geminiRaw = await callGemini(route, purpose)
    ok(`Gemini responded (${geminiRaw.length} chars)`)
    logLine({ step: 'gemini_response', route: label, chars: geminiRaw.length })
  } catch (e) {
    err(`Gemini call failed: ${e.message}`)
    logLine({ step: 'gemini_error', route: label, error: e.message })
    return { success: false, error: e.message }
  }

  // Step 2: Parse + validate
  try {
    parsed = parseAndValidate(geminiRaw)
    // Inject route keys if Gemini didn't include them
    parsed.passport_iso    ??= route.passport_iso
    parsed.destination_iso ??= route.destination_iso
    ok(`JSON validated — category: ${parsed.visa_category}, confidence: ${parsed.data_confidence}`)
  } catch (e) {
    err(`Parse/validate failed: ${e.message}`)
    logLine({ step: 'parse_error', route: label, error: e.message, raw: geminiRaw.slice(0, 500) })
    return { success: false, error: e.message, raw: geminiRaw }
  }

  // Step 3: IATA cross-check
  const iataResult = await iataCheck(route.passport_iso, route.destination_iso)

  if (iataResult) {
    ok(`IATA fetched — category: ${iataResult.iataCategory ?? 'unclear'}, max_stay: ${iataResult.iataMaxStay ?? 'unclear'}`)

    const categoryMismatch = iataResult.iataCategory && iataResult.iataCategory !== parsed.visa_category
    const stayMismatch     = iataResult.iataMaxStay   && parsed.max_stay_days &&
                             Math.abs(iataResult.iataMaxStay - parsed.max_stay_days) > 5

    if (categoryMismatch || stayMismatch) {
      flagged    = true
      flagReason = []
      if (categoryMismatch) {
        flagReason.push(`Visa category mismatch: Gemini="${parsed.visa_category}" IATA="${iataResult.iataCategory}"`)
      }
      if (stayMismatch) {
        flagReason.push(`Max stay mismatch: Gemini=${parsed.max_stay_days}d IATA=${iataResult.iataMaxStay}d`)
      }
      flagReason = flagReason.join('; ')
      parsed.data_confidence = 'low'
      parsed.data_confidence_reason = (parsed.data_confidence_reason ?? '') + ` | IATA mismatch: ${flagReason}`
      warn(`⚑ Flagged for human review: ${flagReason}`)
    }

    diffNotes = JSON.stringify({
      gemini: { visa_category: parsed.visa_category, max_stay_days: parsed.max_stay_days },
      iata:   { visa_category: iataResult.iataCategory, max_stay_days: iataResult.iataMaxStay },
      mismatch: flagged,
    })
  } else {
    warn('IATA check unavailable — proceeding without cross-check')
    diffNotes = 'IATA check skipped'
  }

  // Step 4+5: Write to DB
  if (!dryRun) {
    try {
      const id = await writeToDB(parsed, iataResult, diffNotes, flagged, flagReason)
      ok(`Written to DB — id: ${id}`)
      logLine({ step: 'db_write', route: label, id, confidence: parsed.data_confidence, flagged })
    } catch (e) {
      err(`DB write failed: ${e.message}`)
      logLine({ step: 'db_error', route: label, error: e.message })
      return { success: false, error: e.message, parsed }
    }
  } else {
    info('Dry-run mode — skipping DB write')
    console.log('\n── DRY-RUN OUTPUT ──────────────────────────────────────')
    console.log(JSON.stringify(parsed, null, 2))
    console.log('────────────────────────────────────────────────────────\n')
  }

  return { success: true, parsed, flagged, flagReason, iataResult }
}

// ─── Rate-limited batch runner ────────────────────────────────────────────────

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function runAll(routes, purpose = 'tourist', delayMs = 62_000) {
  banner(`Running pipeline for ${routes.length} routes (${Math.ceil(delayMs/1000)}s between each)`)
  const results = []

  for (let i = 0; i < routes.length; i++) {
    const route = routes[i]
    info(`[${i + 1}/${routes.length}] Starting ${route.passport_iso}→${route.destination_iso}`)

    const result = await verifyRoute(route, purpose)
    results.push({ route: `${route.passport_iso}→${route.destination_iso}`, ...result })

    if (i < routes.length - 1) {
      info(`Waiting ${Math.ceil(delayMs/1000)}s before next request (Gemini rate limit)…`)
      await sleep(delayMs)
    }
  }

  // Summary
  banner('Batch Complete')
  const succeeded = results.filter(r => r.success).length
  const failed    = results.filter(r => !r.success).length
  const flaggedN  = results.filter(r => r.flagged).length
  console.log(`  ✅  Succeeded: ${succeeded}`)
  console.log(`  ❌  Failed:    ${failed}`)
  console.log(`  ⚑   Flagged:   ${flaggedN}`)
  console.log(`  📋  Log:       ${LOG_FILE}`)

  return results
}

// ─── Overdue re-verification ──────────────────────────────────────────────────

async function reVerifyOverdue() {
  const { data: overdue, error } = await supabase
    .from('visa_requirements')
    .select('passport_iso, destination_iso, purpose')
    .lt('next_review_due', new Date().toISOString())
    .order('next_review_due', { ascending: true })

  if (error) { err(`Failed to fetch overdue routes: ${error.message}`); process.exit(1) }
  if (!overdue?.length) { ok('No overdue routes — all up to date!'); return }

  info(`Found ${overdue.length} overdue routes`)

  // Build route objects from DB records
  const routes = overdue.map(r => ({
    passport_iso: r.passport_iso,
    destination_iso: r.destination_iso,
    passport_name: 'Pakistani',   // TODO: expand for multi-passport support
    destination_name: r.destination_iso,
    destination_country: r.destination_iso,
  }))

  for (const item of overdue) {
    const route = routes.find(r => r.passport_iso === item.passport_iso && r.destination_iso === item.destination_iso)
    await verifyRoute(route, item.purpose)
    await sleep(62_000)
  }
}

// ─── CLI entrypoint ───────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2)

  if (args.includes('--all-top20')) {
    await runAll(TOP_20_ROUTES, 'tourist')
    return
  }

  if (args.includes('--overdue')) {
    await reVerifyOverdue()
    return
  }

  // Single route: node verify-visa-route.mjs PAK ARE tourist [--dry-run]
  const passportIso    = args[0]?.toUpperCase()
  const destinationIso = args[1]?.toUpperCase()
  const purpose        = args[2] ?? 'tourist'
  const dryRun         = args.includes('--dry-run')

  if (!passportIso || !destinationIso) {
    console.log(`
Usage:
  node scripts/verify-visa-route.mjs <PASSPORT_ISO> <DEST_ISO> [purpose] [--dry-run]
  node scripts/verify-visa-route.mjs --all-top20
  node scripts/verify-visa-route.mjs --overdue

Examples:
  node scripts/verify-visa-route.mjs PAK ARE tourist --dry-run
  node scripts/verify-visa-route.mjs PAK GBR tourist
  node scripts/verify-visa-route.mjs --all-top20
    `)
    process.exit(1)
  }

  // Find matching route definition for display names
  const routeDef = TOP_20_ROUTES.find(
    r => r.passport_iso === passportIso && r.destination_iso === destinationIso
  ) ?? {
    passport_iso:     passportIso,
    destination_iso:  destinationIso,
    passport_name:    passportIso,
    destination_name: destinationIso,
    destination_country: destinationIso,
  }

  const result = await verifyRoute(routeDef, purpose, { dryRun })

  if (result.success) {
    ok(`Done — ${passportIso}→${destinationIso} verified`)
  } else {
    err(`Failed — ${result.error}`)
    process.exit(1)
  }
}

main().catch(e => {
  err(`Unhandled error: ${e.message}`)
  console.error(e)
  process.exit(1)
})
