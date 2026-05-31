import { NextRequest, NextResponse } from 'next/server'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const WINDOW_MS  = 24 * 60 * 60 * 1000

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now   = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }
  if (entry.count >= RATE_LIMIT) return { allowed: false, remaining: 0 }
  entry.count++
  return { allowed: true, remaining: RATE_LIMIT - entry.count }
}

function buildPrompt(documentType: string, country: string, criteria: Array<{ id: string; label: string; critical: boolean }>) {
  return `You are an expert visa document reviewer with 15 years of experience at embassies worldwide. You are analyzing a ${documentType} submitted for a ${country} visa application.

Analyze this document image and evaluate EACH criterion below. Respond with ONLY a valid JSON object — no markdown, no code blocks, no extra text.

Criteria:
${criteria.map(c => `- ${c.id}: "${c.label}" (critical: ${c.critical})`).join('\n')}

JSON structure:
{
  "documentDetected": true,
  "documentType": "what you see",
  "overallStatus": "pass",
  "criteria": [{"id":"...","status":"pass","finding":"specific finding","suggestion":null}],
  "generalNotes": "any observations",
  "confidence": 85
}

Rules: Be specific (state actual expiry dates, fund amounts, exact colors). overallStatus "fail" if any critical criterion fails. "warning" if non-critical fails. "pass" only if all pass.`
}

function parseAIResponse(text: string) {
  const cleaned = text.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```\s*$/i,'').trim()
  return JSON.parse(cleaned)
}

async function callGemini(imageBase64: string, mimeType: string, prompt: string) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai')
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const result = await model.generateContent([
    prompt,
    { inlineData: { mimeType: mimeType as 'image/jpeg'|'image/png'|'image/webp', data: imageBase64 } },
  ])
  return result.response.text()
}

async function callAnthropic(imageBase64: string, mimeType: string, prompt: string) {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
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

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? 'unknown'
  const { allowed, remaining } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json({ error: 'daily_limit_reached', message: "You've reached your 10 free document checks for today." }, { status: 429 })
  }

  let body: { imageBase64?: string; mimeType?: string; documentType?: string; country?: string; criteria?: Array<{ id: string; label: string; critical: boolean }> }
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'invalid_json', message: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const { imageBase64, mimeType, documentType, country, criteria } = body
  if (!imageBase64 || typeof imageBase64 !== 'string') return NextResponse.json({ error: 'missing_image', message: 'Image data is required.' }, { status: 400 })
  if (!mimeType || !['image/jpeg','image/png','image/webp'].includes(mimeType)) return NextResponse.json({ error: 'invalid_mime', message: 'Image must be JPEG, PNG, or WebP.' }, { status: 400 })
  if (!documentType || typeof documentType !== 'string') return NextResponse.json({ error: 'missing_doc_type', message: 'Document type is required.' }, { status: 400 })
  if (!country || typeof country !== 'string') return NextResponse.json({ error: 'missing_country', message: 'Country is required.' }, { status: 400 })
  if (!criteria || !Array.isArray(criteria) || criteria.length === 0) return NextResponse.json({ error: 'missing_criteria', message: 'Criteria array is required.' }, { status: 400 })
  if (imageBase64.length > 14_000_000) return NextResponse.json({ error: 'image_too_large', message: 'Image is too large. Please use a file under 10MB.' }, { status: 413 })

  const prompt = buildPrompt(documentType, country, criteria)
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
      return NextResponse.json({ error: 'no_ai_key', message: 'AI analysis is not configured. Please add GEMINI_API_KEY to environment variables.' }, { status: 503 })
    }
  } catch (aiError) {
    console.error(`[check-document] AI call failed (${usedProvider}):`, aiError)
    return NextResponse.json({ error: 'ai_error', message: 'AI reviewer is temporarily unavailable. Please try again.' }, { status: 502 })
  } finally {
    body.imageBase64 = undefined
  }

  let parsed: { documentDetected: boolean; documentType: string; overallStatus: 'pass'|'warning'|'fail'; criteria: Array<{ id: string; status: 'pass'|'warning'|'fail'; finding: string; suggestion: string|null }>; generalNotes: string; confidence: number }
  try {
    parsed = parseAIResponse(rawText)
  } catch {
    try {
      const retry = prompt + '\n\nIMPORTANT: Respond ONLY with raw JSON, no other text.'
      rawText = usedProvider === 'gemini' ? await callGemini(imageBase64 ?? '', mimeType ?? '', retry) : await callAnthropic(imageBase64 ?? '', mimeType ?? '', retry)
      parsed = parseAIResponse(rawText)
    } catch {
      return NextResponse.json({ error: 'parse_error', message: "Couldn't read the AI response. Please try uploading the image again." }, { status: 500 })
    }
  }

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

  return NextResponse.json({ ...parsed, score, provider: usedProvider, checksRemaining: remaining }, { status: 200 })
}
