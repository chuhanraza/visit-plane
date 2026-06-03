'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import type { DocumentResult, CriterionResult } from './ResultCard'
import type { DocumentSpec } from '@/app/data/documentRequirements'

interface DocEntry { spec: DocumentSpec; result: DocumentResult | null }

interface Props {
  docs: DocEntry[]
  country: string
  onClose: () => void
}

// ─── Score computation ────────────────────────────────────────────────────────
function weightedScore(docs: DocEntry[]): number {
  let total = 0, earned = 0
  for (const { spec, result } of docs) {
    if (!result) { total += spec.criteria.reduce((s, c) => s + (c.critical ? 2 : 1), 0); continue }
    for (const c of spec.criteria) {
      const w = c.critical ? 2 : 1
      const r = result.criteria.find(r => r.id === c.id)
      const st = r?.status ?? 'fail'
      total  += w
      if (st === 'pass')    earned += w
      if (st === 'warning') earned += w * 0.5
    }
  }
  return total > 0 ? Math.round((earned / total) * 100) : 0
}

type Priority = { docLabel: string; criterion: CriterionResult; critical: boolean }

function getPriorities(docs: DocEntry[]): Priority[] {
  const items: Priority[] = []
  for (const { spec, result } of docs) {
    if (!result) continue
    for (const cr of result.criteria) {
      if (cr.status === 'pass') continue
      const specC = spec.criteria.find(c => c.id === cr.id)
      items.push({ docLabel: spec.label, criterion: cr, critical: specC?.critical ?? false })
    }
  }
  return items.sort((a, b) => {
    const ord = (s: string) => s === 'fail' ? 0 : 1
    if (ord(a.criterion.status) !== ord(b.criterion.status))
      return ord(a.criterion.status) - ord(b.criterion.status)
    return Number(b.critical) - Number(a.critical)
  })
}

// ─── Animated score ring ──────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r     = 54
  const circ  = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'
  const label = score >= 80 ? 'Ready to Apply' : score >= 50 ? 'Almost Ready' : 'Needs Attention'
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#1e293b" strokeWidth="12"/>
        <motion.circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.3, ease: 'easeOut' }}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="65" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">{score}</text>
        <text x="70" y="82" textAnchor="middle" fill="#94a3b8" fontSize="11">/ 100</text>
      </svg>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-sm font-semibold"
        style={{ color }}
      >
        {score >= 80 ? '✅' : score >= 50 ? '⚠️' : '❌'} {label}
      </motion.p>
    </div>
  )
}

// ─── PDF generation ───────────────────────────────────────────────────────────
async function downloadPDF(docs: DocEntry[], country: string, score: number, priorities: Priority[]) {
  const { jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')
  const doc = new jsPDF()
  const teal = [20, 184, 166] as [number, number, number]
  const dark = [13, 21, 38] as [number, number, number]
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  // Background
  doc.setFillColor(...dark)
  doc.rect(0, 0, 210, 297, 'F')

  // Header bar
  doc.setFillColor(...teal)
  doc.rect(0, 0, 210, 30, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('VisitPlane — Visa Document Report', 14, 13)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`${country.toUpperCase()}  ·  Score: ${score}/100  ·  ${dateStr}`, 14, 22)

  // Score summary box
  const scoreColor = score >= 80 ? [34, 197, 94] : score >= 50 ? [245, 158, 11] : [239, 68, 68]
  doc.setFillColor(20, 30, 55)
  doc.roundedRect(14, 36, 182, 22, 3, 3, 'F')
  doc.setTextColor(...(scoreColor as [number, number, number]))
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  const statusLabel = score >= 80 ? '✓ Ready to Apply' : score >= 50 ? '⚠ Almost Ready' : '✗ Needs Attention'
  doc.text(statusLabel, 20, 50)
  doc.setTextColor(160, 160, 160)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const checked = docs.filter(d => d.result).length
  const passed  = docs.filter(d => d.result?.overallStatus === 'pass').length
  doc.text(`${checked} documents checked  ·  ${passed} passed  ·  ${checked - passed} need attention`, 20, 56)

  let y = 68

  // Per-document tables
  for (const { spec, result } of docs) {
    if (!result) continue

    doc.setTextColor(...teal)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    const docStatus = result.overallStatus === 'pass' ? '✓' : result.overallStatus === 'warning' ? '⚠' : '✗'
    doc.text(`${docStatus} ${spec.label}`, 14, y)
    y += 2

    autoTable(doc, {
      startY: y,
      head: [['Check', 'Result', 'Finding']],
      body: result.criteria.map(c => [
        c.id.replace(/_/g, ' '),
        c.status.toUpperCase(),
        c.finding + (c.suggestion ? `\n→ ${c.suggestion}` : ''),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [20, 40, 70], textColor: [200, 200, 200], fontSize: 8 },
      bodyStyles: { textColor: [200, 200, 200], fillColor: [15, 23, 42], fontSize: 7.5, cellPadding: 2 },
      alternateRowStyles: { fillColor: [20, 30, 50] },
      columnStyles: {
        0: { cellWidth: 40, fontStyle: 'bold' },
        1: { cellWidth: 20 },
        2: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.column.index === 1) {
          const val = data.cell.raw as string
          if (val === 'PASS')    data.cell.styles.textColor = [34, 197, 94]
          if (val === 'WARNING') data.cell.styles.textColor = [245, 158, 11]
          if (val === 'FAIL')    data.cell.styles.textColor = [239, 68, 68]
        }
      },
      margin: { left: 14, right: 14 },
    })

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
    if (y > 260) { doc.addPage(); doc.setFillColor(...dark); doc.rect(0, 0, 210, 297, 'F'); y = 20 }
  }

  // Priority actions
  if (priorities.length) {
    if (y > 230) { doc.addPage(); doc.setFillColor(...dark); doc.rect(0, 0, 210, 297, 'F'); y = 20 }
    doc.setTextColor(...teal)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Priority Actions Before Submission', 14, y + 6)
    y += 12

    for (const p of priorities) {
      const statusColor = p.criterion.status === 'fail'
        ? [239, 68, 68] as [number, number, number]
        : [245, 158, 11] as [number, number, number]
      doc.setTextColor(...statusColor)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.text(`[${p.docLabel}]`, 14, y)
      doc.setTextColor(210, 210, 210)
      doc.setFont('helvetica', 'normal')
      doc.text(p.criterion.finding, 52, y, { maxWidth: 144 })
      y += 5
      if (p.criterion.suggestion) {
        doc.setTextColor(140, 140, 140)
        doc.text(`→ ${p.criterion.suggestion}`, 20, y, { maxWidth: 176 })
        y += 5
      }
      y += 2
      if (y > 270) { doc.addPage(); doc.setFillColor(...dark); doc.rect(0, 0, 210, 297, 'F'); y = 20 }
    }
  }

  // Footer
  doc.setPage(doc.getNumberOfPages())
  doc.setTextColor(60, 80, 110)
  doc.setFontSize(7)
  doc.text('Generated by VisitPlane.com — AI-powered visa document verification. Not legal advice.', 14, 290)

  doc.save(`visitplane-${country.toLowerCase().replace(/\s+/g, '-')}-visa-report.pdf`)
}

// ─── Main FinalReport ─────────────────────────────────────────────────────────
export default function FinalReport({ docs, country, onClose }: Props) {
  const score      = weightedScore(docs)
  const priorities = getPriorities(docs)
  const checked    = docs.filter(d => d.result).length
  const passed     = docs.filter(d => d.result?.overallStatus === 'pass').length
  const warnings   = docs.filter(d => d.result?.overallStatus === 'warning').length
  const failed     = docs.filter(d => d.result?.overallStatus === 'fail').length

  const [email, setEmail]     = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  function sendEmailReport() {
    if (!email || sending || sent) return
    setSending(true)
    // Build plain-text report for mailto
    const subject = `My ${country} Visa Document Report — ${score}/100`
    const lines = [
      `VisitPlane Visa Document Report`,
      `Country: ${country}   |   Readiness Score: ${score}/100`,
      `Generated: ${new Date().toLocaleDateString()}`,
      '',
      `SUMMARY`,
      `Documents checked: ${checked}`,
      `Passed: ${passed}  |  Warnings: ${warnings}  |  Failed: ${failed}`,
      '',
    ]

    if (priorities.length > 0) {
      lines.push('PRIORITY ACTIONS')
      for (const p of priorities) {
        lines.push(`• [${p.docLabel}] ${p.criterion.finding}`)
        if (p.criterion.suggestion) lines.push(`  → ${p.criterion.suggestion}`)
      }
      lines.push('')
    }

    lines.push('Full report available at: https://visitplane.com')

    const body = encodeURIComponent(lines.join('\n'))
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`
    window.location.href = mailto
    setTimeout(() => { setSending(false); setSent(true) }, 500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Score ring */}
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-6">
        <ScoreRing score={score} />
        <div className="flex gap-6 text-center text-xs text-gray-500">
          <span>
            <span className="block text-xl font-bold text-white">{checked}</span>
            Checked
          </span>
          <span>
            <span className="block text-xl font-bold text-green-400">{passed}</span>
            Passed
          </span>
          {warnings > 0 && (
            <span>
              <span className="block text-xl font-bold text-amber-400">{warnings}</span>
              Warning
            </span>
          )}
          {failed > 0 && (
            <span>
              <span className="block text-xl font-bold text-red-400">{failed}</span>
              Failed
            </span>
          )}
        </div>
      </div>

      {/* Priority actions */}
      {priorities.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Priority Actions</p>
          {priorities.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-xl border p-3 ${
                p.criterion.status === 'fail'
                  ? 'border-red-500/30 bg-red-900/10'
                  : 'border-amber-500/30 bg-amber-900/10'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm shrink-0">{p.criterion.status === 'fail' ? '❌' : '⚠️'}</span>
                <div>
                  <p className="text-xs font-semibold text-gray-400">{p.docLabel}</p>
                  <p className="text-xs text-gray-200 mt-0.5">{p.criterion.finding}</p>
                  {p.criterion.suggestion && (
                    <p className="mt-1.5 text-xs text-gray-400">💡 {p.criterion.suggestion}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {priorities.length === 0 && (
        <div className="rounded-xl border border-green-500/20 bg-green-900/10 px-4 py-3 text-center">
          <p className="text-sm text-green-400 font-semibold">🎉 All documents look great!</p>
          <p className="text-xs text-green-400/60 mt-0.5">You&apos;re ready to submit your visa application.</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => downloadPDF(docs, country, score, priorities)}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#14B8A6] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0EA5A0]"
        >
          📥 Download PDF Report
        </button>
      </div>

      {/* Email report */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-4 space-y-2">
        <p className="text-xs font-semibold text-gray-400">📧 Email this report to yourself</p>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-600 outline-none focus:border-[#14B8A6]/60 focus:bg-[#14B8A6]/5 transition"
            onKeyDown={e => e.key === 'Enter' && sendEmailReport()}
          />
          <button
            onClick={sendEmailReport}
            disabled={!email || sending || sent}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-bold transition ${
              sent
                ? 'bg-green-600 text-white'
                : email
                ? 'bg-[#14B8A6] text-white hover:bg-[#0d9488]'
                : 'bg-white/10 text-gray-600 cursor-not-allowed'
            }`}
          >
            {sent ? '✓ Sent' : sending ? '…' : 'Send'}
          </button>
        </div>
      </div>

      {/* Pro upsell in report */}
      <div className="rounded-xl border border-[#6366F1]/30 bg-[#6366F1]/5 px-4 py-4">
        <p className="text-sm font-bold text-indigo-300 mb-1">⚡ VisitPlane Pro · $9/month</p>
        <ul className="space-y-1 mb-3">
          {[
            'Unlimited document checks across all destinations',
            'Priority verification — under 5 seconds',
            'PDF reports with embassy source citations',
            'Save your documents securely for re-use',
          ].map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
              <span className="text-indigo-400">✓</span> {f}
            </li>
          ))}
        </ul>
        <button className="w-full rounded-lg bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] py-2.5 text-sm font-bold text-white transition hover:from-[#4F46E5] hover:to-[#7C3AED]">
          Upgrade to Pro →
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full rounded-xl border border-white/10 py-2 text-sm text-gray-500 transition hover:border-white/20 hover:text-gray-400"
      >
        Close
      </button>
    </motion.div>
  )
}
