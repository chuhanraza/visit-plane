'use client'
/**
 * Passport Scanner — ICAO 9303-compliant MRZ reader
 * Pipeline: imagePreprocessor → mrzExtractor (Tesseract) → mrzParser (mrz library)
 * 100% client-side. No passport data leaves the browser unless user opts into Gemini fallback.
 */

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { preprocessForMRZ, type PreprocessResult }  from '@/utils/imagePreprocessor'
import { extractMRZLines, type MRZExtractResult }   from '@/utils/mrzExtractor'
import { parseMRZLines, type MRZParseResult }       from '@/utils/mrzParser'
import { extractMRZWithGemini, GEMINI_CONSENT_PROMPT, dataUrlToBase64 } from '@/utils/geminiFallback'

// ── Visa Photo constants (unchanged) ─────────────────────────────────────────
const COUNTRIES = [
  { value:'usa',       flag:'🇺🇸', label:'USA',          spec:'2×2 inch, white bg',  maxKB:240,   w:600,  h:600  },
  { value:'uk',        flag:'🇬🇧', label:'UK',           spec:'35×45mm, white bg',   maxKB:10240, w:413,  h:531  },
  { value:'australia', flag:'🇦🇺', label:'Australia',    spec:'35×45mm, white bg',   maxKB:10240, w:413,  h:531  },
  { value:'canada',    flag:'🇨🇦', label:'Canada',       spec:'50×70mm, white bg',   maxKB:4096,  w:591,  h:827  },
  { value:'schengen',  flag:'🇩🇪', label:'Schengen',     spec:'35×45mm, white bg',   maxKB:50,    w:413,  h:531  },
  { value:'saudi',     flag:'🇸🇦', label:'Saudi Arabia', spec:'40×60mm, white bg',   maxKB:100,   w:472,  h:709  },
  { value:'uae',       flag:'🇦🇪', label:'UAE',          spec:'40×60mm, white bg',   maxKB:100,   w:472,  h:709  },
  { value:'pakistan',  flag:'🇵🇰', label:'Pakistan',     spec:'35×45mm, white bg',   maxKB:50,    w:413,  h:531  },
]
const SPECS_TABLE = [
  { country:'🇺🇸 USA',          size:'2×2" (51×51mm)', bg:'White',       maxKB:'240KB', dpi:'300' },
  { country:'🇬🇧 UK',           size:'35×45mm',        bg:'White/Light', maxKB:'10MB',  dpi:'300' },
  { country:'🇩🇪 Schengen',     size:'35×45mm',        bg:'White',       maxKB:'50KB',  dpi:'300' },
  { country:'🇸🇦 Saudi Arabia', size:'40×60mm',        bg:'White',       maxKB:'100KB', dpi:'300' },
  { country:'🇦🇪 UAE',          size:'40×60mm',        bg:'White',       maxKB:'100KB', dpi:'300' },
  { country:'🇵🇰 Pakistan',     size:'35×45mm',        bg:'White',       maxKB:'50KB',  dpi:'300' },
  { country:'🇦🇺 Australia',    size:'35×45mm',        bg:'White',       maxKB:'10MB',  dpi:'300' },
  { country:'🇨🇦 Canada',       size:'50×70mm',        bg:'White',       maxKB:'4MB',   dpi:'300' },
]

// ── MRZ tooltip ───────────────────────────────────────────────────────────────
function MRZTooltip() {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(v => !v)} type="button"
        className="text-xs text-teal-100 underline decoration-dotted hover:text-white">
        What is MRZ?
      </button>
      {open && (
        <div className="absolute z-50 bottom-full right-0 mb-2 w-72 rounded-xl border border-teal-200 bg-white shadow-xl p-4 text-xs text-gray-700">
          <button onClick={() => setOpen(false)} type="button"
            className="absolute top-2 right-3 text-gray-400 hover:text-gray-600 text-base">×</button>
          <p className="font-bold text-teal-700 mb-2">Machine Readable Zone (MRZ)</p>
          <p className="mb-2">The two rows of monospaced text at the very bottom of your passport data page:</p>
          <div className="rounded-lg bg-gray-900 text-green-400 font-mono text-[10px] px-3 py-2 leading-5 overflow-x-auto">
            <div>P&lt;PAKASHRAF&lt;&lt;MUHAMMAD&lt;SALMAN&lt;&lt;&lt;</div>
            <div>EY1849933&lt;3PAK9203228M2409294&lt;&lt;&lt;&lt;</div>
          </div>
          <p className="mt-2 text-gray-500">Encodes name, passport number, nationality, DOB, sex and expiry — with built-in check digits to detect any misread character.</p>
          <p className="mt-2 font-semibold text-teal-700">✅ Make sure the entire bottom strip is in frame.</p>
        </div>
      )}
    </div>
  )
}

// ── Check-digit badge ─────────────────────────────────────────────────────────
function CheckBadge({ valid, label }: { valid: boolean; label: string }) {
  return (
    <span title={valid ? `${label}: check digit ✓` : `${label}: check digit failed — verify manually`}
      className={`ml-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold
        ${valid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {valid ? '✓' : '!'}
    </span>
  )
}

// ── Passport Scanner ──────────────────────────────────────────────────────────
function PassportScanner() {
  const [preview,     setPreview]     = useState<string>('')
  const [scanning,    setScanning]    = useState(false)
  const [progress,    setProgress]    = useState(0)
  const [status,      setStatus]      = useState('')
  const [result,      setResult]      = useState<MRZParseResult | null>(null)
  const [error,       setError]       = useState('')
  const [dragging,    setDragging]    = useState(false)
  const [copiedField, setCopiedField] = useState('')
  const [copiedAll,   setCopiedAll]   = useState(false)
  // Gemini fallback
  const [showGemini,  setShowGemini]  = useState(false)
  const [apiKey,      setApiKey]      = useState('')
  const [geminiRun,   setGeminiRun]   = useState(false)
  const [pendingUrl,  setPendingUrl]  = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const copyField = (v: string, f: string) => {
    if (!v) return
    navigator.clipboard.writeText(v)
    setCopiedField(f); setTimeout(() => setCopiedField(''), 1500)
  }
  const copyAll = () => {
    if (!result?.fields) return
    const f = result.fields
    navigator.clipboard.writeText([
      `Full Name:      ${f.fullName}`,
      `Surname:        ${f.surname}`,
      `Given Names:    ${f.givenNames}`,
      `Passport No:    ${f.passportNumber}`,
      `Nationality:    ${f.nationalityName} (${f.nationality})`,
      `Issuing State:  ${f.issuingCountryName} (${f.issuingCountry})`,
      `Date of Birth:  ${f.dateOfBirth}`,
      `Date of Expiry: ${f.dateOfExpiry}`,
      `Sex:            ${f.sex}`,
    ].join('\n'))
    setCopiedAll(true); setTimeout(() => setCopiedAll(false), 2000)
  }

  const runPipeline = useCallback(async (file: File) => {
    setScanning(true); setResult(null); setError('');
    setProgress(0); setStatus('Preparing image…'); setShowGemini(false)
    let pre: PreprocessResult | null = null
    try {
      pre = await preprocessForMRZ(file)
      setPreview(pre.fullPreviewUrl)
      setProgress(15)

      const ocr: MRZExtractResult = await extractMRZLines(
        pre.canvas,
        (pct, s) => { setProgress(15 + Math.round(pct * 0.70)); setStatus(s) },
        2,
      )
      setProgress(85)

      if (!ocr.lines) {
        setPendingUrl(pre.fullPreviewUrl)
        setShowGemini(true)
        setError(ocr.error ?? 'Could not read MRZ. Please retake photo with better lighting and the bottom of the passport fully visible.')
        return
      }

      setStatus('Validating check digits…')
      const parsed = parseMRZLines(ocr.lines[0], ocr.lines[1])
      setProgress(100)

      if (!parsed.success) {
        setError('MRZ read but could not be parsed. ' + (parsed.warnings[0] ?? 'Try a clearer photo.'))
        return
      }
      setResult(parsed)
    } catch (e) {
      setError(`Scan failed: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setScanning(false)
    }
  }, [])

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) { setError('Please upload JPG, PNG, or WEBP.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('File must be under 10 MB.'); return }
    await runPipeline(file)
  }, [runPipeline])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }, [handleFile])

  const runGemini = async () => {
    if (!apiKey.trim()) { setError('Please enter your Gemini API key.'); return }
    setGeminiRun(true); setError(''); setStatus('Sending image to Gemini Flash…')
    try {
      const g = await extractMRZWithGemini(dataUrlToBase64(pendingUrl), apiKey.trim())
      if (!g.success) { setError(`Gemini: ${g.error}`); return }
      const parsed = parseMRZLines(g.lines[0], g.lines[1])
      if (!parsed.success) { setError('Gemini returned MRZ but parse failed. ' + (parsed.warnings[0] ?? '')); return }
      setResult(parsed); setShowGemini(false)
    } catch (e) { setError(`Gemini error: ${e instanceof Error ? e.message : String(e)}`) }
    finally { setGeminiRun(false); setScanning(false) }
  }

  const reset = () => {
    setResult(null); setPreview(''); setError(''); setProgress(0);
    setStatus(''); setShowGemini(false); setPendingUrl('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl">📄</div>
            <div>
              <h2 className="font-bold text-white text-lg">Passport MRZ Scanner</h2>
              <p className="text-teal-100 text-xs">ICAO 9303 · Check-digit validated · 100% private</p>
            </div>
          </div>
          <MRZTooltip />
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* Privacy notice */}
        <div className="flex items-start gap-2 rounded-xl border border-green-100 bg-green-50/60 px-3 py-2.5 text-xs text-green-700">
          <span className="mt-0.5 shrink-0">🔒</span>
          <span><strong>Your passport is processed entirely in your browser.</strong> We never upload it.</span>
        </div>

        {/* Drop Zone */}
        <div onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
            ${dragging ? 'border-teal-400 bg-teal-50' :
              preview   ? 'border-teal-300 bg-teal-50/30' :
                          'border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50/20'}`}>
          <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
          {preview ? (
            <div className="p-3 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Passport preview" className="mx-auto max-h-48 rounded-lg object-contain shadow-md" />
              {/* MRZ zone overlay */}
              <div className="absolute bottom-5 left-[8%] right-[8%] h-[20%] border-2 border-dashed border-teal-400 rounded bg-teal-400/10 pointer-events-none">
                <span className="absolute -top-5 left-0 text-[10px] font-semibold text-teal-600">MRZ zone ↓</span>
              </div>
              <p className="mt-2 text-center text-xs text-gray-400">Click to change image</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-100">
                <svg className="h-8 w-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Drop passport photo here</p>
                <p className="mt-1 text-xs text-gray-400">or click · JPG, PNG, WEBP · max 10MB</p>
                <p className="mt-1 text-xs text-teal-600 font-medium">Ensure both MRZ lines at the bottom are visible</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress */}
        {scanning && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-medium truncate max-w-[200px]">{status || 'Processing…'}</span>
              <span className="text-teal-600 font-bold ml-2 shrink-0">{progress}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">All processing runs in your browser — no data is sent anywhere</p>
          </div>
        )}

        {/* Error */}
        {error && !result && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-600 mb-1">⚠️ Could not read MRZ</p>
            <p className="text-xs text-red-500">{error}</p>
            <p className="text-xs text-gray-500 mt-2">Tips: flat surface · no glare · both MRZ lines fully visible</p>
          </div>
        )}

        {/* Gemini fallback */}
        {showGemini && !result && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-700 mb-2">☁️ Try cloud-assisted scan?</p>
            <p className="text-xs text-amber-600 mb-3">{GEMINI_CONSENT_PROMPT}</p>
            <input type="text" placeholder="Paste Google AI Studio API key"
              value={apiKey} onChange={e => setApiKey(e.target.value)}
              className="w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-amber-400" />
            <div className="flex gap-2">
              <button onClick={runGemini} disabled={geminiRun || !apiKey.trim()} type="button"
                className="flex-1 rounded-lg bg-amber-500 py-2 text-xs font-bold text-white transition hover:bg-amber-600 disabled:opacity-50">
                {geminiRun ? 'Scanning…' : 'Yes, scan with Gemini'}
              </button>
              <button onClick={() => setShowGemini(false)} type="button"
                className="flex-1 rounded-lg border border-amber-200 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                No thanks
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">aistudio.google.com</a>
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <>
            {/* Expiry banners */}
            {result.isExpired && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 flex gap-2">
                <span className="shrink-0">⛔</span>
                <div>
                  <p className="text-sm font-bold text-red-700">Passport Expired</p>
                  <p className="text-xs text-red-600">Expired on <strong>{result.fields.dateOfExpiry}</strong>. Cannot be used for international travel.</p>
                </div>
              </div>
            )}
            {!result.isExpired && result.expiresWithinSixMonths && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 flex gap-2">
                <span className="shrink-0">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-amber-700">Passport expires soon</p>
                  <p className="text-xs text-amber-600">
                    Expires <strong>{result.fields.dateOfExpiry}</strong>
                    {result.daysUntilExpiry !== null && ` (${result.daysUntilExpiry} days)`}.
                    Many destinations require ≥ 6 months validity.
                  </p>
                </div>
              </div>
            )}

            {/* Confidence warning */}
            {result.confidence !== 'high' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 flex gap-2 items-start">
                <span className="shrink-0 text-amber-500">⚠️</span>
                <p className="text-xs text-amber-700">
                  <strong>Please verify manually</strong> — {result.warnings.join('; ')}
                </p>
              </div>
            )}

            {/* Fields card */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/60 overflow-hidden">
              <div className="flex items-center justify-between bg-teal-500 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-sm font-bold text-white">Passport Scanned</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  result.confidence === 'high'   ? 'bg-white/30 text-white' :
                  result.confidence === 'medium' ? 'bg-amber-200 text-amber-800' :
                                                    'bg-red-200 text-red-800'
                }`}>
                  {result.confidence === 'high' ? '✓ High confidence' :
                   result.confidence === 'medium' ? '⚠ Medium — verify' : '⚠ Low — verify all'}
                </span>
              </div>

              <div className="divide-y divide-teal-100 px-1">
                {[
                  { label:'Full Name',     value: result.fields.fullName,     check: undefined },
                  { label:'Surname',       value: result.fields.surname,      check: undefined },
                  { label:'Given Names',   value: result.fields.givenNames,   check: undefined },
                  { label:'Passport No',   value: result.fields.passportNumber, check: result.validation.passportNumberValid },
                  { label:'Nationality',   value: `${result.fields.nationalityName} (${result.fields.nationality})`, check: undefined },
                  { label:'Issuing State', value: `${result.fields.issuingCountryName} (${result.fields.issuingCountry})`, check: undefined },
                  { label:'Date of Birth', value: result.fields.dateOfBirth,  check: result.validation.dateOfBirthValid },
                  { label:'Sex',           value: result.fields.sex,          check: undefined },
                  { label:'Expiry Date',   value: result.fields.dateOfExpiry, check: result.validation.dateOfExpiryValid },
                ].map(({ label, value, check }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2.5">
                    <span className="text-xs font-medium text-teal-700 w-24 shrink-0">{label}</span>
                    <span className="text-xs font-bold text-gray-800 flex-1 mr-1 text-right break-all">{value || '—'}</span>
                    {check !== undefined && <CheckBadge valid={check} label={label} />}
                    <button onClick={() => copyField(value || '', label)} type="button"
                      className="ml-1 w-5 shrink-0 text-center text-gray-400 hover:text-teal-500 transition-colors" title={`Copy ${label}`}>
                      {copiedField === label ? <span className="text-green-500 text-xs">✓</span> : <span className="text-xs">📋</span>}
                    </button>
                  </div>
                ))}
              </div>

              <div className="px-4 pb-2 flex gap-3 text-[10px] text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-100 text-green-700 text-[9px] font-bold">✓</span>
                  Check digit passed
                </span>
                <span className="flex items-center gap-1">
                  <span className="inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-100 text-red-600 text-[9px] font-bold">!</span>
                  Check digit failed — verify
                </span>
              </div>

              <div className="flex gap-2 p-3">
                <button onClick={copyAll} type="button"
                  className="flex-1 rounded-lg bg-white border border-teal-200 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 transition">
                  {copiedAll ? '✅ Copied!' : '📋 Copy All'}
                </button>
                <Link href="/visa-vault"
                  className="flex-1 rounded-lg bg-teal-500 py-2 text-center text-xs font-semibold text-white hover:bg-teal-600 transition">
                  Save to Visa Vault →
                </Link>
              </div>
            </div>

            <button onClick={reset} type="button"
              className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-500 hover:border-gray-300 hover:text-gray-700 transition">
              Scan Another Passport
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ── Visa Photo Generator (unchanged from original) ────────────────────────────
interface PhotoResult { imageBase64:string; spec:string; sizeKB:number; dpi:number; width:number; height:number; withinLimit:boolean; maxKB:number }

function VisaPhotoGenerator() {
  const [selfiePreview,   setSelfiePreview]   = useState<string>('')
  const [selectedCountry, setSelectedCountry] = useState('usa')
  const [processing,      setProcessing]      = useState(false)
  const [photoResult,     setPhotoResult]     = useState<PhotoResult | null>(null)
  const [photoError,      setPhotoError]      = useState('')
  const [dragging,        setDragging]        = useState(false)
  const selfieRef = useRef<HTMLInputElement>(null)

  const handleSelfieFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) { setPhotoError('Please upload JPG, PNG, or WEBP.'); return }
    if (file.size > 10*1024*1024) { setPhotoError('File must be under 10MB.'); return }
    setPhotoError(''); setPhotoResult(null)
    const r = new FileReader()
    r.onload = (e) => setSelfiePreview(e.target?.result as string)
    r.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleSelfieFile(f)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const processPhoto = async () => {
    if (!selfiePreview) return
    setProcessing(true); setPhotoError(''); setPhotoResult(null)
    try {
      const spec = COUNTRIES.find(c => c.value === selectedCountry)!
      const canvas = document.createElement('canvas')
      canvas.width = spec.w; canvas.height = spec.h
      const ctx = canvas.getContext('2d')!
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, spec.w, spec.h)
      await new Promise<void>((res, rej) => {
        const img = new Image()
        img.onload = () => {
          const r = spec.w / spec.h
          let sw = img.width, sh = img.width / r
          if (sh > img.height) { sh = img.height; sw = img.height * r }
          ctx.drawImage(img, (img.width-sw)/2, (img.height-sh)/2, sw, sh, 0, 0, spec.w, spec.h)
          res()
        }
        img.onerror = rej; img.src = selfiePreview
      })
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.92)
      const sizeKB = Math.round((imageBase64.length * 3) / 4 / 1024)
      setPhotoResult({ imageBase64, spec: spec.spec, sizeKB, dpi: 300, width: spec.w, height: spec.h, withinLimit: sizeKB <= spec.maxKB, maxKB: spec.maxKB })
    } catch { setPhotoError('Photo processing failed. Please try again.') }
    finally { setProcessing(false) }
  }

  const downloadPhoto = () => {
    if (!photoResult) return
    const a = document.createElement('a'); a.href = photoResult.imageBase64; a.download = `visa-photo-${selectedCountry}.jpg`; a.click()
  }

  const downloadPrintSheet = () => {
    if (!photoResult) return
    const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = 1800
    const ctx = canvas.getContext('2d'); if (!ctx) return
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 1200, 1800)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(540 / photoResult.width, 810 / photoResult.height)
      const w = Math.round(photoResult.width * scale), h = Math.round(photoResult.height * scale)
      const pos = [{x:60,y:60},{x:640,y:60},{x:60,y:900},{x:640,y:900}]
      pos.forEach(({x,y}) => ctx.drawImage(img, x, y, w, h))
      ctx.strokeStyle = '#ccc'; ctx.setLineDash([5,5]); ctx.lineWidth = 1
      pos.forEach(({x,y}) => ctx.strokeRect(x, y, w, h))
      const a = document.createElement('a'); a.href = canvas.toDataURL('image/jpeg', 0.95)
      a.download = `visa-photo-print-${selectedCountry}.jpg`; a.click()
    }
    img.src = photoResult.imageBase64
  }

  const selectedSpec = COUNTRIES.find(c => c.value === selectedCountry)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden flex flex-col h-full">
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl">🤳</div>
          <div><h2 className="font-bold text-white text-lg">Visa Photo Generator</h2>
          <p className="text-purple-100 text-xs">Upload selfie → Get perfect visa photo</p></div>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-5 flex-1">
        <div onClick={() => selfieRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)} onDrop={handleDrop}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200
            ${dragging ? 'border-purple-400 bg-purple-50' : selfiePreview ? 'border-purple-300 bg-purple-50/30' :
              'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/20'}`}>
          <input ref={selfieRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSelfieFile(f) }} />
          {selfiePreview ? (
            <div className="p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selfiePreview} alt="Selfie preview" className="mx-auto max-h-40 rounded-lg object-contain shadow-md" />
              <p className="mt-2 text-center text-xs text-gray-400">Click to change</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
                <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <div><p className="text-sm font-semibold text-gray-700">Upload your selfie</p>
              <p className="mt-1 text-xs text-gray-400">JPG or PNG · max 10MB</p></div>
            </div>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Visa photo specification</p>
          <div className="grid grid-cols-2 gap-2">
            {COUNTRIES.map((c) => (
              <button key={c.value} type="button" onClick={() => { setSelectedCountry(c.value); setPhotoResult(null) }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all
                  ${selectedCountry === c.value ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-300' :
                    'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'}`}>
                <span className="text-lg">{c.flag}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{c.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{c.spec}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {photoError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">⚠️ {photoError}</div>}

        {selfiePreview && !photoResult && (
          <button onClick={processPhoto} disabled={processing} type="button"
            className="w-full rounded-xl bg-purple-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-600 disabled:opacity-60">
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generating…
              </span>
            ) : `Generate ${selectedSpec?.flag} ${selectedSpec?.label} Visa Photo →`}
          </button>
        )}

        {photoResult && (
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 overflow-hidden">
            <div className="flex items-center gap-2 bg-purple-500 px-4 py-2.5">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-sm font-bold text-white">Photo Ready!</span>
            </div>
            <div className="p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoResult.imageBase64} alt="Processed visa photo"
                className="mx-auto max-h-52 rounded-lg border border-purple-200 object-contain shadow-md" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  {label:'Spec',       value: photoResult.spec},
                  {label:'Size',       value: `${photoResult.sizeKB}KB`},
                  {label:'DPI',        value: `${photoResult.dpi} DPI`},
                  {label:'Background', value: 'White ✓'},
                  {label:'File Size',  value: photoResult.withinLimit ? 'Within limit ✓' : '⚠️ Over limit'},
                  {label:'Resolution', value: `${photoResult.width}×${photoResult.height}px`},
                ].map(({label, value}) => (
                  <div key={label} className="rounded-lg bg-white/80 px-3 py-2">
                    <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-widest">{label}</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={downloadPhoto} type="button"
                  className="flex-1 rounded-lg bg-purple-500 py-2.5 text-xs font-bold text-white hover:bg-purple-600 transition">
                  ⬇️ Download Photo
                </button>
                <button onClick={downloadPrintSheet} type="button"
                  className="flex-1 rounded-lg border border-purple-200 bg-white py-2.5 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition">
                  🖨️ Print Sheet 4×6
                </button>
              </div>
            </div>
          </div>
        )}

        {photoResult && (
          <button onClick={() => { setPhotoResult(null); setSelfiePreview('') }} type="button"
            className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-500 hover:border-gray-300 hover:text-gray-700 transition">
            Generate Another Photo
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function PassportScannerPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">

      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#FAFAFA] pt-16 pb-12 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.12),transparent_60%)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600 backdrop-blur-sm">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
            📷 ICAO 9303 Passport Scanner · Check-Digit Validated
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
            <span className="text-[#0f0c29]">Scan Your Passport</span><br />
            <span className="bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">in Seconds</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-gray-500 sm:text-lg leading-relaxed">
            Upload your passport photo — the MRZ lines at the bottom are read using ICAO 9303-compliant parsing with check-digit validation. No data ever leaves your device.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {[
              {border:'border-green-200', bg:'bg-green-50', text:'text-green-700', label:'🔒 100% Private — Runs in Browser'},
              {border:'border-teal-200',  bg:'bg-teal-50',  text:'text-teal-700',  label:'✓ ICAO 9303 Check Digits'},
              {border:'border-purple-200',bg:'bg-purple-50',text:'text-purple-700',label:'🌍 8 Countries Visa Photos'},
            ].map(({border, bg, text, label}) => (
              <div key={label} className={`flex items-center gap-2 rounded-full border ${border} ${bg} px-4 py-2 text-xs font-semibold ${text}`}>{label}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
          <PassportScanner />
          <VisaPhotoGenerator />
        </div>
      </section>

      <section className="bg-white py-16 border-y border-gray-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#0f0c29]">How It Works</h2>
            <p className="mt-2 text-gray-500 text-sm">ICAO 9303-compliant MRZ extraction in four steps</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
            {[
              {step:'01', emoji:'📤', color:'teal',   title:'Upload Passport',  desc:'Data page photo. EXIF rotation corrected automatically.'},
              {step:'02', emoji:'✂️', color:'cyan',   title:'MRZ Region Crop',  desc:'Bottom 35% isolated, grayscale + adaptive threshold applied.'},
              {step:'03', emoji:'🔍', color:'indigo', title:'OCR the MRZ',      desc:'Tesseract reads two 44-char lines using MRZ-only character whitelist.'},
              {step:'04', emoji:'✅', color:'purple', title:'Validate & Parse',  desc:'`mrz` library validates all ICAO check digits. Failed checks surface as warnings.'},
            ].map(({step, emoji, title, desc, color}) => (
              <div key={step} className={`relative rounded-2xl border p-5 ${
                color==='teal' ? 'border-teal-100 bg-teal-50/50' : color==='cyan' ? 'border-cyan-100 bg-cyan-50/50' :
                color==='indigo' ? 'border-indigo-100 bg-indigo-50/50' : 'border-purple-100 bg-purple-50/50'}`}>
                <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl text-xl ${
                  color==='teal' ? 'bg-teal-100' : color==='cyan' ? 'bg-cyan-100' : color==='indigo' ? 'bg-indigo-100' : 'bg-purple-100'}`}>{emoji}</div>
                <div className={`absolute top-4 right-4 text-4xl font-black opacity-10 ${
                  color==='teal' ? 'text-teal-500' : color==='cyan' ? 'text-cyan-500' : color==='indigo' ? 'text-indigo-500' : 'text-purple-500'}`}>{step}</div>
                <h3 className="text-sm font-bold text-[#0f0c29] mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#0f0c29]">Photo Specifications by Country</h2>
            <p className="mt-2 text-gray-500 text-sm">Automatically applied when you generate your visa photo</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#0f0c29]">
                  {['Country','Size','Background','Max Size','DPI'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-white/70">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {SPECS_TABLE.map((row, i) => (
                    <tr key={row.country} className={`transition hover:bg-teal-50/30 ${i%2===0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-5 py-3.5 font-semibold text-[#0f0c29]">{row.country}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{row.size}</td>
                      <td className="px-5 py-3.5 text-gray-600">{row.bg}</td>
                      <td className="px-5 py-3.5"><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">{row.maxKB}</span></td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{row.dpi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-14 border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0f0c29] mb-3">🔒 Your Privacy is Our Priority</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">Your passport contains sensitive identity data. All processing happens locally in your browser.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {icon:'🖥️', text:'OCR runs entirely in your browser (Tesseract WASM)'},
              {icon:'🚫', text:'No passport image or data is sent to any server'},
              {icon:'🗑️', text:'Images cleared when you leave or reset the scanner'},
              {icon:'🔐', text:'Gemini fallback only with your explicit consent'},
            ].map(({icon, text}) => (
              <div key={text} className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/50 px-4 py-3.5 text-left">
                <span className="text-xl shrink-0">{icon}</span>
                <p className="text-sm font-medium text-gray-700">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
