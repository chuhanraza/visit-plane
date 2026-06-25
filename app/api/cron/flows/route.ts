import { NextRequest, NextResponse } from 'next/server'
import { requireAdminApi } from '@/lib/admin/guard'
import { runFlowWorker } from '@/lib/admin/flows'
import { evaluateAlerts } from '@/lib/admin/ops'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Flow worker tick. Authorized if EITHER: a Vercel cron invocation
 * (x-vercel-cron header), OR the configured CRON_SECRET matches
 * (Authorization: Bearer / ?secret=), OR an authenticated admin (manual run).
 */
async function authorized(req: NextRequest): Promise<boolean> {
  if (req.headers.get('x-vercel-cron')) return true
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth === `Bearer ${secret}` || req.nextUrl.searchParams.get('secret') === secret) return true
  }
  return !!(await requireAdminApi())
}

export async function GET(req: NextRequest) {
  if (!(await authorized(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const [flows, alerts] = await Promise.all([runFlowWorker(), evaluateAlerts()])
  return NextResponse.json({ ok: true, flows, alerts })
}
