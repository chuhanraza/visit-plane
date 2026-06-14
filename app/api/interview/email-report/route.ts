import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

interface Body {
  email: string
  subscribe: boolean
  country: string
  visaLabel: string
  overall: number
  categories: Record<string, number>
  strengths: string[]
  improvements: string[]
}

function buildHtml(b: Body): string {
  const cat = Object.entries(b.categories)
    .map(([k, v]) => `<tr><td style="padding:4px 0;color:#334155">${k.replace(/_/g, ' ')}</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#0f172a">${v}/10</td></tr>`)
    .join('')
  const strengths = b.strengths.map((s) => `<li style="margin-bottom:4px">✓ ${s}</li>`).join('')
  const improvements = b.improvements.map((s) => `<li style="margin-bottom:4px">• ${s}</li>`).join('')

  return `<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
    <div style="background:linear-gradient(135deg,#14b8a6,#10b981);padding:28px 32px">
      <p style="color:rgba(255,255,255,0.7);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Interview Readiness Report</p>
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0">${b.country} · ${b.visaLabel}</h1>
      <p style="color:#fff;font-size:34px;font-weight:800;margin:10px 0 0">${b.overall}<span style="font-size:16px">/100</span></p>
    </div>
    <div style="padding:24px 32px;border-bottom:1px solid #f1f5f9">
      <h2 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 10px">Breakdown</h2>
      <table style="width:100%;font-size:13px">${cat}</table>
    </div>
    ${strengths ? `<div style="padding:20px 32px;border-bottom:1px solid #f1f5f9"><h2 style="font-size:14px;font-weight:700;color:#059669;margin:0 0 8px">What you did well</h2><ul style="margin:0;padding-left:18px;font-size:13px;color:#334155">${strengths}</ul></div>` : ''}
    ${improvements ? `<div style="padding:20px 32px;border-bottom:1px solid #f1f5f9"><h2 style="font-size:14px;font-weight:700;color:#b45309;margin:0 0 8px">Improve before your interview</h2><ul style="margin:0;padding-left:18px;font-size:13px;color:#334155">${improvements}</ul></div>` : ''}
    <div style="padding:24px 32px;text-align:center">
      <a href="https://www.visitplane.com/interview-prep" style="display:inline-block;background:linear-gradient(135deg,#14b8a6,#10b981);color:#fff;padding:14px 28px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none">Practice again →</a>
      <p style="font-size:12px;color:#94a3b8;margin-top:16px">Visa decisions rest with the consular officer. Use this as preparation, not a guarantee.</p>
    </div>
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9">
      <p style="font-size:12px;color:#94a3b8;margin:0">Sent by <a href="https://www.visitplane.com" style="color:#14b8a6">VisitPlane</a></p>
    </div>
  </div>
</body></html>`
}

export async function POST(req: NextRequest) {
  let b: Body
  try {
    b = (await req.json()) as Body
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!b.email || !emailRegex.test(b.email)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email.' }, { status: 400 })
  }
  if (typeof b.overall !== 'number') {
    return NextResponse.json({ ok: false, error: 'Missing report data.' }, { status: 400 })
  }

  // Normalise arrays defensively
  b.categories = b.categories ?? {}
  b.strengths = Array.isArray(b.strengths) ? b.strengths.slice(0, 8) : []
  b.improvements = Array.isArray(b.improvements) ? b.improvements.slice(0, 8) : []

  // 1. Optional subscriber capture
  if (b.subscribe) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey)
        const crypto = await import('crypto')
        await supabase.from('email_subscribers').upsert(
          {
            email: b.email.toLowerCase().trim(),
            route_passport: b.country,
            route_destination: b.visaLabel,
            captured_from: 'interview_prep',
            captured_at: new Date().toISOString(),
            confirm_token: crypto.randomBytes(32).toString('hex'),
            unsubscribe_token: crypto.randomBytes(32).toString('hex'),
            consent_at: new Date().toISOString(),
            ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown',
            user_agent: req.headers.get('user-agent') ?? 'unknown',
          },
          { onConflict: 'email', ignoreDuplicates: true }
        )
      } catch (e) {
        console.error('interview subscriber upsert failed:', e)
      }
    }
  }

  // 2. Send the report
  const resendKey = process.env.RESEND_API_KEY
  if (!resendKey) {
    return NextResponse.json({ ok: true, message: 'Report generated (email sending not configured).' })
  }
  try {
    const resend = new Resend(resendKey)
    await resend.emails.send({
      from: 'VisitPlane <noreply@visitplane.com>',
      to: b.email,
      subject: `Your ${b.country} ${b.visaLabel} interview readiness report (${b.overall}/100)`,
      html: buildHtml(b),
    })
    return NextResponse.json({ ok: true, message: `Report sent to ${b.email}` })
  } catch (e) {
    console.error('interview email send failed:', e)
    return NextResponse.json({ ok: false, error: 'Failed to send. Please try again.' }, { status: 500 })
  }
}
