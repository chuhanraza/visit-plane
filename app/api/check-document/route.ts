import { NextRequest, NextResponse } from 'next/server'

// ─── Rate limiting ──────────────────────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 3          // 3 free per IP per day (Pro = unlimited)
const WINDOW_MS  = 24 * 60 * 60 * 1000

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; used: number } {
  const now   = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT - 1, used: 1 }
  }
  if (entry.count >= RATE_LIMIT) return { allowed: false, remaining: 0, used: entry.count }
  entry.count++
  return { allowed: true, remaining: RATE_LIMIT - entry.count, used: entry.count }
}

// ─── Specialized prompts ────────────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10)

function buildPassportPrompt(country: string, criteria: Array<{ id: string; label: string; critical: boolean }>) {
  return `You are a passport validation expert with 15 years of embassy experience.

Today's date: ${TODAY}

Extract from this passport image:
- Full name (as printed)
- Nationality / issuing country
- Passport number
- Date of birth
- Date of expiry
- Gender
- Number of blank visa pages visible (estimate)

Evaluate EACH criterion below for a ${country} visa application:
${criteria.map(c => `- ${c.id}: "${c.label}" (critical: ${c.critical})`).join('\n')}

Special rules:
- For validity checks: count exact months from TODAY (${TODAY}) to expiry date
- If expiry is in the past: status = "fail" with "EXPIRED — expired [date]"
- If MRZ lines are partially obscured: status = "warning"
- If image is not a passport at all: return {"error":"not_a_passport","documentDetected":false}
- Be specific: state actual expiry dates, passport numbers (partially masked: first 2 + last 2 chars), nationalities

Return ONLY valid JSON — no markdown, no code blocks, no prose:
{
  "documentDetected": true,
  "documentType": "Pakistani Biometric Passport",
  "overallStatus": "pass",
  "criteria": [
    {"id":"is_passport","status":"pass","finding":"Pakistani biometric MRP confirmed — green cover, ICAO standard","suggestion":null},
    {"id":"validity_6mo","status":"pass","finding":"Expires 2028-03-14 — 22 months remaining (need 6+ for ${country})","suggestion":null},
    {"id":"readable","status":"pass","finding":"MRZ lines, name, DOB, and photo all clearly legible","suggestion":null},
    {"id":"blank_pages","status":"pass","finding":"Approximately 4 blank visa pages visible","suggestion":null},
    {"id":"not_damaged","status":"pass","finding":"No visible damage, tears, or water marks","suggestion":null}
  ],
  "generalNotes": "Biometric chip indicator present. Photo quality excellent.",
  "confidence": 92
}

Rule: overallStatus = "fail" if ANY critical criterion fails. "warning" if only non-critical fails. "pass" only if all pass.`
}

function buildPhotoPrompt(country: string, criteria: Array<{ id: string; label: string; critical: boolean }>) {
  return `You are a visa photo compliance expert trained on ICAO 9303 standards and country-specific embassy requirements.

Evaluate this photo for a ${country} visa application against these requirements:
- Background: white or very light grey (pure white preferred)
- Face: centered, taking up 70–80% of frame height, looking directly at camera
- Eyes: open, clearly visible, not obscured by hair or glasses
- Expression: neutral, mouth closed
- Glasses: NOT permitted per ICAO 2015 update (instant warning/fail)
- Head covering: only for verifiable religious/medical reasons
- Lighting: even, no harsh shadows on face or background
- Dimensions: portrait orientation, roughly 35×45mm ratio (width/height ≈ 0.78)
- Recency: photo appears current (not clearly aged, faded, or from an old ID)

Criteria to evaluate:
${criteria.map(c => `- ${c.id}: "${c.label}" (critical: ${c.critical})`).join('\n')}

Be specific: describe what you see (background color, face position, whether glasses are present, estimated lighting quality).
If image is not a photo of a person: return {"error":"not_a_photo","documentDetected":false}

Return ONLY valid JSON:
{
  "documentDetected": true,
  "documentType": "Visa Photo",
  "overallStatus": "pass",
  "criteria": [
    {"id":"white_background","status":"pass","finding":"Background is plain white — meets ${country} requirements","suggestion":null},
    {"id":"face_centered","status":"pass","finding":"Face centered, eyes open and looking at camera, good framing","suggestion":null},
    {"id":"no_glasses","status":"pass","finding":"No glasses detected","suggestion":null},
    {"id":"correct_size","status":"pass","finding":"Portrait orientation, aspect ratio appears standard (35×45mm format)","suggestion":null},
    {"id":"recent","status":"pass","finding":"Photo appears recent — good image quality, no fading","suggestion":null}
  ],
  "generalNotes": "Photo meets ICAO 9303 and ${country} embassy standards.",
  "confidence": 88
}`
}

function buildBankStatementPrompt(country: string, criteria: Array<{ id: string; label: string; critical: boolean }>) {
  return `You are a financial document validator with expertise in visa applications.

Today's date: ${TODAY}

Analyze this bank statement image for a ${country} visa application.

Extract if visible:
- Account holder name
- Bank name / institution
- Most recent transaction date
- Approximate balance or closing balance shown
- Date range of the statement
- Whether it has an official bank stamp or letterhead

Criteria to evaluate:
${criteria.map(c => `- ${c.id}: "${c.label}" (critical: ${c.critical})`).join('\n')}

For recency checks: calculate from TODAY (${TODAY}). A statement dated more than 3 months ago = fail for "recent_3mo".
For funds: if balance is visible, state the exact amount. If not visible, state "Balance not clearly visible".
If this is NOT a bank statement: return {"error":"not_a_bank_statement","documentDetected":false}

Return ONLY valid JSON (no markdown):
{
  "documentDetected": true,
  "documentType": "Bank Statement",
  "overallStatus": "pass",
  "criteria": [{"id":"...","status":"pass","finding":"specific finding","suggestion":null}],
  "generalNotes": "Official bank letterhead from [Bank Name]. Statement covers [date range].",
  "confidence": 85
}`
}

function buildTravelInsurancePrompt(country: string, criteria: Array<{ id: string; label: string; critical: boolean }>) {
  return `You are a travel insurance document validator specializing in visa applications.

Today's date: ${TODAY}

Analyze this travel insurance document for a ${country} visa application.

Look for:
- Insurance provider / company name
- Policy holder name
- Coverage amount (look for currency + number, e.g., €30,000)
- Coverage territory (does it mention Schengen, Europe, or the specific country?)
- Policy start and end dates
- Whether medical evacuation is included
- Emergency contact numbers (indicates legitimate policy)

Criteria to evaluate:
${criteria.map(c => `- ${c.id}: "${c.label}" (critical: ${c.critical})`).join('\n')}

Be specific about coverage amounts. For Schengen: minimum required is €30,000.
If this is NOT an insurance document: return {"error":"not_insurance","documentDetected":false}

Return ONLY valid JSON (no markdown):
{
  "documentDetected": true,
  "documentType": "Travel Insurance Policy",
  "overallStatus": "pass",
  "criteria": [{"id":"...","status":"pass","finding":"specific finding","suggestion":null}],
  "generalNotes": "Policy from [Provider]. Coverage: [amount]. Valid [dates].",
  "confidence": 87
}`
}

function buildHotelBookingPrompt(country: string, criteria: Array<{ id: string; label: string; critical: boolean }>) {
  return `You are a travel document validator reviewing hotel booking confirmations for visa applications.

Today's date: ${TODAY}

Analyze this hotel booking confirmation for a ${country} visa application.

Look for:
- Booking/confirmation number or reference code
- Hotel name and address (or city at minimum)
- Check-in date
- Check-out date
- Guest name(s) on the booking
- Booking platform or hotel's own confirmation

Criteria to evaluate:
${criteria.map(c => `- ${c.id}: "${c.label}" (critical: ${c.critical})`).join('\n')}

State the actual confirmation number (partial is fine), dates, and hotel name if visible.
If this is NOT a hotel booking: return {"error":"not_hotel_booking","documentDetected":false}

Return ONLY valid JSON:
{
  "documentDetected": true,
  "documentType": "Hotel Booking Confirmation",
  "overallStatus": "pass",
  "criteria": [{"id":"...","status":"pass","finding":"specific finding","suggestion":null}],
  "generalNotes": "Booking confirmed at [Hotel], [City]. Confirmation #[ref].",
  "confidence": 90
}`
}

function buildFlightBookingPrompt(country: string, criteria: Array<{ id: string; label: string; critical: boolean }>) {
  return `You are a travel document validator reviewing flight itineraries for visa applications.

Today's date: ${TODAY}

Analyze this flight booking or itinerary for a ${country} visa application.

Look for:
- Passenger name(s)
- Outbound flight: airline, flight number, departure date, origin → destination
- Return flight: airline, flight number, return date, origin → destination
- Booking reference / PNR code
- Whether it's a confirmed booking or just a hold/itinerary

Criteria to evaluate:
${criteria.map(c => `- ${c.id}: "${c.label}" (critical: ${c.critical})`).join('\n')}

For visas: both outbound AND return flights must be present.
State actual flight numbers, dates, and passenger name (partial for privacy).
If this is NOT a flight itinerary: return {"error":"not_flight_itinerary","documentDetected":false}

Return ONLY valid JSON:
{
  "documentDetected": true,
  "documentType": "Flight Itinerary",
  "overallStatus": "pass",
  "criteria": [{"id":"...","status":"pass","finding":"specific finding","suggestion":null}],
  "generalNotes": "Round-trip confirmed. PNR: [code]. [Airline] flights.",
  "confidence": 91
}`
}

function buildGenericPrompt(documentType: string, country: string, criteria: Array<{ id: string; label: string; critical: boolean }>) {
  return `You are an expert visa document reviewer with 15 years of embassy experience.

Today's date: ${TODAY}

You are analyzing a ${documentType} submitted for a ${country} visa application.

Evaluate EACH criterion listed below. Be specific — state actual dates, names, numbers, and colors you observe.

Criteria:
${criteria.map(c => `- ${c.id}: "${c.label}" (critical: ${c.critical})`).join('\n')}

Return ONLY valid JSON — no markdown, no code blocks, no extra text:
{
  "documentDetected": true,
  "documentType": "what you see",
  "overallStatus": "pass",
  "criteria": [{"id":"...","status":"pass","finding":"specific finding","suggestion":null}],
  "generalNotes": "any important observations",
  "confidence": 85
}

Rules:
- overallStatus = "fail" if ANY critical criterion fails
- "warning" if only non-critical criteria fail
- "pass" only if all criteria pass
- For suggestions: be actionable — tell user exactly what to fix and how`
}

function getPrompt(documentType: string, country: string, criteria: Array<{ id: string; label: string; critical: boolean }>): string {
  const type = documentType.toLowerCase()
  if (type.includes('passport') && !type.includes('photo')) return buildPassportPrompt(country, criteria)
  if (type.includes('photo') || type.includes('photograph')) return buildPhotoPrompt(country, criteria)
  if (type.includes('bank') || type.includes('statement') || type.includes('financial')) return buildBankStatementPrompt(country, criteria)
  if (type.includes('insurance')) return buildTravelInsurancePrompt(country, criteria)
  if (type.includes('hotel') || type.includes('accommodation') || type.includes('booking')) return buildHotelBookingPrompt(country, criteria)
  if (type.includes('flight') || type.includes('itinerary') || type.includes('ticket')) return buildFlightBookingPrompt(country, criteria)
  return buildGenericPrompt(documentType, country, criteria)
}

// ─── AI providers ───────────────────────────────────────────────────────────
async function callGemini(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  // Try 2.0 Flash first, fall back to 1.5 Flash
  let model
  try {
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: mimeType as 'image/jpeg'|'image/png'|'image/webp', data: imageBase64 } },
    ])
    return result.response.text()
  } catch {
    // Fallback to 1.5 Flash if 2.0 not available
    model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent([
      prompt,
      { inlineData: { mimeType: mimeType as 'image/jpeg'|'image/png'|'image/webp', data: imageBase64 } },
    ])
    return result.response.text()
  }
}

async function callAnthropic(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1500,
    messages: [{
      role: 'user',
      content: [
        { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg'|'image/png'|'image/webp'|'image/gif', data: imageBase64 } },
        { type: 'text', text: prompt },
      ],
    }],
  })
  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}

function parseAIResponse(text: string) {
  // Strip any markdown code fences
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()
  return JSON.parse(cleaned)
}

// ─── Main handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'

  const { allowed, remaining, used } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: 'daily_limit_reached', message: "You've used all 3 free document checks for today. Upgrade to VisitPlane Pro for unlimited checks.", used, remaining: 0 },
      { status: 429 }
    )
  }

  let body: {
    imageBase64?: string
    mimeType?: string
    documentType?: string
    country?: string
    criteria?: Array<{ id: string; label: string; critical: boolean }>
  }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'invalid_json', message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const { imageBase64, mimeType, documentType, country, criteria } = body
  if (!imageBase64 || typeof imageBase64 !== 'string')
    return NextResponse.json({ error: 'missing_image', message: 'Image data is required.' }, { status: 400 })
  if (!mimeType || !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType))
    return NextResponse.json({ error: 'invalid_mime', message: 'Image must be JPEG, PNG, or WebP.' }, { status: 400 })
  if (!documentType || typeof documentType !== 'string')
    return NextResponse.json({ error: 'missing_doc_type', message: 'Document type is required.' }, { status: 400 })
  if (!country || typeof country !== 'string')
    return NextResponse.json({ error: 'missing_country', message: 'Country is required.' }, { status: 400 })
  if (!criteria || !Array.isArray(criteria) || criteria.length === 0)
    return NextResponse.json({ error: 'missing_criteria', message: 'Criteria array is required.' }, { status: 400 })
  if (imageBase64.length > 14_000_000)
    return NextResponse.json({ error: 'image_too_large', message: 'Image is too large. Please use a file under 10MB.' }, { status: 413 })

  const prompt = getPrompt(documentType, country, criteria)
  let rawText = ''
  let usedProvider = ''

  try {
    if (process.env.GEMINI_API_KEY) {
      rawText = await callGemini(imageBase64, mimeType, prompt)
      usedProvider = 'gemini'
    } else if (process.env.ANTHROPIC_API_KEY) {
      rawText = await callAnthropic(imageBase64, mimeType, prompt)
      usedProvider = 'anthropic'
    } else {
      return NextResponse.json(
        { error: 'no_ai_key', message: 'AI analysis is not configured.' },
        { status: 503 }
      )
    }
  } catch (aiError) {
    // Gemini failed — try Anthropic fallback
    if (usedProvider === 'gemini' && process.env.ANTHROPIC_API_KEY) {
      try {
        rawText = await callAnthropic(imageBase64, mimeType, prompt)
        usedProvider = 'anthropic'
      } catch {
        console.error('[check-document] Both AI providers failed')
        return NextResponse.json(
          { error: 'ai_error', message: 'AI reviewer is temporarily unavailable. Please try again in a moment.' },
          { status: 502 }
        )
      }
    } else {
      console.error(`[check-document] AI call failed:`, aiError)
      return NextResponse.json(
        { error: 'ai_error', message: 'AI reviewer is temporarily unavailable. Please try again.' },
        { status: 502 }
      )
    }
  } finally {
    body.imageBase64 = undefined
  }

  let parsed: {
    documentDetected: boolean
    documentType: string
    overallStatus: 'pass' | 'warning' | 'fail'
    criteria: Array<{ id: string; status: 'pass' | 'warning' | 'fail'; finding: string; suggestion: string | null }>
    generalNotes: string
    confidence: number
    error?: string
  }

  try {
    parsed = parseAIResponse(rawText)
  } catch {
    // Retry once with stricter instruction
    try {
      const strictPrompt = prompt + '\n\nCRITICAL: Your ENTIRE response must be a single valid JSON object. Nothing before or after the JSON.'
      if (usedProvider === 'gemini') {
        rawText = await callGemini(imageBase64 ?? '', mimeType ?? '', strictPrompt)
      } else {
        rawText = await callAnthropic(imageBase64 ?? '', mimeType ?? '', strictPrompt)
      }
      parsed = parseAIResponse(rawText)
    } catch {
      return NextResponse.json(
        { error: 'parse_error', message: "Couldn't read the AI response. Please try uploading the image again — a clearer photo usually helps." },
        { status: 500 }
      )
    }
  }

  // Compute weighted score
  let totalPoints = 0, earnedPoints = 0
  for (const c of criteria) {
    const weight  = c.critical ? 2 : 1
    const result  = parsed.criteria?.find(r => r.id === c.id)
    const status  = result?.status ?? 'fail'
    totalPoints  += weight
    if (status === 'pass')    earnedPoints += weight
    if (status === 'warning') earnedPoints += weight * 0.5
  }
  const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

  return NextResponse.json(
    { ...parsed, score, provider: usedProvider, checksRemaining: remaining, checksUsed: used },
    { status: 200 }
  )
}
