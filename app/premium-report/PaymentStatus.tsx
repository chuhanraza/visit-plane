'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Group { tier: string; label: string; items: { name: string; description?: string; conditional?: string }[] }
interface Report {
  passport: string; destination: string; visaType: string; processingTime: string; estimatedFee: string
  maxStayDays: number; leadTimeDays: number; notes: string | null; groups: Group[]; officialSourced: boolean
  processNote: string | null; source: { label: string; url: string } | null; lastVerified: string | null; disclaimer: string
}
type State = 'checking' | 'paid' | 'failed' | 'pending' | 'error'

async function downloadPdf(r: Report) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const W = 515; let y = 50
  const line = (t: string, size = 10, bold = false, gap = 4) => {
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size)
    for (const l of doc.splitTextToSize(t, W) as string[]) {
      if (y > 780) { doc.addPage(); y = 50 }
      doc.text(l, 40, y); y += size + gap
    }
  }
  line('VisitPlane Premium Visa Report', 18, true, 8)
  line(`${r.passport} passport → ${r.destination}`, 13, true, 6)
  line(`Visa type: ${r.visaType}`); line(`Processing: ${r.processingTime}`); line(`Estimated fee: ${r.estimatedFee}`)
  line(`Maximum stay: ${r.maxStayDays} days · Apply at least ${r.leadTimeDays} days ahead`, 10, false, 10)
  if (r.processNote) line(`Note: ${r.processNote}`, 10, false, 10)
  if (r.notes) line(`Note: ${r.notes}`, 10, false, 10)
  for (const g of r.groups) {
    y += 6; line(g.label, 12, true, 6)
    for (const it of g.items) {
      line(`[  ] ${it.name}${it.conditional ? ` (${it.conditional})` : ''}`, 10, true, 2)
      if (it.description) line(`      ${it.description}`, 9, false, 4)
    }
  }
  y += 10
  if (r.source) line(`Official source: ${r.source.label} — ${r.source.url}`, 9)
  if (!r.officialSourced) line('Requirements above are a general guide for this route — confirm the exact list at the official source.', 9)
  line(r.disclaimer, 8)
  doc.save(`visitplane-visa-report-${r.passport}-${r.destination}.pdf`.toLowerCase().replace(/\s+/g, '-'))
}

/** Never trusts the redirect: polls our DB row (webhook-updated only) every 2s for ~30s. */
export default function PaymentStatus({ landedOn }: { landedOn: 'success' | 'failed' }) {
  const order = useSearchParams().get('order') ?? ''
  const [state, setState] = useState<State>('checking')
  const [report, setReport] = useState<Report | null>(null)
  const tries = useRef(0)

  useEffect(() => {
    if (!order) { setState('error'); return }
    let stop = false
    const tick = async () => {
      try {
        const res = await fetch(`/api/checkout/rapidgateway/status?order=${encodeURIComponent(order)}`, { cache: 'no-store' })
        if (res.status === 404 || res.status === 400) { if (!stop) setState('error'); return }
        const { status } = (await res.json()) as { status: string }
        if (stop) return
        if (status === 'paid' || status === 'failed') { setState(status); return }
      } catch { /* retry */ }
      if (++tries.current >= 15) { if (!stop) setState('pending'); return }
      setTimeout(tick, 2000)
    }
    tick()
    return () => { stop = true }
  }, [order])

  useEffect(() => {
    if (state !== 'paid') return
    fetch(`/api/checkout/rapidgateway/report?order=${encodeURIComponent(order)}`, { cache: 'no-store' })
      .then((r) => (r.ok ? (r.json() as Promise<Report>) : null)).then(setReport).catch(() => {})
  }, [state, order])

  const box = 'rounded-2xl border p-6'
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {state === 'checking' && (
        <div className={`${box} border-blue-200 bg-blue-50`}>
          <h1 className="text-xl font-bold">Confirming your payment…</h1>
          <p className="mt-2 text-sm text-gray-600">
            {landedOn === 'failed' ? 'We are double-checking with the payment gateway. ' : ''}This usually takes a few seconds. Please don&apos;t close this page.
          </p>
        </div>
      )}
      {state === 'paid' && (
        <div className="space-y-6">
          <div className={`${box} border-green-200 bg-green-50`}>
            <h1 className="text-xl font-bold text-green-800">Payment confirmed — thank you!</h1>
            <p className="mt-1 text-sm text-gray-600">Order {order}</p>
          </div>
          {!report ? <p className="text-sm text-gray-600">Preparing your report…</p> : (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{report.passport} → {report.destination}</h2>
              <dl className="grid gap-2 rounded-lg border bg-white p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-gray-500">Visa type</dt><dd className="font-semibold">{report.visaType}</dd></div>
                <div><dt className="text-gray-500">Processing</dt><dd className="font-semibold">{report.processingTime}</dd></div>
                <div><dt className="text-gray-500">Estimated fee</dt><dd className="font-semibold">{report.estimatedFee}</dd></div>
                <div><dt className="text-gray-500">Max stay · apply ahead</dt><dd className="font-semibold">{report.maxStayDays} days · {report.leadTimeDays} days</dd></div>
              </dl>
              {report.processNote && <p className="rounded-lg bg-amber-50 p-3 text-sm">{report.processNote}</p>}
              {report.notes && <p className="text-sm text-gray-700">{report.notes}</p>}
              {report.groups.map((g) => (
                <section key={g.label} className="rounded-lg border bg-white p-4">
                  <h3 className="font-semibold">{g.label}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                    {g.items.map((it) => (
                      <li key={it.name}><b>{it.name}</b>{it.conditional ? ` — ${it.conditional}` : ''}{it.description ? `: ${it.description}` : ''}</li>
                    ))}
                  </ul>
                </section>
              ))}
              {!report.officialSourced && <p className="text-xs text-gray-500">General guide for this route — confirm the exact list at the official source.</p>}
              {report.source && <p className="text-sm">Official source: <a className="text-blue-700 underline" href={report.source.url} target="_blank" rel="noopener noreferrer">{report.source.label}</a></p>}
              <button onClick={() => downloadPdf(report)} className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700">Download PDF checklist</button>
              <p className="text-xs text-gray-500">{report.disclaimer}</p>
            </div>
          )}
        </div>
      )}
      {state === 'failed' && (
        <div className={`${box} border-red-200 bg-red-50`}>
          <h1 className="text-xl font-bold text-red-800">Payment not completed</h1>
          <p className="mt-2 text-sm text-gray-700">The gateway reported this payment as failed, so no charge was confirmed and no report was unlocked.</p>
          <a href="/premium-report" className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white">Try again</a>
        </div>
      )}
      {state === 'pending' && (
        <div className={`${box} border-amber-200 bg-amber-50`}>
          <h1 className="text-xl font-bold">Still waiting for confirmation</h1>
          <p className="mt-2 text-sm text-gray-700">We haven&apos;t received confirmation from the gateway yet. If you were charged, keep this page&apos;s link (order {order}) — your report unlocks as soon as payment is confirmed. Reload this page in a minute, or <a className="underline" href="/contact">contact us</a> with your order reference.</p>
        </div>
      )}
      {state === 'error' && (
        <div className={`${box} border-gray-200 bg-white`}>
          <h1 className="text-xl font-bold">Order not found</h1>
          <a href="/premium-report" className="mt-4 inline-block underline">Back to Premium Visa Report</a>
        </div>
      )}
    </main>
  )
}
