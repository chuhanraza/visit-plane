/**
 * POST /api/seo/batch
 *
 * Triggers bulk Gemini content generation for a launch phase.
 * Runs in background and returns immediately with a job ID.
 * Check progress via GET /api/seo/batch?jobId=...
 *
 * Body: {
 *   template: 'template1' | 'template2' | 'template3' | 'template4'
 *   phase: 1 | 2 | 3 | 4
 *   forceRegenerate?: boolean
 * }
 *
 * Phase sizes (per template):
 *   1 → top 50 routes
 *   2 → top 100 routes
 *   3 → top 150 routes
 *   4 → full matrix
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { batchGenerate } from '@/lib/seo/contentGenerator'
import type { Template, BatchOptions } from '@/lib/seo/contentGenerator'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const secret     = authHeader.replace('Bearer ', '').trim()
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return unauthorized()
  }

  let body: { template?: string; phase?: number; forceRegenerate?: boolean }
  try { body = await req.json() } catch { body = {} }

  const phase    = Number(body.phase ?? 1) as 1 | 2 | 3 | 4
  const template = (body.template ?? 'template1') as Template

  if (![1, 2, 3, 4].includes(phase)) {
    return NextResponse.json({ error: 'phase must be 1–4' }, { status: 400 })
  }

  const validTemplates: Template[] = ['template1', 'template2', 'template3', 'template4']
  if (!validTemplates.includes(template)) {
    return NextResponse.json({ error: `template must be one of: ${validTemplates.join(', ')}` }, { status: 400 })
  }

  const jobId    = `batch-${template}-phase${phase}-${Date.now()}`
  const supabase = getSupabase()

  // Record job
  await supabase.from('seo_generation_jobs').insert({
    id:           jobId,
    phase,
    total_routes: 0,      // updated when batch starts
    completed:    0,
    failed:       0,
    status:       'running',
    started_at:   new Date().toISOString(),
  }).then(() => null).catch(() => null)

  // Fire-and-forget
  const opts: BatchOptions = {
    template,
    phase,
    concurrency:   3,
    skipExisting:  !body.forceRegenerate,
    onProgress: async (done, total, current) => {
      await supabase.from('seo_generation_jobs')
        .update({ completed: done, total_routes: total, updated_at: new Date().toISOString() })
        .eq('id', jobId)
        .then(() => null).catch(() => null)
    },
  }

  batchGenerate(opts).then(async (summary) => {
    await supabase.from('seo_generation_jobs')
      .update({
        status:       'done',
        total_routes: summary.total,
        completed:    summary.succeeded + summary.reviewNeeded,
        failed:       summary.failed,
        finished_at:  new Date().toISOString(),
      })
      .eq('id', jobId)
      .then(() => null).catch(() => null)
  }).catch(async (err) => {
    await supabase.from('seo_generation_jobs')
      .update({ status: 'error', error: String(err) })
      .eq('id', jobId)
      .then(() => null).catch(() => null)
  })

  return NextResponse.json({
    jobId,
    template,
    phase,
    message: 'Batch generation started. Poll GET /api/seo/batch?jobId=' + jobId + ' for progress.',
  })
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const secret     = authHeader.replace('Bearer ', '').trim()
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return unauthorized()
  }

  const { searchParams } = new URL(req.url)
  const jobId = searchParams.get('jobId')
  const supabase = getSupabase()

  if (jobId) {
    const { data } = await supabase
      .from('seo_generation_jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    return NextResponse.json(data ?? { error: 'Job not found' })
  }

  // List recent jobs
  const { data } = await supabase
    .from('seo_generation_jobs')
    .select('id, phase, total_routes, completed, failed, status, started_at, finished_at')
    .order('started_at', { ascending: false })
    .limit(20)

  return NextResponse.json({ jobs: data ?? [] })
}
