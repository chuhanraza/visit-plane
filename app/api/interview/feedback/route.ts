import { NextRequest, NextResponse } from 'next/server'
import { getQuestionById } from '@/lib/data/interview-questions'

// ── In-memory cache (24h) keyed by question + answer ─────────────────────────
const cache = new Map<string, { data: FeedbackResult; ts: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

// ── Rate limit: 30 scoring calls / IP / hour ─────────────────────────────────
const rateLimits = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60 * 60 * 1000

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

interface FeedbackResult {
  score: number
  category_scores: {
    specificity: number
    brevity: number
    keyword_usage: number
    red_flag_avoidance: number
    naturalness: number
  }
  strengths: string[]
  improvements: string[]
  rewrite_suggestion: string
}

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite']

async function callGemini(prompt: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null
  for (const model of GEMINI_MODELS) {
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
              temperature: 0.4,
              thinkingConfig: { thinkingBudget: 0 },
            },
          }),
          signal: AbortSignal.timeout(8000),
        }
      )
      if (!res.ok) {
        console.error(`Gemini ${model} error: ${res.status} ${await res.text().catch(() => '')}`)
        continue
      }
      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (text) return text
    } catch (e) {
      console.error(`Gemini ${model} exception:`, e)
    }
  }
  return null
}

function parseJson(text: string): FeedbackResult | null {
  try {
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) return null
    const obj = JSON.parse(cleaned.slice(start, end + 1))
    if (typeof obj.score !== 'number') return null
    return obj as FeedbackResult
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { ok: false, error: 'You have used your hourly practice feedback limit. Please try again later.' },
      { status: 429 }
    )
  }

  let question_id = ''
  let user_answer = ''
  try {
    const body = await req.json()
    question_id = String(body.question_id ?? '')
    user_answer = String(body.user_answer ?? '').trim()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body' }, { status: 400 })
  }

  if (!question_id || !user_answer) {
    return NextResponse.json({ ok: false, error: 'Please type an answer first.' }, { status: 400 })
  }
  if (user_answer.length > 1500) {
    return NextResponse.json({ ok: false, error: 'Answer is too long — keep it interview-length.' }, { status: 400 })
  }

  const question = getQuestionById(question_id)
  if (!question) {
    return NextResponse.json({ ok: false, error: 'Unknown question' }, { status: 404 })
  }

  // Cache check
  const key = `${question_id}::${user_answer.toLowerCase()}`
  const cached = cache.get(key)
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json({ ok: true, feedback: cached.data, cached: true })
  }

  const prompt = `You are an experienced ${question.country_iso} visa officer evaluating a candidate's mock interview answer. Be fair but realistic.

Question asked: "${question.question}"

Why the officer asks: "${question.why_asked}"

Strong answer pattern: "${question.strong_answer_pattern}"

Weak answer pattern: "${question.weak_answer_pattern}"

Phrases that are red flags: ${question.keywords_to_avoid.join(', ')}
Concrete things a good answer includes: ${question.keywords_to_use.join(', ')}

The candidate's actual answer: "${user_answer}"

Score this answer 0-10 based on:
1. Specificity (concrete dates, places, people, amounts)
2. Brevity (15-30 second answers ideal; too short = nervous, too long = rehearsed)
3. Keyword presence (used appropriate concrete terms)
4. Red-flag avoidance (avoided phrases like "settle", "stay forever", "might")
5. Naturalness (sounds genuine, not rehearsed)

Return ONLY valid JSON, no markdown, no code fences:
{
  "score": 0-10,
  "category_scores": { "specificity": 0-10, "brevity": 0-10, "keyword_usage": 0-10, "red_flag_avoidance": 0-10, "naturalness": 0-10 },
  "strengths": ["short bullet", "..."],
  "improvements": ["short bullet", "..."],
  "rewrite_suggestion": "An improved version of their answer in first person."
}`

  const raw = await callGemini(prompt)
  if (!raw) {
    return NextResponse.json(
      { ok: false, error: 'Scoring is temporarily unavailable. Please try again in a moment.' },
      { status: 503 }
    )
  }

  const parsed = parseJson(raw)
  if (!parsed) {
    return NextResponse.json(
      { ok: false, error: 'Could not score that answer. Please try again.' },
      { status: 502 }
    )
  }

  // Clamp score into range
  parsed.score = Math.max(0, Math.min(10, Math.round(parsed.score * 10) / 10))
  cache.set(key, { data: parsed, ts: Date.now() })

  return NextResponse.json({ ok: true, feedback: parsed })
}
