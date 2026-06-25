import { NextRequest, NextResponse } from 'next/server'
import { recordEvent } from '@/lib/admin/events'

// ── In-memory cache for Gemini results (24h TTL per state hash) ───────────────
const cache = new Map<string, { insight: string; ts: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

// ── IP-based rate limiting (10 wizard runs / IP / hour) ───────────────────────
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimits.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

function stateHash(passport: string, destination: string, purpose: string, duration: string): string {
  return `${passport}|${destination}|${purpose}|${duration}`
}

// ── Gemini Flash prompt ────────────────────────────────────────────────────────
async function callGemini(
  passport: string,
  destination: string,
  purpose: string,
  duration: string,
  travelDate: string,
  visaDataJson: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const prompt = `You are a visa expert. A ${passport} citizen wants to visit ${destination} for ${purpose}, staying ${duration} days${travelDate ? `, traveling on ${travelDate}` : ''}.

Given this visa data: ${visaDataJson}

Generate a concise, friendly response with exactly these 4 sections:
1. A 2-sentence personalized summary of their specific situation
2. Top 3 "things to know" specific to this passport/destination route
3. One practical warning or pro-tip
4. Estimated total trip cost hint (visa fee + rough flight/hotel estimate if possible)

Tone: friendly travel advisor. Use emoji sparingly. Total response under 250 words.`

  // Try current Gemini models in order (older ones are deprecated/retired).
  // Falls through to the next on any error; returns null if all fail.
  const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite']
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 800,
              temperature: 0.7,
              // Gemini 2.5 models "think" by default, which consumes the token
              // budget before producing text and truncates short answers.
              // Disable thinking for this lightweight task.
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
          signal: AbortSignal.timeout(8000), // 8s timeout
        }
      )
      if (!res.ok) {
        console.error(`Gemini ${model} error: ${res.status} ${await res.text().catch(() => '')}`)
        continue // try next model
      }
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text
    } catch (e) {
      console.error(`Gemini ${model} exception:`, e)
      // try next model
    }
  }
  return null // all models failed → fallback to no AI
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  // Rate limit check
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    )
  }

  let passport = '', destination = '', purpose = '', duration = '', travelDate = ''
  try {
    const body = await req.json()
    passport = body.passport ?? ''
    destination = body.destination ?? ''
    purpose = body.purpose ?? 'Tourism'
    duration = body.duration ?? '7'
    travelDate = body.travelDate ?? ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!passport || !destination) {
    return NextResponse.json({ error: 'passport and destination required' }, { status: 400 })
  }

  // Funnel-top capture (anonymous; best-effort, never blocks the wizard).
  void recordEvent({ metric: 'wizard.started', properties: { passport, destination, purpose } })

  // Check cache
  const hash = stateHash(passport, destination, purpose, duration)
  const cached = cache.get(hash)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ insight: cached.insight })
  }

  // Fetch visa data for context
  let visaDataJson = '{}'
  try {
    const params = new URLSearchParams({ passport, destination, purpose })
    const visaRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://visitplane.com'}/api/visa-data?${params}`,
      { next: { revalidate: 86400 } }
    )
    if (visaRes.ok) {
      visaDataJson = await visaRes.text()
    }
  } catch {
    // Continue without visa data context
  }

  // Try Gemini Flash
  const insight = await callGemini(passport, destination, purpose, duration, travelDate, visaDataJson)

  if (insight) {
    cache.set(hash, { insight, ts: Date.now() })
    return NextResponse.json({ insight })
  }

  // No Gemini key or Gemini failed → return empty insight
  // The result card (decision tree) is already shown; this is enhancement only
  return NextResponse.json({ insight: '' })
}
