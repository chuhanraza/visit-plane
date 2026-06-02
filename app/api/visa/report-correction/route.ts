import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { visa_req_id, passport_iso, destination_iso, purpose, what_is_wrong, corrected_value, source_url } = body

    if (!what_is_wrong || typeof what_is_wrong !== 'string') {
      return NextResponse.json({ error: 'what_is_wrong is required' }, { status: 400 })
    }

    // Basic length guards
    if (what_is_wrong.length > 200 || (corrected_value?.length ?? 0) > 2000 || (source_url?.length ?? 0) > 500) {
      return NextResponse.json({ error: 'Input too long' }, { status: 400 })
    }

    const { error } = await supabase.from('data_corrections').insert({
      visa_req_id:     visa_req_id ?? null,
      passport_iso:    passport_iso ?? null,
      destination_iso: destination_iso ?? null,
      purpose:         purpose ?? 'tourist',
      what_is_wrong,
      corrected_value: corrected_value ?? null,
      source_url:      source_url ?? null,
      status:          'pending',
    })

    if (error) {
      console.error('[report-correction] DB error:', error)
      return NextResponse.json({ error: 'Failed to save correction' }, { status: 500 })
    }

    // TODO: trigger email notification to admin (add resend/sendgrid here)
    // For now, log for monitoring
    console.log(`[data-correction] New report: ${passport_iso}→${destination_iso} — "${what_is_wrong}"`)

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[report-correction] Error:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
