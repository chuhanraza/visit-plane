/**
 * /api/visa/run-pipeline
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin-only endpoint to trigger the verification pipeline on-demand.
 * Also called by the weekly cron job (Vercel Cron or external cron).
 *
 * Auth: admin (admin_secret cookie / x-admin-secret header / Supabase-Auth admin
 * via requireAdminApi) for manual calls; the Vercel cron path for the schedule.
 *
 * Modes (admin-authenticated):
 *   GET /api/visa/run-pipeline?route=PAK-ARE&purpose=tourist  → single route
 *   GET /api/visa/run-pipeline?mode=overdue                   → all overdue
 *   GET /api/visa/run-pipeline?mode=top20                     → all top 20
 *
 * Cron invocation (weekly): GET /api/visa/run-pipeline?cron=1&mode=overdue
 *   When CRON_SECRET is set, the matching `Authorization: Bearer` is required.
 *
 * Rate limiting: pipeline script handles Gemini rate limits internally.
 * This endpoint fires the script async and returns immediately with a job ID.
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'

// TODO(cloudflare-migration, Stage 2): this route shells out to a Node script
// via child_process.exec — that fundamentally cannot work on Cloudflare
// Workers (no OS process model; nodejs_compat's child_process is a
// non-functional stub for actually spawning anything, compat flags or not).
// The real fix is to inline scripts/verify-visa-route.mjs's logic as a
// directly-importable function, or move this job to a GitHub Action /
// Supabase Edge Function on its own schedule, decoupled from the web app
// entirely. Until that rewrite happens, tryRunPipeline() below makes this
// route build-safe on any platform (dynamic imports, wrapped in try/catch —
// never a static top-level `child_process` import): it attempts the spawn,
// and if the runtime can't actually do it, returns a clear "unavailable"
// response instead of silently claiming a pipeline run started.
async function tryRunPipeline(scriptPath: string, args: string): Promise<{ ok: boolean; reason?: string }> {
  try {
    const { exec } = await import('child_process')
    const { promisify } = await import('util')
    const execAsync = promisify(exec)

    // Fire and don't await — pipeline can take minutes.
    execAsync(`node ${scriptPath} ${args}`, {
      env: { ...process.env },
      timeout: 30 * 60 * 1000, // 30 min max
    }).then(({ stdout, stderr }) => {
      if (stderr) console.error('[pipeline]', stderr.slice(0, 500))
      console.log('[pipeline] Complete:', stdout.slice(0, 200))
    }).catch(e => {
      console.error('[pipeline] Error:', e.message)
    })

    return { ok: true }
  } catch (err) {
    console.error('[pipeline] child_process unavailable on this runtime — skipping', err)
    return {
      ok: false,
      reason: 'child_process is not available in this runtime (e.g. Cloudflare Workers). See the TODO comment in this file — the verification pipeline needs to be inlined or moved to a GitHub Action / Supabase Edge Function.',
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode    = searchParams.get('mode') ?? 'single'
  const route   = searchParams.get('route')  // e.g. "PAK-ARE"
  const purpose = searchParams.get('purpose') ?? 'tourist'
  const isCron  = searchParams.get('cron') === '1'

  // Auth: the Vercel cron job OR an admin (admin_secret cookie / x-admin-secret
  // header / Supabase-Auth admin). When CRON_SECRET is configured we require the
  // matching Bearer for the cron path; if it isn't set we keep the legacy ?cron=1
  // behaviour so the scheduled job doesn't regress.
  const cronConfigured = !!process.env.CRON_SECRET
  const isCronCall = isCron && (
    !cronConfigured || req.headers.get('authorization') === `Bearer ${process.env.CRON_SECRET}`
  )
  if (!isCronCall && !(await requireAdminApi())) {
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

  const { join } = await import('path')
  const scriptPath = join(process.cwd(), 'scripts', 'verify-visa-route.mjs')

  const result = await tryRunPipeline(scriptPath, args)
  if (!result.ok) {
    return NextResponse.json({
      status: 'unavailable',
      mode: isCron ? 'cron-overdue' : mode,
      args,
      message: result.reason,
    }, { status: 501 })
  }

  return NextResponse.json({
    status: 'started',
    mode: isCron ? 'cron-overdue' : mode,
    args,
    message: 'Pipeline started in background. Check logs/visa-pipeline/ for output.',
    logDir: 'logs/visa-pipeline/',
  })
}
