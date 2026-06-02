/**
 * /api/visa/run-pipeline
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin-only endpoint to trigger the verification pipeline on-demand.
 * Also called by the weekly cron job (Vercel Cron or external cron).
 *
 * Modes:
 *   GET /api/visa/run-pipeline?secret=X&route=PAK-ARE&purpose=tourist  → single route
 *   GET /api/visa/run-pipeline?secret=X&mode=overdue                   → all overdue
 *   GET /api/visa/run-pipeline?secret=X&mode=top20                     → all top 20
 *
 * Cron invocation (weekly, no secret needed — protected by Vercel's cron auth):
 *   GET /api/visa/run-pipeline?cron=1
 *
 * Rate limiting: pipeline script handles Gemini rate limits internally.
 * This endpoint fires the script async and returns immediately with a job ID.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execAsync = promisify(exec)

function isAuthorized(req: NextRequest, secret: string | null): boolean {
  // Vercel cron requests include a special header
  if (req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`) return true
  return secret === process.env.ADMIN_SECRET
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret  = searchParams.get('secret')
  const mode    = searchParams.get('mode') ?? 'single'
  const route   = searchParams.get('route')  // e.g. "PAK-ARE"
  const purpose = searchParams.get('purpose') ?? 'tourist'
  const isCron  = searchParams.get('cron') === '1'

  if (!isCron && !isAuthorized(req, secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Build CLI args
  let args: string
  if (mode === 'overdue') {
    args = '--overdue'
  } else if (mode === 'top20') {
    args = '--all-top20'
  } else if (route) {
    const [p, d] = route.split('-')
    args = `${p} ${d} ${purpose}`
  } else {
    return NextResponse.json({ error: 'Specify ?route=PAK-ARE or ?mode=overdue|top20' }, { status: 400 })
  }

  const scriptPath = path.join(process.cwd(), 'scripts', 'verify-visa-route.mjs')

  // Fire and don't await — pipeline can take minutes
  execAsync(`node ${scriptPath} ${args}`, {
    env: { ...process.env },
    timeout: 30 * 60 * 1000, // 30 min max
  }).then(({ stdout, stderr }) => {
    if (stderr) console.error('[pipeline]', stderr.slice(0, 500))
    console.log('[pipeline] Complete:', stdout.slice(0, 200))
  }).catch(e => {
    console.error('[pipeline] Error:', e.message)
  })

  return NextResponse.json({
    status: 'started',
    mode: isCron ? 'cron-overdue' : mode,
    args,
    message: 'Pipeline started in background. Check logs/visa-pipeline/ for output.',
    logDir: 'logs/visa-pipeline/',
  })
}
