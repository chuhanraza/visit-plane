'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type CriterionResult = { id: string; status: 'pass'|'warning'|'fail'; finding: string; suggestion: string|null }
export type DocumentResult  = { documentDetected: boolean; documentType: string; overallStatus: 'pass'|'warning'|'fail'; criteria: CriterionResult[]; generalNotes: string; confidence: number; score: number }

interface Props { docLabel: string; result: DocumentResult; onReUpload?: () => void }

const S = {
  pass:    { icon:'✅', label:'Passed',  bg:'bg-green-900/20', border:'border-green-500/30', text:'text-green-400',  badge:'bg-green-500/15 text-green-300'  },
  warning: { icon:'⚠️', label:'Warning', bg:'bg-amber-900/20', border:'border-amber-500/30', text:'text-amber-400',  badge:'bg-amber-500/15 text-amber-300'  },
  fail:    { icon:'❌', label:'Failed',  bg:'bg-red-900/20',   border:'border-red-500/30',   text:'text-red-400',    badge:'bg-red-500/15 text-red-300'      },
}

export default function ResultCard({ docLabel, result, onReUpload }: Props) {
  const [expanded, setExpanded] = useState(true)
  const cfg = S[result.overallStatus]
  return (
    <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4 }}
      className={`rounded-2xl border ${cfg.border} ${cfg.bg} overflow-hidden`}>
      <button onClick={() => setExpanded(v => !v)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
        <div className="flex items-center gap-3">
          <span className="text-xl leading-none">{cfg.icon}</span>
          <div>
            <p className="font-semibold text-white">{docLabel}</p>
            <p className="text-xs text-gray-400">{result.documentDetected ? `Detected: ${result.documentType}` : 'Document could not be read'}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${cfg.badge}`}>{cfg.label}</span>
          <span className={`text-xs ${cfg.text} ${expanded ? 'rotate-180' : ''} transition-transform`}>▲</span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div key="c" initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }} transition={{ duration:0.25 }} className="overflow-hidden">
            <div className="space-y-2 px-5 pb-5">
              {result.criteria.map(c => {
                const cs = S[c.status]
                return (
                  <div key={c.id} className="rounded-xl border border-white/5 bg-white/5 p-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-base leading-none">{cs.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm text-gray-200">{c.finding}</p>
                        {c.suggestion && (
                          <div className={`mt-2 flex items-start gap-2 rounded-lg ${cs.bg} border ${cs.border} px-3 py-2`}>
                            <span className="shrink-0 text-xs">💡</span>
                            <p className={`text-xs leading-relaxed ${cs.text}`}>{c.suggestion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              {result.generalNotes && (
                <div className="flex gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <span className="shrink-0 text-sm">📝</span>
                  <p className="text-xs leading-relaxed text-gray-400">{result.generalNotes}</p>
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-500">AI confidence: <span className="text-gray-400">{result.confidence}%</span></p>
                {(result.overallStatus !== 'pass') && onReUpload && (
                  <button onClick={onReUpload} className="rounded-lg border border-[#14B8A6]/40 px-3 py-1.5 text-xs font-semibold text-[#14B8A6] transition hover:bg-[#14B8A6]/10">🔄 Re-upload</button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
