import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://visitplane.com').replace(/\/$/, '')
}

async function sendConfirmationEmail(
  to: string,
  confirmToken: string,
  unsubscribeToken: string,
  topic: string,
) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[subscribe] RESEND_API_KEY not set — skipping confirmation email')
    return
  }

  const confirmUrl    = `${siteUrl()}/confirm?token=${confirmToken}`
  const unsubscribeUrl = `${siteUrl()}/unsubscribe?token=${unsubscribeToken}`

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
        <!-- Header -->
        <tr>
          <td style="background:#0d9488;padding:28px 32px;text-align:center">
            <span style="font-size:28px">✈️</span>
            <div style="color:#fff;font-size:20px;font-weight:700;margin-top:8px">VisitPlane</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 24px">
            <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#111827">
              Confirm your subscription
            </h1>
            <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6">
              Hi traveller,<br><br>
              Click the button below to confirm your subscription to
              <strong style="color:#111827">${topic}</strong> visa alerts.
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="border-radius:12px;background:#0d9488">
                  <a href="${confirmUrl}"
                     style="display:inline-block;padding:14px 28px;color:#fff;font-size:15px;font-weight:700;text-decoration:none;border-radius:12px">
                    Confirm Subscription →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6">
              Or copy this link into your browser:<br>
              <a href="${confirmUrl}" style="color:#0d9488;word-break:break-all">${confirmUrl}</a>
            </p>
            <p style="margin:16px 0 0;font-size:13px;color:#9ca3af">
              If you didn't subscribe, you can safely ignore this email.
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 24px;border-top:1px solid #f3f4f6;text-align:center">
            <p style="margin:0;font-size:12px;color:#d1d5db">
              © VisitPlane · Free visa intelligence for travellers<br>
              <a href="${unsubscribeUrl}" style="color:#9ca3af;text-decoration:none">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  const text = `Confirm your VisitPlane subscription\n\nClick the link below to confirm your subscription to ${topic} visa alerts:\n\n${confirmUrl}\n\nIf you didn't subscribe, ignore this email.\n\n— VisitPlane\n\nUnsubscribe: ${unsubscribeUrl}`

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'VisitPlane <alerts@visitplane.com>',
        to:      [to],
        subject: 'Confirm your VisitPlane subscription',
        html,
        text,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error('[subscribe] Resend error:', res.status, body)
    }
  } catch (err) {
    console.error('[subscribe] Failed to send confirmation email:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { email, passport, destination, captured_from, consent, lead_magnet } = body as Record<string, string | boolean>

    if (!email || !EMAIL_RE.test(String(email))) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }
    if (!consent) {
      return NextResponse.json({ error: 'Please check the consent box to continue.' }, { status: 400 })
    }

    const leadMagnet = lead_magnet ? String(lead_magnet) : null

    const emailNorm         = String(email).trim().toLowerCase()
    const confirm_token     = randomBytes(32).toString('hex')
    const unsubscribe_token = randomBytes(32).toString('hex')
    const ip                = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
                           ?? req.headers.get('x-real-ip')
                           ?? 'unknown'
    const user_agent        = req.headers.get('user-agent') ?? 'unknown'
    const now               = new Date().toISOString()

    const supabase = getSupabase()

    // Check if already exists
    const { data: existing } = await supabase
      .from('email_subscribers')
      .select('email, confirmed_at, confirm_token, unsubscribe_token')
      .eq('email', emailNorm)
      .maybeSingle()

    if (existing) {
      // Already confirmed — silent success
      if (existing.confirmed_at) {
        return NextResponse.json({ success: true, duplicate: true, confirmed: true })
      }
      // Unconfirmed — resend confirmation email
      const topic = buildTopic(passport as string, destination as string)
      await sendConfirmationEmail(
        emailNorm,
        existing.confirm_token ?? confirm_token,
        existing.unsubscribe_token ?? unsubscribe_token,
        topic,
      )
      return NextResponse.json({ success: true, duplicate: true, confirmed: false })
    }

    const { error } = await supabase
      .from('email_subscribers')
      .insert([{
        email:             emailNorm,
        route_passport:    passport    ? String(passport)    : null,
        route_destination: destination ? String(destination) : null,
        captured_from:     captured_from ? String(captured_from) : 'unknown',
        lead_magnet:       leadMagnet,
        captured_at:       now,
        confirm_token,
        unsubscribe_token,
        consent_at:        now,
        ip_address:        ip,
        user_agent,
      }])

    if (error) {
      // Race-condition duplicate
      if (error.code === '23505') {
        return NextResponse.json({ success: true, duplicate: true })
      }
      console.error('[subscribe] Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const topic = buildTopic(passport as string, destination as string)
    await sendConfirmationEmail(emailNorm, confirm_token, unsubscribe_token, topic)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[subscribe] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function buildTopic(passport?: string, destination?: string): string {
  if (passport && destination) return `${destination} visa rules for ${passport} passport holders`
  if (destination) return `${destination} visa rules`
  if (passport) return `visa rules for ${passport} passport holders`
  return 'visa rule change'
}
