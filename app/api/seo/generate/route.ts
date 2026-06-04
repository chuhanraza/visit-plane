/**
 * POST /api/seo/generate
 *
 * Triggers Gemini content generation for a single SEO page route.
 * Protected by ADMIN_SECRET bearer token.
 *
 * Body: {
 *   template: 'template1' | 'template2' | 'template3' | 'template4'
 *   passportIso: string          // ISO3 e.g. "PAK"
 *   destinationIso?: string      // ISO3 e.g. "ARE"
 *   forceRegenerate?: boolean    // overwrite existing content
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { generatePageContent, saveGeneratedContent } from '@/lib/seo/contentGenerator'
import { BY_ISO3 } from '@/lib/seo/countries'
import type { Template } from '@/lib/seo/contentGenerator'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 })
}

// Build URL slug from ISOs (mirrors lib/seo/contentGenerator.ts buildSlug)
function buildSlugFromIso(template: Template, passportIso: string, destinationIso?: string): string {
  const pp   = BY_ISO3[passportIso]
  const dest = destinationIso ? BY_ISO3[destinationIso] : undefined
  if (!pp) return 'unknown'
  switch (template) {
    case 'template1': return `visa-requirements-for-${pp.nationality}-citizens-to-${dest?.slug ?? 'unknown'}`
    case 'template2': return `visa-free-countries-for-${pp.nationality}-passport`
    case 'template3': return `cheapest-visas-from-${pp.slug}-passport`
    case 'template4': return `${dest?.slug ?? 'unknown'}-visa-guide-for-${pp.nounPlural}`
    default:          return 'unknown'
  }
}

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization') ?? ''
  const secret     = authHeader.replace('Bearer ', '').trim()
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return unauthorized()
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body: {
    template?: string
    passportIso?: string
    destinationIso?: string
    forceRegenerate?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return badRequest('Invalid JSON body')
  }

  const { template, passportIso, destinationIso, forceRegenerate = false } = body

  // ── Validation ────────────────────────────────────────────────────────────
  const validTemplates: Template[] = ['template1', 'template2', 'template3', 'template4']
  if (!template || !validTemplates.includes(template as Template)) {
    return badRequest(`template must be one of: ${validTemplates.join(', ')}`)
  }
  if (!passportIso || !BY_ISO3[passportIso]) {
    return badRequest(`passportIso "${passportIso}" not found`)
  }
  if ((template === 'template1' || template === 'template4') && (!destinationIso || !BY_ISO3[destinationIso])) {
    return badRequest(`destinationIso required for ${template}`)
  }

  const t = template as Template

  // ── Generate ──────────────────────────────────────────────────────────────
  try {
    const req_ = { template: t, passportIso: passportIso!, destinationIso, forceRegenerate }
    const result = await generatePageContent(req_)

    if (!result.success || !result.content || !result.qualityResult) {
      return NextResponse.json({ success: false, error: result.error ?? 'Generation failed' }, { status: 500 })
    }

    await saveGeneratedContent(req_, result.content, result.qualityResult)

    const slug = buildSlugFromIso(t, passportIso!, destinationIso)

    return NextResponse.json({
      success:       true,
      slug,
      passed:        result.qualityResult.passed,
      qualityResult: result.qualityResult,
      wordCount:     result.content.word_count,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[/api/seo/generate]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// ── GET: status check for a single route ─────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const secret     = authHeader.replace('Bearer ', '').trim()
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return unauthorized()
  }

  const { searchParams } = new URL(req.url)
  const template       = searchParams.get('template') as Template | null
  const passportIso    = searchParams.get('passportIso')
  const destinationIso = searchParams.get('destinationIso') ?? undefined

  if (!template || !passportIso) {
    return badRequest('template and passportIso are required')
  }

  const slug = buildSlugFromIso(template, passportIso, destinationIso)

  const { createClient } = await import('@supabase/supabase-js')
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { data } = await supabase
    .from('seo_page_content')
    .select('url_slug, generation_status, quality_passed, quality_failures, word_count, published, updated_at')
    .eq('url_slug', slug)
    .single()

  if (!data) {
    return NextResponse.json({ exists: false, slug })
  }

  return NextResponse.json({ exists: true, ...data })
}
