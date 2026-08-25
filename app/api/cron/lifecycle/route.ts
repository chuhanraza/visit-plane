import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { runWinback, runConfirmNudge } from '@/lib/admin/lifecycle'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Lifecycle re-engagement tick: Track A (win-back) + Track B (confirm nudge).
 * Each track is independently gated by its own app_settings flag
 * (winback_enabled / confirm_nudge_enabled) and independently loggable in the
 * response — turning either off is a flag flip, not a redeploy.
 *
 * Authorized if EITHER: the configured CRON_SECRET matches (Authorization:
 * Bearer / ?secret=, same convention as /api/cron/flows), OR an authenticated
 * admin (manual run / dry-run from the browser).
 *
 * ?dry_run=1 (or any admin GET with no secret) logs candidate counts + a
 * preview of up to 5 rendered emails per track WITHOUT calling Resend or
 * setting the sent_at guard columns.
 */
async function authorized(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth === `Bearer ${secret}` || req.nextUrl.searchParams.get('secret') === secret) return true
  }
  return !!(await requireAdminApi())
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const dryRun = req.nextUrl.searchParams.get('dry_run') === '1'
  const [winback, confirmNudge] = await Promise.all([runWinback(dryRun), runConfirmNudge(dryRun)])

  return NextResponse.json({ ok: true, dryRun, winback, confirmNudge })
}
