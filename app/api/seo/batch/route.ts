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
import { batchGenerate } from '@/lib/seo/contentGenerator'
import type { Template, BatchOptions } from '@/lib/seo/contentGenerator'
import { requireAdminApi } from '@/lib/admin/guard'
import { getServiceClient } from '@/lib/supabase/admin'

function getSupabase() {
  return getServiceClient()
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Bearer ADMIN_SECRET (legacy tool) OR the standard admin guard.
async function isAuthed(req: NextRequest): Promise<boolean> {
  const secret = (req.headers.get('authorization') ?? '').replace('Bearer ', '').trim()
  if (process.env.ADMIN_SECRET && secret === process.env.ADMIN_SECRET) return true
  return !!(await requireAdminApi())
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed(req))) return unauthorized()

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

  // Record job (fire-and-forget — ignore errors if table doesn't exist yet)
  await Promise.resolve(
    supabase.from('seo_generation_jobs').insert({
      id:           jobId,
      phase,
      total_routes: 0,
      completed:    0,
      failed:       0,
      status:       'running',
      started_at:   new Date().toISOString(),
    })
  ).catch(() => null)

  // Fire-and-forget
  const opts: BatchOptions = {
    template,
    phase,
    concurrency:   3,
    skipExisting:  !body.forceRegenerate,
    onProgress: async (done, total, _current) => {
      await Promise.resolve(
        supabase.from('seo_generation_jobs')
          .update({ completed: done, total_routes: total, updated_at: new Date().toISOString() })
          .eq('id', jobId)
      ).catch(() => null)
    },
  }

  batchGenerate(opts).then(async (summary) => {
    await Promise.resolve(
      supabase.from('seo_generation_jobs')
        .update({
          status:       'done',
          total_routes: summary.total,
          completed:    summary.succeeded + summary.reviewNeeded,
          failed:       summary.failed,
          finished_at:  new Date().toISOString(),
        })
        .eq('id', jobId)
    ).catch(() => null)
  }).catch(async (err) => {
    await Promise.resolve(
      supabase.from('seo_generation_jobs')
        .update({ status: 'error', error: String(err) })
        .eq('id', jobId)
    ).catch(() => null)
  })

  return NextResponse.json({
    jobId,
    template,
    phase,
    message: 'Batch generation started. Poll GET /api/seo/batch?jobId=' + jobId + ' for progress.',
  })
}

export async function GET(req: NextRequest) {
  if (!(await isAuthed(req))) return unauthorized()

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
