'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  LETTERS,
  buildLetter,
  findRedFlags,
  getFields,
  getNotices,
  isVisible,
  blocksToText,
  countPlaceholders,
  type Block,
  type Data,
  type Field,
  type LetterType,
  type Seg,
} from '@/lib/letters/templates'
import { findDestinationByName, toolDestinationName } from '@/lib/letters/destinations'
import { downloadLetterPdf } from '@/lib/letters/pdf'
import { downloadLetterDocx } from '@/lib/letters/docx'
import { ORIGINS, isOriginId, type OriginId } from '@/lib/letters/origins'
import BlogEmailCapture from '@/components/blog/BlogEmailCapture'

/** Presets that corridor pages link to: ?type=noc&variant=business-owner. */
const VARIANTS: Partial<Record<LetterType, Record<string, Data>>> = {
  noc: {
    employee: { issuer: 'Employer (HR or manager signs)' },
    'business-owner': { issuer: 'Business owner (self-issued, a partner or co-director signs)' },
    government: { issuer: 'Government department (an authorised officer signs)' },
  },
  cover: {
    employee: { employment: 'Employed' },
    'self-employed': { employment: 'Self-employed / freelancer' },
  },
}

const LETTER_MAGNET = {
  url: '/lead-magnets/ultimate-visa-application-checklist.pdf',
  id: 'ultimate-visa-application-checklist',
  downloadLabel: 'Download the checklist (PDF)',
}

const STORE_KEY = 'vp-letter-draft-v2'
// v2: the acknowledgement wording changed, so earlier ticks must not carry over.
const ACK_KEY = 'vp-letter-ack-v2'
const ORIGIN_KEY = 'vp-letter-origin-v1'
const CAPTURE_KEY = 'vp-letter-capture-v1'

const inputCls =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20'

function FieldInput({ f, value, onChange }: { f: Field; value: string; onChange: (v: string) => void }) {
  const id = `f-${f.id}`
  if (f.kind === 'checks') {
    const selected = value ? value.split('|') : []
    const toggle = (o: string) => {
      const next = selected.includes(o) ? selected.filter((x) => x !== o) : [...selected, o]
      onChange(next.join('|'))
    }
    return (
      <fieldset>
        <legend className="text-sm font-medium text-gray-800">{f.label}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {f.options!.map((o) => {
            const on = selected.includes(o)
            return (
              <label
                key={o}
                className={`inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm transition ${
                  on ? 'border-emerald-700 bg-emerald-50 font-semibold text-emerald-900' : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <input type="checkbox" className="sr-only" checked={on} onChange={() => toggle(o)} />
                <span aria-hidden="true">{on ? '✓' : '+'}</span>
                {o}
              </label>
            )
          })}
        </div>
      </fieldset>
    )
  }
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-gray-800">{f.label}</label>
      {f.hint && <p className="text-xs text-gray-500">{f.hint}</p>}
      {f.kind === 'textarea' ? (
        <textarea id={id} rows={3} className={inputCls} value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : f.kind === 'select' ? (
        <select id={id} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input id={id} type={f.kind === 'date' ? 'date' : 'text'} className={inputCls} value={value} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  )
}

function Segs({ segs }: { segs: Seg[] }) {
  return (
    <>
      {segs.map((s, i) =>
        s.filled ? (
          <span key={i} className="rounded-sm bg-emerald-100/70">{s.text}</span>
        ) : (
          <span key={i} className="rounded-sm bg-amber-100 italic text-amber-800">{s.text}</span>
        ),
      )}
    </>
  )
}

function Paper({ blocks }: { blocks: Block[] }) {
  return (
    <div
      className="mx-auto w-full max-w-[640px] rounded-sm bg-white px-8 py-10 text-[13px] leading-[1.65] text-gray-900 shadow-xl ring-1 ring-black/5 sm:px-12 sm:py-12"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      aria-label="Letter preview"
    >
      {blocks.map((b, i) => {
        if (b.kind === 'gap') return <div key={i} className="h-3" />
        if (b.kind === 'h') return <p key={i} className="font-bold">{b.text}</p>
        if (b.kind === 'p') return <p key={i}><Segs segs={b.segs} /></p>
        if (b.kind === 'lines')
          return (
            <div key={i}>
              {b.lines.map((l, j) => <div key={j}><Segs segs={l} /></div>)}
            </div>
          )
        return (
          <ul key={i} className="ml-5 list-disc">
            {b.items.map((it, j) => <li key={j}><Segs segs={it} /></li>)}
          </ul>
        )
      })}
    </div>
  )
}

export default function LetterBuilder() {
  const [type, setType] = useState<LetterType>('cover')
  const [data, setData] = useState<Record<LetterType, Data>>({ cover: {}, noc: {}, invitation: {}, sponsor: {} })
  const [ack, setAck] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [today, setToday] = useState('')
  const [pane, setPane] = useState<'form' | 'preview'>('form')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState<OriginId>('pakistan')
  // After the first download/copy we offer the checklist once. 'hidden' = not yet, 'shown', 'skipped'.
  const [capture, setCapture] = useState<'hidden' | 'shown' | 'skipped'>('hidden')

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10))
    try {
      const raw = sessionStorage.getItem(STORE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<LetterType, Data>>
        setData((prev) => ({ ...prev, ...parsed }))
      }
      if (sessionStorage.getItem(ACK_KEY) === '1') setAck(true)
      const storedOrigin = sessionStorage.getItem(ORIGIN_KEY)
      if (isOriginId(storedOrigin)) setOrigin(storedOrigin)
      if (sessionStorage.getItem(CAPTURE_KEY) === 'skipped') setCapture('skipped')
    } catch {
      /* storage unavailable — start empty */
    }
    // Arrivals from the letter guides: /support-letter?type=cover&destination=Germany
    try {
      const q = new URLSearchParams(window.location.search)
      const qt = q.get('type') as LetterType | null
      const qo = q.get('origin')
      if (isOriginId(qo)) setOrigin(qo)
      if (qt && LETTERS.some((l) => l.type === qt)) {
        setType(qt)
        const preset = VARIANTS[qt]?.[q.get('variant') ?? '']
        if (preset) {
          // Never overwrite something the visitor already typed.
          setData((prev) => ({ ...prev, [qt]: { ...preset, ...(prev[qt] ?? {}) } }))
        }
        const qd = (q.get('destination') ?? '').slice(0, 60)
        const dest = findDestinationByName(qd)
        if (dest) {
          setData((prev) => {
            const cur = prev[qt] ?? {}
            const next: Data = { ...cur }
            // Never overwrite something the visitor already typed.
            if (!next.destination && qt !== 'invitation') next.destination = toolDestinationName(dest)
            if (!next.region && (qt === 'cover' || qt === 'invitation' || qt === 'sponsor')) next.region = dest.region
            return { ...prev, [qt]: next }
          })
        }
      }
    } catch {
      /* ignore malformed query */
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(data))
    } catch {
      /* ignore */
    }
  }, [data, loaded])

  useEffect(() => {
    if (!loaded) return
    try {
      sessionStorage.setItem(ORIGIN_KEY, origin)
    } catch {
      /* ignore */
    }
  }, [origin, loaded])

  useEffect(() => {
    if (!loaded) return
    try {
      if (ack) sessionStorage.setItem(ACK_KEY, '1')
      else sessionStorage.removeItem(ACK_KEY)
    } catch {
      /* ignore */
    }
  }, [ack, loaded])

  const meta = LETTERS.find((l) => l.type === type)!
  const current = data[type]
  // The letter builders read the applicant's country from the data, like any other answer.
  const withOrigin = useMemo<Data>(() => ({ ...current, origin }), [current, origin])
  const fields = useMemo(() => getFields(type, origin), [type, origin])
  const blocks = useMemo(() => buildLetter(type, withOrigin, today), [type, withOrigin, today])
  const notices = useMemo(() => getNotices(type, withOrigin), [type, withOrigin])
  const flags = useMemo(() => findRedFlags(type, withOrigin), [type, withOrigin])
  const missing = useMemo(() => countPlaceholders(blocks), [blocks])

  const groups = useMemo(() => {
    const map = new Map<string, Field[]>()
    fields.filter((f) => isVisible(f, current)).forEach((f) => map.set(f.group, [...(map.get(f.group) ?? []), f]))
    return [...map.entries()]
  }, [fields, current])

  // Offer the checklist once, after the person has what they came for.
  const offerCapture = () => setCapture((c) => (c === 'hidden' ? 'shown' : c))
  const skipCapture = () => {
    setCapture('skipped')
    try {
      sessionStorage.setItem(CAPTURE_KEY, 'skipped')
    } catch {
      /* ignore */
    }
  }

  const set = (id: string, val: string) =>
    setData((prev) => ({ ...prev, [type]: { ...prev[type], [id]: val } }))

  async function onPdf() {
    if (!ack) return
    setBusy(true)
    try {
      await downloadLetterPdf(blocks, `${meta.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`)
      offerCapture()
    } finally {
      setBusy(false)
    }
  }

  async function onDocx() {
    if (!ack) return
    setBusy(true)
    try {
      await downloadLetterDocx(blocks, `${meta.label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.docx`)
      offerCapture()
    } finally {
      setBusy(false)
    }
  }

  async function onCopy() {
    if (!ack) return
    try {
      await navigator.clipboard.writeText(blocksToText(blocks))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
      offerCapture()
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onPdf}
        disabled={busy || !ack}
        className="min-h-[44px] rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? 'Preparing…' : 'Download PDF'}
      </button>
      <button
        type="button"
        onClick={onDocx}
        disabled={busy || !ack}
        className="min-h-[44px] rounded-lg border border-emerald-700 bg-white px-4 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Download Word
      </button>
      <button
        type="button"
        onClick={onCopy}
        disabled={!ack}
        className="disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px] rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400"
      >
        {copied ? 'Copied ✓' : 'Copy text'}
      </button>
      <button
        type="button"
        onClick={() => {
          setData((prev) => ({ ...prev, [type]: {} }))
          setAck(false)
        }}
        className="min-h-[44px] rounded-lg px-3 text-sm font-medium text-gray-600 underline-offset-2 hover:underline"
      >
        Clear form
      </button>
    </div>
  )

  return (
    <div>
      {/* Where the applicant lives: changes labels, examples and the document tick-boxes */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span id="origin-label" className="text-sm font-semibold text-gray-800">Applying from</span>
        <div role="radiogroup" aria-labelledby="origin-label" className="inline-flex rounded-lg bg-gray-100 p-1">
          {ORIGINS.map((o) => (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={origin === o.id}
              onClick={() => setOrigin(o.id)}
              className={`min-h-[40px] rounded-md px-4 text-sm font-semibold transition ${origin === o.id ? 'bg-white text-emerald-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500">Sets the example IDs, tax documents and currency in the form.</span>
      </div>

      {/* Letter type */}
      <div role="tablist" aria-label="Letter type" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {LETTERS.map((l) => {
          const on = l.type === type
          return (
            <button
              key={l.type}
              role="tab"
              aria-selected={on}
              type="button"
              onClick={() => setType(l.type)}
              className={`rounded-xl border p-4 text-left transition ${
                on ? 'border-emerald-700 bg-emerald-50 ring-1 ring-emerald-700' : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="block text-sm font-bold text-gray-900">{l.label}</span>
              <span className="mt-1 block text-xs text-gray-600">{l.blurb}</span>
            </button>
          )
        })}
      </div>

      {/* Mobile pane switch */}
      <div className="mt-6 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1 lg:hidden" role="tablist" aria-label="Form or preview">
        {(['form', 'preview'] as const).map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={pane === p}
            onClick={() => setPane(p)}
            className={`min-h-[44px] rounded-md text-sm font-semibold ${pane === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'}`}
          >
            {p === 'form' ? 'Fill in details' : `Preview${missing ? ` (${missing} to fill)` : ''}`}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* LEFT — form */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className={`${pane === 'form' ? 'block' : 'hidden'} space-y-7 lg:block`}
          aria-label={`${meta.label} details`}
        >
          {groups.map(([group, fields]) => (
            <section key={group} className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-base font-bold text-gray-900">{group}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {fields.map((f) => (
                  <div key={f.id} className={f.half ? '' : 'sm:col-span-2'}>
                    <FieldInput f={f} value={current[f.id] ?? ''} onChange={(val) => set(f.id, val)} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </form>

        {/* RIGHT — live preview */}
        <div className={`${pane === 'preview' ? 'block' : 'hidden'} lg:sticky lg:top-20 lg:block`}>
          {notices.length > 0 && (
            <div className="mb-3 space-y-2">
              {notices.map((n, i) => (
                <p key={i} role="note" className={`rounded-lg border px-3 py-2 text-xs leading-relaxed ${n.level === 'warn' ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-sky-200 bg-sky-50 text-sky-900'}`}>
                  {n.text}
                </p>
              ))}
            </div>
          )}
          {flags.length > 0 && (
            <div className="mb-3 space-y-2" aria-live="polite">
              {flags.map((fl, i) => (
                <p key={i} className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-900">
                  <strong>{fl.fieldLabel}:</strong> {fl.text}
                </p>
              ))}
            </div>
          )}
          <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-relaxed text-amber-950">
            <p className="font-semibold">Before you download: you are responsible for this letter</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4">
              <li>This tool only arranges the facts you type. VisitPlane does not check, verify or add facts.</li>
              <li>Every statement must be true and match your documents. A false or mismatched statement can get a visa refused or lead to a ban, and that is your responsibility.</li>
              <li>Check your embassy or visa centre&rsquo;s own checklist. Many do not ask for this letter at all, and it never replaces their mandatory forms.</li>
              <li>This is not legal or immigration advice, and no letter guarantees a visa. VisitPlane is not an agent, lawyer or consultant, and is not affiliated with any embassy or government. See our{' '}
                <Link href="/terms" className="underline">Terms</Link>.</li>
            </ul>
            <label className="mt-3 flex cursor-pointer items-start gap-2 font-medium text-gray-900">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-emerald-700" checked={ack} onChange={(e) => setAck(e.target.checked)} />
              <span>I understand this letter must exactly match my attached documents and does not replace mandatory government forms. I have read the notes above and I am responsible for what I submit.</span>
            </label>
          </div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-800" aria-live="polite">
              {missing === 0 ? 'Letter complete — read it once more before you sign.' : `${missing} field${missing === 1 ? '' : 's'} still to fill (highlighted in amber)`}
            </p>
            {actions}
          </div>
          <div className="max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl bg-gray-100 p-3 sm:p-5">
            <Paper blocks={blocks} />
          </div>
          {capture === 'shown' && (
            <div className="mt-4">
              <BlogEmailCapture
                variant="inline"
                capturedFrom="support-letter-download"
                leadMagnet={LETTER_MAGNET}
                title="Get the visa document checklist"
                subtitle="A free PDF of the documents most consulates ask for, with a week-by-week timeline. Only your email is sent. The letter you just made stays in this browser."
              />
              <button type="button" onClick={skipCapture} className="mt-2 text-xs font-medium text-gray-500 underline-offset-2 hover:underline">
                No thanks
              </button>
            </div>
          )}
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            Nothing is uploaded. Your draft is kept in this browser tab only and is erased when you close it.
          </p>
        </div>
      </div>
    </div>
  )
}
