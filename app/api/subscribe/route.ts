import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Prefer service-role key (bypasses RLS); fall back to anon key (RLS policy allows inserts)
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { email, passport, destination, captured_from, consent } = body as Record<string, string | boolean>

    if (!email || !EMAIL_RE.test(String(email))) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    if (!consent) {
      return NextResponse.json({ error: 'Consent required' }, { status: 400 })
    }

    const unsubscribe_token = randomBytes(32).toString('hex')
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      req.headers.get('x-real-ip') ??
      'unknown'
    const user_agent = req.headers.get('user-agent') ?? 'unknown'
    const now = new Date().toISOString()

    const { error } = await getSupabase()
      .from('email_subscribers')
      .insert([{
        email:             String(email).trim().toLowerCase(),
        route_passport:    passport    ? String(passport)    : null,
        route_destination: destination ? String(destination) : null,
        captured_from:     captured_from ? String(captured_from) : 'unknown',
        captured_at:       now,
        unsubscribe_token,
        consent_at:        now,
        ip_address:        ip,
        user_agent,
      }])

    if (error) {
      // 23505 = unique_violation (duplicate email) — silent success so UX stays clean
      if (error.code === '23505') {
        return NextResponse.json({ success: true, duplicate: true })
      }
      console.error('[subscribe] Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[subscribe] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
