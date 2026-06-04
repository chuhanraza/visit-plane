/**
 * /admin/seo/generate
 * ─────────────────────────────────────────────────────────────────────────────
 * Client-side UI for triggering single-route Gemini content generation.
 * Calls POST /api/seo/generate with the ADMIN_SECRET from session.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'

type Template = 'template1' | 'template2' | 'template3' | 'template4'

const TEMPLATES: { value: Template; label: string; needsDest: boolean }[] = [
  { value: 'template1', label: 'T1 · Visa Requirements (passport → destination)',  needsDest: true  },
  { value: 'template2', label: 'T2 · Visa-Free Countries (passport only)',          needsDest: false },
  { value: 'template3', label: 'T3 · Cheapest Visas (passport only)',               needsDest: false },
  { value: 'template4', label: 'T4 · Destination Guide (passport → destination)',   needsDest: true  },
]

const ISO3_OPTIONS = [
  'AFG','ALB','DZA','AGO','ARG','ARM','AUS','AUT','AZE','BGD','BLR','BEL',
  'BLZ','BEN','BTN','BOL','BIH','BWA','BRA','BRN','BGR','BFA','BDI','CPV',
  'KHM','CMR','CAN','CAF','TCD','CHL','CHN','COL','COM','COD','COG','CRI',
  'CIV','HRV','CUB','CYP','CZE','DNK','DJI','DOM','ECU','EGY','SLV','GNQ',
  'ERI','EST','SWZ','ETH','FJI','FIN','FRA','GAB','GMB','GEO','DEU','GHA',
  'GRC','GTM','GIN','GNB','GUY','HTI','HND','HUN','ISL','IND','IDN','IRN',
  'IRQ','IRL','ISR','ITA','JAM','JPN','JOR','KAZ','KEN','PRK','KOR','KWT',
  'KGZ','LAO','LVA','LBN','LSO','LBR','LBY','LTU','LUX','MDG','MWI','MYS',
  'MDV','MLI','MLT','MRT','MUS','MEX','MDA','MNG','MNE','MAR','MOZ','MMR',
  'NAM','NPL','NLD','NZL','NIC','NER','NGA','MKD','NOR','OMN','PAK','PAN',
  'PNG','PRY','PER','PHL','POL','PRT','QAT','ROU','RUS','RWA','SAU','SEN',
  'SRB','SLE','SGP','SVK','SVN','SOM','ZAF','SSD','ESP','LKA','SDN','SUR',
  'SWE','CHE','SYR','TWN','TJK','TZA','THA','TLS','TGO','TTO','TUN','TUR',
  'TKM','UGA','UKR','ARE','GBR','USA','URY','UZB','VEN','VNM','YEM','ZMB','ZWE',
].sort()

type Result = {
  success: boolean
  slug?: string
  passed?: boolean
  qualityResult?: Record<string, unknown>
  wordCount?: number
  error?: string
}

export default function GeneratePage() {
  const [template,      setTemplate]      = useState<Template>('template1')
  const [passportIso,   setPassportIso]   = useState('PAK')
  const [destinationIso, setDestinationIso] = useState('ARE')
  const [forceRegen,    setForceRegen]    = useState(false)
  const [adminSecret,   setAdminSecret]   = useState('')
  const [loading,       setLoading]       = useState(false)
  const [result,        setResult]        = useState<Result | null>(null)

  const needsDest = TEMPLATES.find(t => t.value === template)?.needsDest ?? false

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const body: Record<string, unknown> = {
        template,
        passportIso,
        forceRegenerate: forceRegen,
      }
      if (needsDest) body.destinationIso = destinationIso

      const res = await fetch('/api/seo/generate', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          Authorization:   `Bearer ${adminSecret}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setResult({ success: false, error: String(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-8 py-5">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 text-sm">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600">Admin</Link>
            <span className="text-gray-300">/</span>
            <Link href="/admin/seo" className="text-gray-400 hover:text-gray-600">SEO</Link>
            <span className="text-gray-300">/</span>
            <span className="font-semibold text-gray-800">Generate</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Generate SEO Content</h1>
          <p className="mt-1 text-sm text-gray-500">
            Triggers Gemini 1.5 Flash with search grounding to generate a unique page for one route.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border bg-white p-8">

          {/* Admin secret */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin Secret</label>
            <input
              type="password"
              value={adminSecret}
              onChange={e => setAdminSecret(e.target.value)}
              placeholder="ADMIN_SECRET env value"
              required
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Template</label>
            <select
              value={template}
              onChange={e => setTemplate(e.target.value as Template)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              {TEMPLATES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Passport ISO */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Passport (ISO3)</label>
            <select
              value={passportIso}
              onChange={e => setPassportIso(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              {ISO3_OPTIONS.map(iso => (
                <option key={iso} value={iso}>{iso}</option>
              ))}
            </select>
          </div>

          {/* Destination ISO (conditional) */}
          {needsDest && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Destination (ISO3)</label>
              <select
                value={destinationIso}
                onChange={e => setDestinationIso(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                {ISO3_OPTIONS.map(iso => (
                  <option key={iso} value={iso}>{iso}</option>
                ))}
              </select>
            </div>
          )}

          {/* Force regenerate */}
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={forceRegen}
              onChange={e => setForceRegen(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-emerald-600"
            />
            <span className="text-sm text-gray-700">Force regenerate (overwrite existing content)</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? '⏳ Generating…' : '⚡ Generate Content'}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className={`mt-6 rounded-xl border p-6 ${result.success ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{result.success ? '✅' : '❌'}</span>
              <div>
                <div className="font-semibold text-gray-800">
                  {result.success ? 'Generation complete' : 'Generation failed'}
                </div>
                {result.slug && (
                  <a
                    href={`https://www.visitplane.com/${result.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-0.5 block text-sm text-blue-600 hover:underline"
                  >
                    /{result.slug}
                  </a>
                )}
              </div>
              {result.success && (
                <div className="ml-auto text-right">
                  <div className={`text-sm font-semibold ${result.passed ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {result.passed ? '✓ QA Passed' : '⚠ QA Failed'}
                  </div>
                  <div className="text-xs text-gray-500">{result.wordCount?.toLocaleString()} words</div>
                </div>
              )}
            </div>

            {result.error && (
              <div className="mt-3 rounded-lg bg-red-100 p-3 text-sm text-red-700 font-mono">
                {result.error}
              </div>
            )}

            {result.qualityResult && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">Quality gate details</summary>
                <pre className="mt-2 overflow-auto rounded-lg bg-white p-4 text-xs text-gray-600">
                  {JSON.stringify(result.qualityResult, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
