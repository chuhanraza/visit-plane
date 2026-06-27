import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runFlowWorker } from '@/lib/admin/flows'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token || token.length < 10) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const supabase = getSupabase()

  const { data, error } = await supabase
    .from('email_subscribers')
    .update({ confirmed_at: new Date().toISOString() })
    .eq('confirm_token', token)
    .is('confirmed_at', null)          // idempotent — only confirm once
    .select('email')
    .maybeSingle()

  if (error) {
    console.error('[confirm] Supabase error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!data) {
    // Either token not found or already confirmed — both are fine to redirect
    return NextResponse.redirect(new URL('/confirm?status=already', req.url))
  }

  // Newly confirmed → kick the flow worker so the welcome sequence's email 1
  // (delay 0) goes out immediately instead of waiting for the daily cron. Safe:
  // idempotent, gated behind email_broadcasts_enabled, honors unsubscribe.
  try {
    await runFlowWorker()
  } catch (e) {
    console.error('[confirm] flow kick failed (non-fatal):', (e as Error).message)
  }

  return NextResponse.redirect(new URL('/confirm?status=ok', req.url))
}
