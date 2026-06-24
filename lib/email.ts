import { Resend } from 'resend'

const FROM = 'VisitPlane <orders@visitplane.com>'

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://visitplane.com'
}

/** Low-level send. Degrades safely: no RESEND_API_KEY => logs and returns, never throws. */
async function send(to: string, subject: string, html: string): Promise<{ sent: boolean }> {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.warn(`[email] RESEND_API_KEY not set — skipping "${subject}" to ${to}`)
    return { sent: false }
  }
  try {
    const resend = new Resend(key)
    await resend.emails.send({ from: FROM, to, subject, html })
    return { sent: true }
  } catch (e) {
    console.error('[email] send failed:', (e as Error).message)
    return { sent: false }
  }
}

function shell(title: string, bodyHtml: string) {
  return `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111827">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="font-weight:700;font-size:18px;margin-bottom:16px">Visit<span style="color:#2563eb">Plane</span></div>
    <div style="background:#fff;border:1px solid #e5e7eb;border-radius:16px;padding:24px">
      <h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
      ${bodyHtml}
    </div>
    <p style="color:#9ca3af;font-size:12px;margin-top:16px;line-height:1.5">
      VisitPlane provides visa application assistance and guidance. We are not a government
      body and do not guarantee visa approval. Always verify requirements with the official
      authority. This is a transactional message about your order.
    </p>
  </div></body></html>`
}

const btn = (href: string, label: string) =>
  `<a href="${href}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px;font-weight:600;font-size:14px">${label}</a>`

const fmt = (cur: string, n: number) => `${cur} ${Number(n).toFixed(2)}`

// ── Templates ────────────────────────────────────────────────────────────────

export function sendOrderConfirmation(to: string, o: {
  orderRef: string; orderId: string; total: number; currency: string; serviceName: string; travelers: number
}) {
  const body = `
    <p style="font-size:14px;line-height:1.6;color:#374151">Thanks — we've received your visa order.</p>
    <table style="width:100%;font-size:14px;color:#374151;border-collapse:collapse;margin:12px 0">
      <tr><td style="padding:6px 0;color:#6b7280">Order reference</td><td style="text-align:right;font-weight:600">${o.orderRef}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Service</td><td style="text-align:right">${o.serviceName}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Travellers</td><td style="text-align:right">${o.travelers}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Total</td><td style="text-align:right;font-weight:700">${fmt(o.currency, o.total)}</td></tr>
    </table>
    <p style="font-size:14px;line-height:1.6;color:#374151">Next step: upload your documents so we can begin the review.</p>
    <p style="margin:16px 0 0">${btn(`${siteUrl()}/portal/orders/${o.orderId}`, 'View order & upload documents')}</p>`
  return send(to, `Order received — ${o.orderRef}`, shell('Your visa order is confirmed', body))
}

export function sendStatusUpdate(to: string, o: {
  orderRef: string; orderId: string; statusLabel: string; note?: string
}) {
  const body = `
    <p style="font-size:14px;line-height:1.6;color:#374151">Your order <strong>${o.orderRef}</strong> is now:</p>
    <p style="font-size:16px;font-weight:700;color:#2563eb;margin:8px 0">${o.statusLabel}</p>
    ${o.note ? `<p style="font-size:14px;line-height:1.6;color:#374151">${o.note}</p>` : ''}
    <p style="margin:16px 0 0">${btn(`${siteUrl()}/portal/orders/${o.orderId}`, 'View order')}</p>`
  return send(to, `Update on order ${o.orderRef}: ${o.statusLabel}`, shell('Order status updated', body))
}

export function sendDocumentRequest(to: string, o: { orderRef: string; orderId: string; note?: string }) {
  const body = `
    <p style="font-size:14px;line-height:1.6;color:#374151">We need additional documents for order <strong>${o.orderRef}</strong> before we can continue.</p>
    ${o.note ? `<p style="font-size:14px;line-height:1.6;color:#374151">${o.note}</p>` : ''}
    <p style="margin:16px 0 0">${btn(`${siteUrl()}/portal/orders/${o.orderId}`, 'Upload documents')}</p>`
  return send(to, `Action needed — documents for ${o.orderRef}`, shell('Documents requested', body))
}

export function sendInvoiceEmail(to: string, o: {
  orderRef: string; orderId: string; invoiceNumber: string; total: number; currency: string; paid: boolean
}) {
  const body = `
    <p style="font-size:14px;line-height:1.6;color:#374151">Invoice <strong>${o.invoiceNumber}</strong> for order ${o.orderRef}.</p>
    <table style="width:100%;font-size:14px;color:#374151;margin:12px 0">
      <tr><td style="padding:6px 0;color:#6b7280">Total</td><td style="text-align:right;font-weight:700">${fmt(o.currency, o.total)}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280">Status</td><td style="text-align:right">${o.paid ? 'Paid' : 'Unpaid'}</td></tr>
    </table>
    <p style="margin:16px 0 0">${btn(`${siteUrl()}/api/invoices/${o.orderId}/pdf`, 'Download invoice (PDF)')}</p>`
  return send(to, `Invoice ${o.invoiceNumber} — ${o.orderRef}`, shell('Your invoice', body))
}
