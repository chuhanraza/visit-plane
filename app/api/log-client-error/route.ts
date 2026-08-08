import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServiceClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Same signature coverage as app/go/[partner]/route.ts and the backfill in
// supabase/migrations/20260705_affiliate_clicks_is_bot.sql — keep in sync.
const BOT_UA_RE = /bot|crawl|spider|slurp|bingpreview|curl|wget|python-requests|headless/i
function isBotUserAgent(ua: string): boolean {
  return ua === '' || BOT_UA_RE.test(ua)
}

const Body = z.object({
  message: z.string().max(2000),
  stack: z.string().max(8000).optional(),
  digest: z.string().max(200).optional(),
  path: z.string().max(500).optional(),
  requestId: z.string().max(200).optional(),
})

/**
 * Fire-and-forget sink for client error boundaries (app/error.tsx,
 * app/global-error.tsx). Never throws to the caller — a logging failure here
 * must never surface to a user who is already looking at an error page.
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null)
    const parsed = Body.safeParse(json)
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 })
    const { message, stack, digest, path, requestId } = parsed.data

    const userAgent = req.headers.get('user-agent') ?? ''

    const svc = getServiceClient()
    const { error } = await svc.from('error_log').insert({
      error_message: message,
      error_stack: stack ?? null,
      error_digest: digest ?? null,
      path: path ?? null,
      user_agent: userAgent || null,
      is_bot: isBotUserAgent(userAgent),
      request_id: requestId ?? null,
    })
    if (error) console.error('[log-client-error] insert failed:', error.message)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[log-client-error] unexpected error:', (e as Error).message)
    return NextResponse.json({ ok: false }, { status: 200 })
  }
}
