'use client'
import { useCallback, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import type { DocumentResult } from './ResultCard'

interface Props {
  docLabel: string
  documentType: string
  country: string
  criteria: Array<{ id: string; label: string; critical: boolean }>
  onResult: (result: DocumentResult) => void
  onError: (msg: string) => void
}

type Phase = 'idle' | 'compressing' | 'uploading' | 'analyzing' | 'done' | 'error'

const STEPS = [
  { phase: 'compressing', label: 'Compressing image…' },
  { phase: 'uploading',   label: 'Uploading securely…' },
  { phase: 'analyzing',   label: 'AI reviewing document…' },
]

const MAX_DIM  = 1200
const MAX_SIZE = 0.5 * 1024 * 1024   // 0.5 MB

function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
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

      let quality = 0.85
      let dataUrl = canvas.toDataURL('image/jpeg', quality)
      while (dataUrl.length * 0.75 > MAX_SIZE && quality > 0.4) {
        quality -= 0.1
        dataUrl = canvas.toDataURL('image/jpeg', quality)
      }
      const base64 = dataUrl.split(',')[1]
      resolve({ base64, mimeType: 'image/jpeg' })
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not load image')) }
    img.src = url
  })
}

export default function UploadStep({ docLabel, documentType, country, criteria, onResult, onError }: Props) {
  const [phase, setPhase]   = useState<Phase>('idle')
  const [preview, setPreview] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const abortRef = useRef(false)

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
      setErrorMsg('Could not read the image. Please try a different file.')
      onError('Image compression failed')
      return
    }
    if (abortRef.current) return

    setPhase('uploading')
    await new Promise(r => setTimeout(r, 300))
    setPhase('analyzing')

    let res: Response
    try {
      res = await fetch('/api/check-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType, documentType, country, criteria }),
      })
    } catch {
      setPhase('error')
      setErrorMsg('Network error. Please check your connection and try again.')
      onError('Network error')
      return
    }

    const data = await res.json()
    if (!res.ok) {
      const msg = data.message ?? 'Something went wrong. Please try again.'
      setPhase('error')
      setErrorMsg(msg)
      onError(msg)
      return
    }

    setPhase('done')
    onResult(data as DocumentResult)
  }, [documentType, country, criteria, onResult, onError])

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) process(accepted[0])
  }, [process])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
    disabled: phase !== 'idle' && phase !== 'error',
  })

  const retry = () => {
    abortRef.current = true
    setPhase('idle')
    setPreview(null)
    setErrorMsg('')
  }

  const busy = phase === 'compressing' || phase === 'uploading' || phase === 'analyzing'

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-white">{docLabel}</p>

      <AnimatePresence mode="wait">
        {phase === 'idle' || phase === 'error' ? (
          <motion.div key="drop" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition
                ${isDragActive ? 'border-[#14B8A6] bg-[#14B8A6]/10' : 'border-white/20 bg-white/5 hover:border-[#14B8A6]/60 hover:bg-[#14B8A6]/5'}`}
            >
              <input {...getInputProps()} />
              <span className="text-3xl">📄</span>
              <p className="text-sm text-gray-300">{isDragActive ? 'Drop it here!' : 'Drag & drop or click to upload'}</p>
              <p className="text-xs text-gray-500">JPG, PNG, WebP · Max 10MB</p>
            </div>
            {phase === 'error' && (
              <div className="mt-2 flex items-start gap-2 rounded-lg bg-red-900/20 border border-red-500/30 px-3 py-2">
                <span className="text-sm">❌</span>
                <div className="flex-1">
                  <p className="text-xs text-red-300">{errorMsg}</p>
                  <button onClick={retry} className="mt-1 text-xs text-[#14B8A6] underline">Try again</button>
                </div>
              </div>
            )}
          </motion.div>
        ) : busy ? (
          <motion.div key="busy" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
            {preview && (
              <img src={preview} alt="preview" className="mx-auto mb-3 h-24 w-auto rounded-lg object-cover opacity-60" />
            )}
            {STEPS.map((s, i) => {
              const active  = s.phase === phase
              const done    = STEPS.findIndex(x => x.phase === phase) > i
              return (
                <div key={s.phase} className={`flex items-center gap-2 text-xs transition ${active ? 'text-[#14B8A6]' : done ? 'text-green-400' : 'text-gray-600'}`}>
                  {done    ? <span>✅</span>
                  : active ? <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#14B8A6] border-t-transparent"/>
                  :          <span className="inline-block h-3 w-3 rounded-full border border-gray-600"/>}
                  {s.label}
                </div>
              )
            })}
          </motion.div>
        ) : null /* done — parent shows ResultCard */}
      </AnimatePresence>
    </div>
  )
}
