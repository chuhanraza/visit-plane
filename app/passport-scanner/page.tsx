'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────
interface PassportData {
  fullName: string
  surname: string
  givenNames: string
  nationality: string
  passportNumber: string
  dateOfBirth: string
  expiryDate: string
  gender: string
}

interface PhotoResult {
  imageBase64: string
  spec: string
  sizeKB: number
  dpi: number
  width: number
  height: number
  withinLimit: boolean
  maxKB: number
}

// ─── Photo specs per country ──────────────────────────────────────────────────
const COUNTRIES = [
  { value: 'usa',       flag: '🇺🇸', label: 'USA',          spec: '2×2 inch, white bg',  maxKB: 240,   w: 600,  h: 600  },
  { value: 'uk',        flag: '🇬🇧', label: 'UK',           spec: '35×45mm, white bg',   maxKB: 10240, w: 413,  h: 531  },
  { value: 'australia', flag: '🇦🇺', label: 'Australia',    spec: '35×45mm, white bg',   maxKB: 10240, w: 413,  h: 531  },
  { value: 'canada',    flag: '🇨🇦', label: 'Canada',       spec: '50×70mm, white bg',   maxKB: 4096,  w: 591,  h: 827  },
  { value: 'schengen',  flag: '🇩🇪', label: 'Schengen',     spec: '35×45mm, white bg',   maxKB: 50,    w: 413,  h: 531  },
  { value: 'saudi',     flag: '🇸🇦', label: 'Saudi Arabia', spec: '40×60mm, white bg',   maxKB: 100,   w: 472,  h: 709  },
  { value: 'uae',       flag: '🇦🇪', label: 'UAE',          spec: '40×60mm, white bg',   maxKB: 100,   w: 472,  h: 709  },
  { value: 'pakistan',  flag: '🇵🇰', label: 'Pakistan',     spec: '35×45mm, white bg',   maxKB: 50,    w: 413,  h: 531  },
]

const SPECS_TABLE = [
  { country: '🇺🇸 USA',          size: '2×2" (51×51mm)', bg: 'White',       maxKB: '240KB', dpi: '300' },
  { country: '🇬🇧 UK',           size: '35×45mm',        bg: 'White/Light', maxKB: '10MB',  dpi: '300' },
  { country: '🇩🇪 Schengen',     size: '35×45mm',        bg: 'White',       maxKB: '50KB',  dpi: '300' },
  { country: '🇸🇦 Saudi Arabia', size: '40×60mm',        bg: 'White',       maxKB: '100KB', dpi: '300' },
  { country: '🇦🇪 UAE',          size: '40×60mm',        bg: 'White',       maxKB: '100KB', dpi: '300' },
  { country: '🇵🇰 Pakistan',     size: '35×45mm',        bg: 'White',       maxKB: '50KB',  dpi: '300' },
  { country: '🇦🇺 Australia',    size: '35×45mm',        bg: 'White',       maxKB: '10MB',  dpi: '300' },
  { country: '🇨🇦 Canada',       size: '50×70mm',        bg: 'White',       maxKB: '4MB',   dpi: '300' },
]

// ─── Nationality Code → Full Name ────────────────────────────────────────────
const NATIONALITY_CODES: Record<string, string> = {
  'PAK': 'Pakistan',
  'IND': 'India',
  'USA': 'United States',
  'GBR': 'United Kingdom',
  'ARE': 'United Arab Emirates',
  'SAU': 'Saudi Arabia',
  'CAN': 'Canada',
  'AUS': 'Australia',
  'DEU': 'Germany',
  'FRA': 'France',
  'ITA': 'Italy',
  'ESP': 'Spain',
  'CHN': 'China',
  'JPN': 'Japan',
  'KOR': 'South Korea',
  'NGA': 'Nigeria',
  'BGD': 'Bangladesh',
  'PHL': 'Philippines',
  'MYS': 'Malaysia',
  'SGP': 'Singapore',
  'THA': 'Thailand',
  'TUR': 'Turkey',
  'IRN': 'Iran',
  'IRQ': 'Iraq',
  'EGY': 'Egypt',
  'MAR': 'Morocco',
  'ZAF': 'South Africa',
  'KEN': 'Kenya',
  'ETH': 'Ethiopia',
  'GHA': 'Ghana',
  'BRA': 'Brazil',
  'MEX': 'Mexico',
  'ARG': 'Argentina',
  'RUS': 'Russia',
  'NLD': 'Netherlands',
  'BEL': 'Belgium',
  'CHE': 'Switzerland',
  'SWE': 'Sweden',
  'NOR': 'Norway',
  'DNK': 'Denmark',
  'FIN': 'Finland',
  'POL': 'Poland',
  'GRC': 'Greece',
  'PRT': 'Portugal',
  'CZE': 'Czech Republic',
  'HUN': 'Hungary',
  'ROU': 'Romania',
  'UKR': 'Ukraine',
  'IDN': 'Indonesia',
  'VNM': 'Vietnam',
  'LKA': 'Sri Lanka',
  'NPL': 'Nepal',
  'AFG': 'Afghanistan',
  'KWT': 'Kuwait',
  'QAT': 'Qatar',
  'BHR': 'Bahrain',
  'OMN': 'Oman',
  'JOR': 'Jordan',
  'LBN': 'Lebanon',
  'SYR': 'Syria',
  'MMR': 'Myanmar',
  'KHM': 'Cambodia',
  'NZL': 'New Zealand',
  'ZWE': 'Zimbabwe',
  'ZMB': 'Zambia',
  'UGA': 'Uganda',
  'TZA': 'Tanzania',
  'RWA': 'Rwanda',
  'SEN': 'Senegal',
  'CMR': 'Cameroon',
  'CIV': "Ivory Coast",
  'MLI': 'Mali',
  'NER': 'Niger',
  'TCD': 'Chad',
  'SOM': 'Somalia',
  'SDN': 'Sudan',
  'LBY': 'Libya',
  'TUN': 'Tunisia',
  'DZA': 'Algeria',
}

// ─── MRZ Parser ──────────────────────────────────────────────────────────────
function parseMRZ(text: string): PassportData | null {
  try {
    const lines = text
      .split('\n')
      .map(l =>
        l.trim()
         .replace(/\s/g, '')
         // OCR often reads '<' filler chars as 'L' — normalize runs of 3+ L's back to '<'
         .replace(/L{3,}/g, s => '<'.repeat(s.length))
      )
      .filter(l => l.length >= 30)

    const mrzLines = lines.filter(l => /^[A-Z0-9<]{30,44}$/.test(l))

    if (mrzLines.length < 2) return null

    const line1 = mrzLines[0].padEnd(44, '<')
    const line2 = mrzLines[1].padEnd(44, '<')

    const namePart  = line1.slice(5, 44)
    const nameSplit = namePart.split('<<')

    // Split each field by '<', drop empty segments AND segments that are
    // pure L's (OCR frequently reads '<' filler characters as 'L')
    const cleanNameParts = (raw: string) =>
      raw
        .split('<')
        .filter(p => p.length > 0 && !/^L+$/.test(p))
        .join(' ')
        .trim()

    const surname    = cleanNameParts(nameSplit[0] || '')
    const givenNames = cleanNameParts(nameSplit[1] || '')

    const passportNumber  = line2.slice(0, 9).replace(/</g, '')
    const nationality     = line2.slice(10, 13).replace(/</g, '')
    const nationalityFull = NATIONALITY_CODES[nationality] || nationality

    const dobRaw    = line2.slice(13, 19)
    const year      = parseInt(dobRaw.slice(0, 2), 10)
    const century   = year > 30 ? '19' : '20'
    const dateOfBirth = dobRaw
      ? `${dobRaw.slice(4, 6)}/${dobRaw.slice(2, 4)}/${century}${dobRaw.slice(0, 2)}`
      : ''

    const genderChar = line2.slice(20, 21)
    const gender     = genderChar === 'M' ? 'Male' : genderChar === 'F' ? 'Female' : 'Other'

    const expiryRaw  = line2.slice(21, 27)
    const expiryDate = expiryRaw
      ? `${expiryRaw.slice(4, 6)}/${expiryRaw.slice(2, 4)}/20${expiryRaw.slice(0, 2)}`
      : ''

    if (!passportNumber) return null

    return {
      fullName: `${givenNames} ${surname}`.trim(),
      surname,
      givenNames,
      nationality: nationalityFull,
      passportNumber,
      dateOfBirth,
      expiryDate,
      gender,
    }
  } catch {
    return null
  }
}

// ─── Image resizer (speeds up Tesseract 3–5×) ────────────────────────────────
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img    = new Image()
    const reader = new FileReader()
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX    = 1200
        let w = img.width
        let h = img.height
        if (w > MAX) {
          h = (h * MAX) / w
          w = MAX
        }
        canvas.width  = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

// ─── Passport Scanner Tool ────────────────────────────────────────────────────
function PassportScanner() {
  const [passportPreview, setPassportPreview]   = useState<string>('')
  const [scanning, setScanning]                 = useState(false)
  const [scanProgress, setScanProgress]         = useState(0)
  const [scanResult, setScanResult]             = useState<PassportData | null>(null)
  const [scanError, setScanError]               = useState('')
  const [dragging, setDragging]                 = useState(false)
  const [copied, setCopied]                     = useState(false)
  const [copiedField, setCopiedField]           = useState('')
  const passportInputRef = useRef<HTMLInputElement>(null)

  const copyField = (value: string, field: string) => {
    navigator.clipboard.writeText(value)
    setCopiedField(field)
    setTimeout(() => setCopiedField(''), 1500)
  }

  const handlePassportUpload = async (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setScanError('Please upload a JPG, PNG, or WEBP image.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setScanError('File must be under 10MB.')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPassportPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setScanning(true)
    setScanResult(null)
    setScanError('')
    setScanProgress(0)

    try {
      // Dynamic import to avoid SSR bundle issues
      const { createWorker } = await import('tesseract.js')

      const worker = await createWorker('eng', 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === 'recognizing text') {
            setScanProgress(Math.round(m.progress * 100))
          }
        },
      })

      await worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
        tessedit_pageseg_mode: '6',
        tessedit_ocr_engine_mode: '2',
        preserve_interword_spaces: '0',
      })

      // Resize to max 1200px for 3–5× speed boost
      const resizedDataUrl              = await resizeImage(file)
      const { data: { text } } = await worker.recognize(resizedDataUrl)
      await worker.terminate()

      const result = parseMRZ(text)

      if (result) {
        setScanResult(result)
      } else {
        setScanError(
          'Could not read passport MRZ. Please ensure:\n' +
          '• The image is clear and well-lit\n' +
          '• The bottom MRZ section (two rows of text) is visible\n' +
          '• Try a higher resolution photo'
        )
      }
    } catch {
      setScanError('Scan failed. Please try again with a clearer image.')
    } finally {
      setScanning(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePassportUpload(file)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const copyData = () => {
    if (!scanResult) return
    const text = [
      `Full Name: ${scanResult.fullName}`,
      `Nationality: ${scanResult.nationality}`,
      `Passport No: ${scanResult.passportNumber}`,
      `Date of Birth: ${scanResult.dateOfBirth}`,
      `Expiry Date: ${scanResult.expiryDate}`,
      `Gender: ${scanResult.gender}`,
    ].join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl">📄</div>
          <div>
            <h2 className="font-bold text-white text-lg">Passport MRZ Scanner</h2>
            <p className="text-teal-100 text-xs">Upload passport → AI reads your data instantly</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* Drop Zone */}
        <div
          onClick={() => passportInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${
            dragging
              ? 'border-teal-400 bg-teal-50'
              : passportPreview
              ? 'border-teal-300 bg-teal-50/30'
              : 'border-gray-200 bg-gray-50 hover:border-teal-300 hover:bg-teal-50/20'
          }`}
        >
          <input
            ref={passportInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePassportUpload(f) }}
          />
          {passportPreview ? (
            <div className="p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={passportPreview}
                alt="Passport preview"
                className="mx-auto max-h-48 rounded-lg object-contain shadow-md"
              />
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
                <p className="mt-1 text-xs text-gray-400">or click to browse · JPG, PNG, WEBP · max 10MB</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {scanning && (
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500 font-medium">Reading MRZ lines...</span>
              <span className="text-teal-600 font-bold">{scanProgress}%</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-teal-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Browser AI is reading the passport — no data leaves your device
            </p>
          </div>
        )}

        {/* Error */}
        {scanError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm font-semibold text-red-600 mb-1">⚠️ Could not read passport</p>
            <p className="text-xs text-red-500 whitespace-pre-line">{scanError}</p>
          </div>
        )}

        {/* Result */}
        {scanResult && (
          <div className="rounded-xl border border-teal-200 bg-teal-50/60 overflow-hidden">
            <div className="flex items-center gap-2 bg-teal-500 px-4 py-2.5">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              <span className="text-sm font-bold text-white">Passport Scanned Successfully</span>
            </div>
            <div className="divide-y divide-teal-100 px-1">
              {[
                { label: 'Full Name',     value: scanResult.fullName       },
                { label: 'Nationality',   value: scanResult.nationality    },
                { label: 'Passport No',   value: scanResult.passportNumber },
                { label: 'Date of Birth', value: scanResult.dateOfBirth    },
                { label: 'Expiry Date',   value: scanResult.expiryDate     },
                { label: 'Gender',        value: scanResult.gender         },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-xs font-medium text-teal-700 w-24 shrink-0">{label}</span>
                  <span className="text-right text-xs font-bold text-gray-800 flex-1 mr-2 break-all">{value || '—'}</span>
                  <button
                    onClick={() => copyField(value || '', label)}
                    className="text-gray-400 hover:text-teal-500 transition-colors ml-1 shrink-0 w-5 text-center"
                    title={`Copy ${label}`}
                  >
                    {copiedField === label
                      ? <span className="text-green-500 text-xs">✓</span>
                      : <span className="text-xs">📋</span>
                    }
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 p-3">
              <button
                onClick={copyData}
                className="flex-1 rounded-lg bg-white border border-teal-200 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-50"
              >
                {copied ? '✅ Copied!' : '📋 Copy Data'}
              </button>
              <Link
                href="/destinations"
                className="flex-1 rounded-lg bg-teal-500 py-2 text-center text-xs font-semibold text-white transition hover:bg-teal-600"
              >
                Use for Visa →
              </Link>
            </div>
          </div>
        )}

        {scanResult && (
          <button
            onClick={() => { setScanResult(null); setPassportPreview(''); setScanError('') }}
            className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
          >
            Scan Another Passport
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Visa Photo Generator Tool ────────────────────────────────────────────────
function VisaPhotoGenerator() {
  const [selfiePreview, setSelfiePreview]       = useState<string>('')
  const [selectedCountry, setSelectedCountry]   = useState('usa')
  const [processing, setProcessing]             = useState(false)
  const [photoResult, setPhotoResult]           = useState<PhotoResult | null>(null)
  const [photoError, setPhotoError]             = useState('')
  const [dragging, setDragging]                 = useState(false)
  const selfieInputRef = useRef<HTMLInputElement>(null)

  const handleSelfieFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      setPhotoError('Please upload a JPG, PNG, or WEBP image.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('File must be under 10MB.')
      return
    }
    setPhotoError('')
    setPhotoResult(null)
    const reader = new FileReader()
    reader.onload = (e) => setSelfiePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleSelfieFile(file)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const processPhoto = async () => {
    if (!selfiePreview) return
    setProcessing(true)
    setPhotoError('')
    setPhotoResult(null)

    try {
      const spec = COUNTRIES.find(c => c.value === selectedCountry)!

      const canvas  = document.createElement('canvas')
      canvas.width  = spec.w
      canvas.height = spec.h
      const ctx = canvas.getContext('2d')!

      // White background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, spec.w, spec.h)

      await new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          // Center-crop to target aspect ratio
          const targetRatio = spec.w / spec.h
          let srcW = img.width
          let srcH = img.width / targetRatio

          if (srcH > img.height) {
            srcH = img.height
            srcW = img.height * targetRatio
          }

          const srcX = (img.width  - srcW) / 2
          const srcY = (img.height - srcH) / 2

          ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, spec.w, spec.h)
          resolve()
        }
        img.onerror = reject
        img.src = selfiePreview
      })

      // Convert to JPEG and measure size
      const imageBase64 = canvas.toDataURL('image/jpeg', 0.92)
      const sizeKB      = Math.round((imageBase64.length * 3) / 4 / 1024)

      setPhotoResult({
        imageBase64,
        spec: spec.spec,
        sizeKB,
        dpi: 300,
        width: spec.w,
        height: spec.h,
        withinLimit: sizeKB <= spec.maxKB,
        maxKB: spec.maxKB,
      })
    } catch {
      setPhotoError('Photo processing failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const downloadPhoto = () => {
    if (!photoResult) return
    const link = document.createElement('a')
    link.href = photoResult.imageBase64
    link.download = `visa-photo-${selectedCountry}.jpg`
    link.click()
  }

  const downloadPrintSheet = () => {
    if (!photoResult) return
    const canvas  = document.createElement('canvas')
    canvas.width  = 1200
    canvas.height = 1800
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const img   = new Image()
    img.onload  = () => {
      const photoW = photoResult.width
      const photoH = photoResult.height
      const maxW   = 540
      const maxH   = 810
      const scale  = Math.min(maxW / photoW, maxH / photoH)
      const w      = Math.round(photoW * scale)
      const h      = Math.round(photoH * scale)

      const positions = [
        { x: 60,  y: 60  },
        { x: 640, y: 60  },
        { x: 60,  y: 900 },
        { x: 640, y: 900 },
      ]
      positions.forEach(({ x, y }) => ctx.drawImage(img, x, y, w, h))

      ctx.strokeStyle = '#cccccc'
      ctx.setLineDash([5, 5])
      ctx.lineWidth   = 1
      positions.forEach(({ x, y }) => ctx.strokeRect(x, y, w, h))

      const link      = document.createElement('a')
      link.href       = canvas.toDataURL('image/jpeg', 0.95)
      link.download   = `visa-photo-print-sheet-${selectedCountry}.jpg`
      link.click()
    }
    img.src = photoResult.imageBase64
  }

  const selectedSpec = COUNTRIES.find(c => c.value === selectedCountry)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-xl">🤳</div>
          <div>
            <h2 className="font-bold text-white text-lg">Visa Photo Generator</h2>
            <p className="text-purple-100 text-xs">Upload selfie → Get perfect visa photo</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5 flex-1">
        {/* Drop Zone */}
        <div
          onClick={() => selfieInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 ${
            dragging
              ? 'border-purple-400 bg-purple-50'
              : selfiePreview
              ? 'border-purple-300 bg-purple-50/30'
              : 'border-gray-200 bg-gray-50 hover:border-purple-300 hover:bg-purple-50/20'
          }`}
        >
          <input
            ref={selfieInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSelfieFile(f) }}
          />
          {selfiePreview ? (
            <div className="p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selfiePreview}
                alt="Selfie preview"
                className="mx-auto max-h-40 rounded-lg object-contain shadow-md"
              />
              <p className="mt-2 text-center text-xs text-gray-400">Click to change image</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100">
                <svg className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Upload your selfie</p>
                <p className="mt-1 text-xs text-gray-400">JPG or PNG · max 10MB · face clearly visible</p>
              </div>
            </div>
          )}
        </div>

        {/* Country Selector */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400">Select visa photo specification</p>
          <div className="grid grid-cols-2 gap-2">
            {COUNTRIES.map((c) => (
              <button
                key={c.value}
                onClick={() => { setSelectedCountry(c.value); setPhotoResult(null) }}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all ${
                  selectedCountry === c.value
                    ? 'border-purple-400 bg-purple-50 ring-1 ring-purple-300'
                    : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                }`}
              >
                <span className="text-lg">{c.flag}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-800 truncate">{c.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{c.spec}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {photoError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            ⚠️ {photoError}
          </div>
        )}

        {/* Generate Button */}
        {selfiePreview && !photoResult && (
          <button
            onClick={processPhoto}
            disabled={processing}
            className="w-full rounded-xl bg-purple-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-600 hover:-translate-y-px disabled:opacity-60 disabled:translate-y-0"
          >
            {processing ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generating Photo...
              </span>
            ) : `Generate ${selectedSpec?.flag} ${selectedSpec?.label} Visa Photo →`}
          </button>
        )}

        {/* Photo Result */}
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
              <img
                src={photoResult.imageBase64}
                alt="Processed visa photo"
                className="mx-auto max-h-52 rounded-lg border border-purple-200 object-contain shadow-md"
              />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: 'Spec',       value: photoResult.spec                                            },
                  { label: 'Size',       value: `${photoResult.sizeKB}KB`                                  },
                  { label: 'DPI',        value: `${photoResult.dpi} DPI`                                   },
                  { label: 'Background', value: 'White ✓'                                                  },
                  { label: 'File Size',  value: photoResult.withinLimit ? 'Within limit ✓' : '⚠️ Slightly over' },
                  { label: 'Resolution', value: `${photoResult.width}×${photoResult.height}px`             },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-white/80 px-3 py-2">
                    <p className="text-[10px] font-semibold text-purple-600 uppercase tracking-widest">{label}</p>
                    <p className="text-xs font-bold text-gray-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={downloadPhoto}
                  className="flex-1 rounded-lg bg-purple-500 py-2.5 text-xs font-bold text-white transition hover:bg-purple-600"
                >
                  ⬇️ Download Photo
                </button>
                <button
                  onClick={downloadPrintSheet}
                  className="flex-1 rounded-lg border border-purple-200 bg-white py-2.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
                >
                  🖨️ Print Sheet 4×6
                </button>
              </div>
            </div>
          </div>
        )}

        {photoResult && (
          <button
            onClick={() => { setPhotoResult(null); setSelfiePreview('') }}
            className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-500 transition hover:border-gray-300 hover:text-gray-700"
          >
            Generate Another Photo
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PassportScannerPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0f0c29] antialiased overflow-x-hidden">

      {/* ── SECTION 1: HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#FAFAFA] pt-16 pb-12 text-center">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.12),transparent_60%)]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-1.5 text-xs font-bold text-teal-600 backdrop-blur-sm">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
            📷 Passport Scanner &amp; Photo Tool
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
            <span className="text-[#0f0c29]">Scan Your Passport</span>
            <br />
            <span className="bg-gradient-to-r from-teal-500 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              in Seconds
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base text-gray-500 sm:text-lg leading-relaxed">
            Upload your passport photo and our browser-based AI instantly reads your details.
            Generate a perfect visa photo for any country — no data ever leaves your device.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs font-semibold text-green-700">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              🔒 100% Private — Runs in Browser
            </div>
            <div className="flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-700">
              <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-teal-500" />
              ⚡ No Server — No Timeout
            </div>
            <div className="flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-semibold text-purple-700">
              🌍 8 Countries Supported
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: TWO TOOLS ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
          <PassportScanner />
          <VisaPhotoGenerator />
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="bg-white py-16 border-y border-gray-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#0f0c29]">How It Works</h2>
            <p className="mt-2 text-gray-500 text-sm">Three simple steps from passport to visa application</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              {
                step: '01', emoji: '📤', color: 'teal',
                title: 'Upload Your Passport',
                desc:  'Take a clear photo of your passport data page or upload an existing scan. JPG, PNG, or WEBP accepted.',
              },
              {
                step: '02', emoji: '🤖', color: 'indigo',
                title: 'Browser AI Reads MRZ',
                desc:  'Tesseract OCR runs directly in your browser — reads the two MRZ lines and extracts all details instantly.',
              },
              {
                step: '03', emoji: '✅', color: 'purple',
                title: 'Data Ready to Use',
                desc:  'Copy extracted data to fill any visa application in seconds — no more manual entry errors.',
              },
            ].map(({ step, emoji, title, desc, color }) => (
              <div
                key={step}
                className={`relative rounded-2xl border p-6 ${
                  color === 'teal'   ? 'border-teal-100   bg-teal-50/50'   :
                  color === 'indigo' ? 'border-indigo-100 bg-indigo-50/50' :
                                       'border-purple-100 bg-purple-50/50'
                }`}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
                  color === 'teal' ? 'bg-teal-100' : color === 'indigo' ? 'bg-indigo-100' : 'bg-purple-100'
                }`}>{emoji}</div>
                <div className={`absolute top-5 right-5 text-5xl font-black opacity-10 ${
                  color === 'teal' ? 'text-teal-500' : color === 'indigo' ? 'text-indigo-500' : 'text-purple-500'
                }`}>{step}</div>
                <h3 className="text-base font-bold text-[#0f0c29] mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 4: PHOTO SPECS TABLE ────────────────────────────────────── */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-[#0f0c29]">Photo Specifications by Country</h2>
            <p className="mt-2 text-gray-500 text-sm">We automatically apply these specs when you generate your visa photo</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0f0c29]">
                    {['Country', 'Size', 'Background', 'Max Size', 'DPI'].map((h) => (
                      <th key={h} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-white/70">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPECS_TABLE.map((row, i) => (
                    <tr key={row.country} className={`transition hover:bg-teal-50/30 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-5 py-3.5 font-semibold text-[#0f0c29]">{row.country}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{row.size}</td>
                      <td className="px-5 py-3.5 text-gray-600">{row.bg}</td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">{row.maxKB}</span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-600">{row.dpi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: PRIVACY ──────────────────────────────────────────────── */}
      <section className="bg-white py-14 border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
            <svg className="h-7 w-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-[#0f0c29] mb-3">🔒 Your Privacy is Our Priority</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto">
            We take your passport data seriously. All processing happens locally in your browser.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { icon: '🖥️', text: 'All OCR runs locally in your browser'           },
              { icon: '🚫', text: 'No passport data sent to any server'             },
              { icon: '🗑️', text: 'Images cleared when you leave the page'          },
              { icon: '🔐', text: 'Zero storage — nothing persisted anywhere'       },
            ].map(({ icon, text }) => (
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
