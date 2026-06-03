'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import type { DocumentSpec } from '@/app/data/documentRequirements'
import type { DocumentResult } from './ResultCard'

interface Props {
  docSpec: DocumentSpec
  country: string
  onResult: (result: DocumentResult) => void
  onError: (msg: string) => void
}

type Phase = 'idle' | 'compressing' | 'uploading' | 'analyzing' | 'done' | 'error'

// ─── Per-document type tips ───────────────────────────────────────────────────
const DOC_TIPS: Record<string, { icon: string; tips: string[]; accept?: string }> = {
  passport: {
    icon: '🛂',
    tips: [
      'Include both pages of the bio/data page',
      'Ensure the MRZ (two lines of characters) at the bottom is fully visible',
      'No glare, shadows, or fingers covering the page',
      'Clear, high-res photo — phone camera is fine',
    ],
  },
  photo: {
    icon: '🖼️',
    tips: [
      'Pure white or light grey background',
      'Face centered, full frontal, neutral expression',
      'No glasses (ICAO 2015 rule)',
      'Good even lighting — no harsh shadows on face',
    ],
  },
  bank: {
    icon: '🏦',
    tips: [
      'Must show the last 3+ months of transactions',
      'Account holder name must be clearly visible',
      'Ensure the bank letterhead or stamp is in frame',
      'PDF print-out or screenshot with all pages',
    ],
  },
  insurance: {
    icon: '🛡️',
    tips: [
      'Coverage amount must be visible (Schengen: min €30,000)',
      'Policy dates must cover your entire trip',
      'Emergency contact number on the doc is a good sign',
      'Include all pages of the certificate',
    ],
  },
  hotel: {
    icon: '🏨',
    tips: [
      'Booking confirmation number must be visible',
      'Check-in and check-out dates clearly shown',
      'Your name on the booking should match your passport',
      'Screenshot from booking email or platform is fine',
    ],
  },
  flight: {
    icon: '✈️',
    tips: [
      'Both outbound AND return flights must be shown',
      'Passenger name must be clearly visible',
      'Flight numbers help — include the full itinerary',
      'An e-ticket or booking confirmation works',
    ],
  },
  default: {
    icon: '📄',
    tips: [
      'Ensure all text is clearly readable',
      'Include all pages of the document',
      'No glare, shadows, or cropping',
      'PNG, JPG, or PDF accepted',
    ],
  },
}

function getDocTips(label: string) {
  const lower = label.toLowerCase()
  if (lower.includes('passport') && !lower.includes('photo')) return DOC_TIPS.passport
  if (lower.includes('photo') || lower.includes('photograph')) return DOC_TIPS.photo
  if (lower.includes('bank') || lower.includes('statement')) return DOC_TIPS.bank
  if (lower.includes('insurance')) return DOC_TIPS.insurance
  if (lower.includes('hotel') || lower.includes('accommodation')) return DOC_TIPS.hotel
  if (lower.includes('flight') || lower.includes('ticket') || lower.includes('itinerary')) return DOC_TIPS.flight
  return DOC_TIPS.default
}

// ─── Per-document rotating analysis messages ──────────────────────────────────
const ANALYSIS_MESSAGES: Record<string, string[]> = {
  passport: [
    'Reading passport data page…',
    'Checking MRZ lines…',
    'Verifying expiry date…',
    'Confirming nationality…',
    'Checking blank visa pages…',
    'Validating with AI…',
  ],
  photo: [
    'Checking background color…',
    'Analyzing face position…',
    'Looking for glasses…',
    'Checking lighting quality…',
    'Verifying portrait dimensions…',
    'Comparing against embassy specs…',
  ],
  bank: [
    'Identifying bank letterhead…',
    'Reading transaction dates…',
    'Checking account holder name…',
    'Estimating balance…',
    'Verifying statement period…',
    'Cross-referencing requirements…',
  ],
  insurance: [
    'Identifying insurance provider…',
    'Reading coverage amount…',
    'Checking policy dates…',
    'Verifying territory coverage…',
    'Looking for medical evacuation clause…',
  ],
  hotel: [
    'Finding confirmation number…',
    'Reading check-in dates…',
    'Verifying hotel name…',
    'Checking guest name match…',
  ],
  flight: [
    'Reading passenger name…',
    'Finding outbound flight…',
    'Checking return flight…',
    'Verifying flight dates…',
    'Reading booking reference…',
  ],
  default: [
    'Reading document…',
    'Checking details…',
    'Verifying requirements…',
    'Analyzing with AI…',
  ],
}

function getAnalysisMessages(label: string): string[] {
  const lower = label.toLowerCase()
  if (lower.includes('passport') && !lower.includes('photo')) return ANALYSIS_MESSAGES.passport
  if (lower.includes('photo') || lower.includes('photograph')) return ANALYSIS_MESSAGES.photo
  if (lower.includes('bank') || lower.includes('statement')) return ANALYSIS_MESSAGES.bank
  if (lower.includes('insurance')) return ANALYSIS_MESSAGES.insurance
  if (lower.includes('hotel') || lower.includes('accommodation')) return ANALYSIS_MESSAGES.hotel
  if (lower.includes('flight') || lower.includes('ticket') || lower.includes('itinerary')) return ANALYSIS_MESSAGES.flight
  return ANALYSIS_MESSAGES.default
}

// ─── Image compression ────────────────────────────────────────────────────────
const MAX_DIM  = 1400
const MAX_SIZE = 0.6 * 1024 * 1024   // 0.6 MB

function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    // For PDFs — convert first page via browser (limited, but skip & send as-is for now)
    if (file.type === 'application/pdf') {
      const reader = new FileReader()
      reader.onload = e => {
        const base64 = (e.target?.result as string).split(',')[1]
        resolve({ base64, mimeType: 'image/jpeg' }) // treat PDF as JPEG for vision API
      }
      reader.onerror = () => reject(new Error('Could not read PDF'))
      reader.readAsDataURL(file)
      return
    }

    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > MAX_DIM || height > MAX_DIM) {
        const ratio = Math.min(MAX_DIM / width, MAX_DIM / height)
        width  = Math.round(width  * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width  = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      let quality = 0.88
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      while (dataUrl.length * 0.75 > MAX_SIZE && quality > 0.4) {
        quality -= 0.08
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }
      resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' })
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image')) }
    img.src = url
  })
}

// ─── Rotating tip during analysis ─────────────────────────────────────────────
function RotatingAnalysisTip({ messages }: { messages: string[] }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx(i => (i + 1) % messages.length)
    }, 1800)
    return () => clearInterval(interval)
  }, [messages])

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={idx}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.3 }}
        className="text-xs text-[#14B8A6]"
      >
        {messages[idx]}
      </motion.p>
    </AnimatePresence>
  )
}

// ─── Main UploadStep ──────────────────────────────────────────────────────────
export default function UploadStep({ docSpec, country, onResult, onError }: Props) {
  const [phase, setPhase]       = useState<Phase>('idle')
  const [preview, setPreview]   = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const abortRef = useRef(false)

  const docTips      = getDocTips(docSpec.label)
  const analysisMsgs = getAnalysisMessages(docSpec.label)

  const process = useCallback(async (file: File) => {
    abortRef.current = false
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)
    setPhase('compressing')

    let base64: string
    let mimeType: string
    try {
      ;({ base64, mimeType } = await compressImage(file))
    } catch {
      setPhase('error')
      setErrorMsg('Could not read the image. Please try a different file or take a fresh photo.')
      onError('Image compression failed')
      return
    }
    if (abortRef.current) return

    setPhase('uploading')
    await new Promise(r => setTimeout(r, 250))
    if (abortRef.current) return
    setPhase('analyzing')

    let res: Response
    try {
      res = await fetch('/api/check-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType,
          documentType: docSpec.label,
          country,
          criteria: docSpec.criteria,
        }),
      })
    } catch {
      setPhase('error')
      setErrorMsg('Network error — check your connection and try again.')
      onError('Network error')
      return
    }

    const data = await res.json()

    if (res.status === 429) {
      setPhase('error')
      setErrorMsg(data.message ?? "Daily check limit reached. Upgrade to Pro for unlimited checks.")
      onError('Rate limit')
      return
    }

    if (!res.ok) {
      const msg = data.message ?? 'Something went wrong. Please try again.'
      setPhase('error')
      setErrorMsg(msg)
      onError(msg)
      return
    }

    setPhase('done')
    onResult(data as DocumentResult)
  }, [docSpec, country, onResult, onError])

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) process(accepted[0])
  }, [process])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'application/pdf': [],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,  // 10MB before compression
    disabled: phase !== 'idle' && phase !== 'error',
  })

  const retry = () => {
    abortRef.current = true
    if (preview) URL.revokeObjectURL(preview)
    setPhase('idle')
    setPreview(null)
    setErrorMsg('')
  }

  const busy = phase === 'compressing' || phase === 'uploading' || phase === 'analyzing'

  return (
    <div className="space-y-3">
      {/* Tips */}
      <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-sm">{docTips.icon}</span>
          <p className="text-xs font-semibold text-gray-400">Tips for a good scan</p>
        </div>
        <ul className="space-y-1">
          {docTips.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-gray-500">
              <span className="shrink-0 text-[#14B8A6] mt-0.5">·</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <AnimatePresence mode="wait">
        {/* Idle / Error → drop zone */}
        {(phase === 'idle' || phase === 'error') && (
          <motion.div key="drop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition
                ${isDragActive
                  ? 'border-[#14B8A6] bg-[#14B8A6]/10 scale-[1.01]'
                  : 'border-white/20 bg-white/[0.02] hover:border-[#14B8A6]/60 hover:bg-[#14B8A6]/5'
                }`}
            >
              <input {...getInputProps()} />
              <span className="text-3xl">{isDragActive ? '📂' : '📤'}</span>
              <div>
                <p className="text-sm font-medium text-gray-300">
                  {isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">JPG, PNG, WebP, or PDF · Max 10MB</p>
              </div>
            </div>

            {phase === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-start gap-2 rounded-lg bg-red-900/20 border border-red-500/30 px-3 py-2.5"
              >
                <span className="text-sm shrink-0">❌</span>
                <div className="flex-1">
                  <p className="text-xs text-red-300 leading-relaxed">{errorMsg}</p>
                  <button
                    onClick={retry}
                    className="mt-1.5 text-xs font-semibold text-[#14B8A6] underline"
                  >
                    Try again
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Busy → analyzing state */}
        {busy && (
          <motion.div key="busy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="rounded-xl border border-[#14B8A6]/20 bg-[#14B8A6]/5 p-4 space-y-3"
          >
            {preview && (
              <div className="relative mx-auto w-fit">
                <img
                  src={preview}
                  alt="preview"
                  className="h-20 w-auto rounded-lg object-cover opacity-50 ring-1 ring-white/10"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-6 w-6 rounded-full border-2 border-[#14B8A6] border-t-transparent animate-spin" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              {/* Progress steps */}
              {[
                { phase: 'compressing', label: 'Compressing image' },
                { phase: 'uploading',   label: 'Uploading securely' },
                { phase: 'analyzing',   label: 'AI reviewing document' },
              ].map((s, i) => {
                const phaseOrder = { compressing: 0, uploading: 1, analyzing: 2, idle: -1, done: 3, error: -1 }
                const currentOrder = phaseOrder[phase] ?? -1
                const stepOrder = i
                const isActive = stepOrder === currentOrder
                const isDone   = stepOrder < currentOrder

                return (
                  <div key={s.phase} className={`flex items-center gap-2 text-xs transition ${
                    isActive ? 'text-[#14B8A6]'
                    : isDone  ? 'text-green-400'
                    : 'text-gray-600'
                  }`}>
                    {isDone
                      ? <span className="text-green-400">✓</span>
                      : isActive
                      ? <span className="inline-block h-3 w-3 rounded-full border-2 border-[#14B8A6] border-t-transparent animate-spin" />
                      : <span className="inline-block h-3 w-3 rounded-full border border-gray-700" />
                    }
                    <span className={isActive ? 'font-medium' : ''}>{s.label}</span>
                  </div>
                )
              })}
            </div>

            {/* Rotating tips (only during analysis) */}
            {phase === 'analyzing' && (
              <div className="border-t border-white/5 pt-2">
                <RotatingAnalysisTip messages={analysisMsgs} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
