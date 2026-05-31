'use client'
import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { DocumentResult, CriterionResult } from './ResultCard'
import type { DocumentSpec } from '@/app/data/documentRequirements'

interface DocEntry { spec: DocumentSpec; result: DocumentResult | null }

interface Props {
  docs: DocEntry[]
  country: string
  onClose: () => void
}

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
  // fails first (critical first), then warnings
  return items.sort((a, b) => {
    const statusOrder = (s: string) => s === 'fail' ? 0 : 1
    if (statusOrder(a.criterion.status) !== statusOrder(b.criterion.status))
      return statusOrder(a.criterion.status) - statusOrder(b.criterion.status)
    return Number(b.critical) - Number(a.critical)
  })
}

function ScoreRing({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#1e293b" strokeWidth="12"/>
      <motion.circle
        cx="70" cy="70" r={r} fill="none"
        stroke={color} strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="65" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold">{score}</text>
      <text x="70" y="82" textAnchor="middle" fill="#94a3b8" fontSize="11">/ 100</text>
    </svg>
  )
}

function downloadPDF(docs: DocEntry[], country: string, score: number, priorities: Priority[]) {
  // Dynamic import jsPDF to avoid SSR issues
  import('jspdf').then(async ({ jsPDF }) => {
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()
    const teal = [20, 184, 166] as [number, number, number]

    doc.setFillColor(6, 12, 24)
    doc.rect(0, 0, 210, 297, 'F')

    doc.setTextColor(20, 184, 166)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('VisitPlane — Visa Document Report', 14, 20)

    doc.setTextColor(200, 200, 200)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Country: ${country.toUpperCase()}   |   Readiness Score: ${score}/100   |   ${new Date().toLocaleDateString()}`, 14, 30)

    let y = 44
    for (const { spec, result } of docs) {
      if (!result) continue
      doc.setTextColor(...teal)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text(spec.label, 14, y)
      y += 4

      autoTable(doc, {
        startY: y,
        head: [['Criterion', 'Status', 'Finding']],
        body: result.criteria.map(c => [c.id, c.status.toUpperCase(), c.finding]),
        theme: 'grid',
        headStyles: { fillColor: teal, textColor: [255,255,255] },
        bodyStyles: { textColor: [220,220,220], fillColor: [15,23,42] },
        alternateRowStyles: { fillColor: [20,30,55] },
        styles: { fontSize: 8, cellPadding: 2 },
        margin: { left: 14, right: 14 },
      })
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8
      if (y > 260) { doc.addPage(); y = 20 }
    }

    if (priorities.length) {
      doc.setTextColor(...teal)
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.text('Priority Actions', 14, y + 4)
      y += 10
      for (const p of priorities) {
        const icon = p.criterion.status === 'fail' ? '❌' : '⚠️'
        doc.setTextColor(220, 220, 220)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const line = `${icon} [${p.docLabel}] ${p.criterion.finding}`
        doc.text(line, 14, y, { maxWidth: 182 })
        y += 6
        if (p.criterion.suggestion) {
          doc.setTextColor(150, 150, 150)
          doc.text(`   💡 ${p.criterion.suggestion}`, 14, y, { maxWidth: 182 })
          y += 6
        }
        if (y > 270) { doc.addPage(); y = 20 }
      }
    }

    doc.save(`visitplane-visa-report-${country}-${Date.now()}.pdf`)
  })
}

export default function FinalReport({ docs, country, onClose }: Props) {
  const score      = weightedScore(docs)
  const priorities = getPriorities(docs)
  const checked    = docs.filter(d => d.result).length
  const passed     = docs.filter(d => d.result?.overallStatus === 'pass').length
  const failed     = docs.filter(d => d.result?.overallStatus === 'fail').length

  const status = score >= 80 ? 'ready' : score >= 50 ? 'almost' : 'not_ready'
  const statusCfg = {
    ready:    { label: '✅ Ready to Apply',        color: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-500/30' },
    almost:   { label: '⚠️ Almost Ready',           color: 'text-amber-400',  bg: 'bg-amber-900/20',  border: 'border-amber-500/30' },
    not_ready:{ label: '❌ Documents Need Attention', color: 'text-red-400',    bg: 'bg-red-900/20',    border: 'border-red-500/30'   },
  }[status]

  const emailBody = encodeURIComponent(
    `VisitPlane Visa Document Report\nCountry: ${country}\nScore: ${score}/100\n\n` +
    priorities.map(p => `• [${p.docLabel}] ${p.criterion.finding}${p.criterion.suggestion ? '\n  💡 ' + p.criterion.suggestion : ''}`).join('\n')
  )

  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }} className="space-y-5">
      {/* Score */}
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 py-6">
        <ScoreRing score={score} />
        <div className={`rounded-full border px-4 py-1.5 text-sm font-bold ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
          {statusCfg.label}
        </div>
        <div className="flex gap-6 text-center text-xs text-gray-400">
          <span><span className="block text-lg font-bold text-white">{checked}</span>Checked</span>
          <span><span className="block text-lg font-bold text-green-400">{passed}</span>Passed</span>
          <span><span className="block text-lg font-bold text-red-400">{failed}</span>Failed</span>
        </div>
      </div>

      {/* Priority actions */}
      {priorities.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-white">Priority Actions</p>
          {priorities.map((p, i) => (
            <div key={i} className={`rounded-xl border p-3 ${p.criterion.status === 'fail' ? 'border-red-500/30 bg-red-900/10' : 'border-amber-500/30 bg-amber-900/10'}`}>
              <p className="text-xs text-gray-200">
                <span className="font-semibold text-gray-400">[{p.docLabel}]</span> {p.criterion.finding}
              </p>
              {p.criterion.suggestion && (
                <p className="mt-1 text-xs text-gray-400">💡 {p.criterion.suggestion}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => downloadPDF(docs, country, score, priorities)}
          className="flex-1 rounded-xl bg-[#14B8A6] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#0EA5A0]"
        >
          📥 Download PDF Report
        </button>
        <a
          href={`mailto:?subject=My%20Visa%20Document%20Report&body=${emailBody}`}
          className="flex-1 rounded-xl border border-[#14B8A6]/40 px-4 py-2.5 text-center text-sm font-semibold text-[#14B8A6] transition hover:bg-[#14B8A6]/10"
        >
          📧 Email Report
        </a>
      </div>

      <button onClick={onClose} className="w-full rounded-xl border border-white/10 py-2 text-sm text-gray-400 transition hover:border-white/20 hover:text-white">
        Close
      </button>
    </motion.div>
  )
}
