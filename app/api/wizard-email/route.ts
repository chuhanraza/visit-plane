import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import type { VisaData } from '@/lib/visa-engine'
import { shortName } from '@/lib/visa-engine'

interface WizardAnswers {
  passport: string
  destination: string
  purpose: string
  duration: string
  travelDate: string
}

function buildEmailHtml(answers: WizardAnswers, visaData: VisaData): string {
  const { passport, destination, purpose, duration, travelDate } = answers
  const from = shortName(passport)
  const to = shortName(destination)

  const costStr = visaData.costUSD != null ? `$${visaData.costUSD} USD` : 'Free'
  const dateStr = travelDate
    ? new Date(travelDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not specified'

  const requiredDocsList = visaData.requiredDocs
    .map((d) => `<li style="margin-bottom:4px">✓ ${d}</li>`)
    .join('')
  const conditionalDocsList = visaData.conditionalDocs
    .map((d) => `<li style="margin-bottom:4px">◦ ${d}</li>`)
    .join('')

  const applySection = visaData.applyUrl
    ? `<p style="margin:8px 0"><strong>Apply online:</strong> <a href="${visaData.applyUrl}" style="color:#14b8a6">${visaData.applyUrl}</a></p>`
    : ''

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#14b8a6,#10b981);padding:28px 32px">
      <p style="color:rgba(255,255,255,0.7);font-size:12px;text-transform:uppercase;letter-spacing:2px;margin:0 0 6px">Your Visa Plan</p>
      <h1 style="color:#fff;font-size:22px;font-weight:800;margin:0">${from} → ${to}</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">${purpose} · ${duration} days · Travel: ${dateStr}</p>
    </div>

    <!-- Visa type -->
    <div style="padding:24px 32px;border-bottom:1px solid #f1f5f9">
      <div style="display:inline-block;padding:10px 18px;border-radius:10px;font-weight:700;font-size:16px;background:#fef3c7;color:#92400e;border:1px solid #fde68a">
        ${visaData.icon} ${visaData.visaLabel}
      </div>
      <div style="margin-top:16px;font-size:14px;color:#334155;line-height:1.8">
        ${applySection}
        <p style="margin:8px 0"><strong>Processing time:</strong> ${visaData.processingDays}</p>
        <p style="margin:8px 0"><strong>Cost:</strong> ${costStr}</p>
        <p style="margin:8px 0"><strong>Max stay:</strong> ${visaData.maxStayDays} days</p>
        ${visaData.notes ? `<p style="margin:12px 0;padding:10px 14px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;color:#78350f;font-size:13px">💡 ${visaData.notes}</p>` : ''}
      </div>
    </div>

    <!-- Document checklist -->
    <div style="padding:24px 32px;border-bottom:1px solid #f1f5f9">
      <h2 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 12px">📋 Required Documents</h2>
      <ul style="margin:0;padding-left:4px;list-style:none;font-size:13px;color:#334155;line-height:1.8">
        ${requiredDocsList}
      </ul>
      ${conditionalDocsList ? `
      <h2 style="font-size:14px;font-weight:700;color:#64748b;margin:16px 0 8px">May Also Be Required</h2>
      <ul style="margin:0;padding-left:4px;list-style:none;font-size:13px;color:#64748b;line-height:1.8">
        ${conditionalDocsList}
      </ul>` : ''}
    </div>

    <!-- CTA -->
    <div style="padding:24px 32px;text-align:center">
      <a href="https://visitplane.com/visa/${encodeURIComponent(passport)}/${encodeURIComponent(destination)}"
        style="display:inline-block;background:linear-gradient(135deg,#14b8a6,#10b981);color:#fff;padding:14px 28px;border-radius:12px;font-weight:700;font-size:15px;text-decoration:none;box-shadow:0 4px 12px rgba(20,184,166,0.3)">
        View Full Visa Requirements →
      </a>
      <p style="font-size:12px;color:#94a3b8;margin-top:16px">
        Visa requirements change frequently. Always verify with the official embassy before applying.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9">
      <p style="font-size:12px;color:#94a3b8;margin:0">
        Sent by <a href="https://visitplane.com" style="color:#14b8a6">VisitPlane</a> · Your AI Visa Intelligence Platform
      </p>
    </div>
  </div>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const { email, answers, visaData, consent } = (await req.json()) as {
      email: string
      answers: WizardAnswers
      visaData: VisaData
      consent: boolean
    }

    if (!email || !consent || !answers || !visaData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const fromNorm = shortName(answers.passport)
    const toNorm = shortName(answers.destination)
    const html = buildEmailHtml(answers, visaData)

    // 1. Add to subscribers (reuse existing subscriber logic)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey)
      const crypto = await import('crypto')
      await supabase.from('email_subscribers').upsert(
        {
          email: email.toLowerCase().trim(),
          route_passport: answers.passport,
          route_destination: answers.destination,
          captured_from: 'wizard_completion',
          captured_at: new Date().toISOString(),
          confirm_token: crypto.randomBytes(32).toString('hex'),
          unsubscribe_token: crypto.randomBytes(32).toString('hex'),
          consent_at: new Date().toISOString(),
          ip_address: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown',
          user_agent: req.headers.get('user-agent') ?? 'unknown',
        },
        { onConflict: 'email', ignoreDuplicates: true }
      )
    }

    // 2. Send email via Resend
    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      // No key in dev — still return success
      return NextResponse.json({ success: true })
    }

    const resend = new Resend(resendKey)
    await resend.emails.send({
      from: 'VisitPlane <noreply@visitplane.com>',
      to: email,
      subject: `Your Visa Plan: ${fromNorm} → ${toNorm} (${visaData.visaLabel})`,
      html,
    })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('wizard-email error:', e)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
