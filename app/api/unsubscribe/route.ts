import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

  // Use execute_sql-style update via .rpc or direct update
  const { error } = await supabase
    .from('email_subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)

  if (error) {
    console.error('[unsubscribe] Supabase error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.redirect(new URL('/unsubscribe?status=ok', req.url))
}
