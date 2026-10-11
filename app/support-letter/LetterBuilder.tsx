'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LETTERS,
  buildLetter,
  blocksToText,
  countPlaceholders,
  type Block,
  type Data,
  type Field,
  type LetterType,
  type Seg,
} from '@/lib/letters/templates'
import { downloadLetterPdf } from '@/lib/letters/pdf'

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
  const [data, setData] = useState<Record<LetterType, Data>>({ cover: {}, invitation: {}, sponsor: {} })
  const [today, setToday] = useState('')
  const [pane, setPane] = useState<'form' | 'preview'>('form')
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setToday(new Date().toISOString().slice(0, 10))
  }, [])

  const meta = LETTERS.find((l) => l.type === type)!
  const current = data[type]
  const blocks = useMemo(() => buildLetter(type, current, today), [type, current, today])
  const missing = useMemo(() => countPlaceholders(blocks), [blocks])

  const groups = useMemo(() => {
    const map = new Map<string, Field[]>()
    meta.fields.forEach((f) => map.set(f.group, [...(map.get(f.group) ?? []), f]))
    return [...map.entries()]
  }, [meta])

  const set = (id: string, val: string) =>
    setData((prev) => ({ ...prev, [type]: { ...prev[type], [id]: val } }))

  async function onPdf() {
    setBusy(true)
    try {
      await downloadLetterPdf(blocks, `${meta.short.toLowerCase().replace(/\s+/g, '-')}.pdf`)
    } finally {
      setBusy(false)
    }
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(blocksToText(blocks))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — ignore */
    }
  }

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onPdf}
        disabled={busy}
        className="min-h-[44px] rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
      >
        {busy ? 'Preparing…' : 'Download PDF'}
      </button>
      <button
        type="button"
        onClick={onCopy}
        className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-4 text-sm font-semibold text-gray-800 transition hover:border-gray-400"
      >
        {copied ? 'Copied ✓' : 'Copy text'}
      </button>
      <button
        type="button"
        onClick={() => setData((prev) => ({ ...prev, [type]: {} }))}
        className="min-h-[44px] rounded-lg px-3 text-sm font-medium text-gray-600 underline-offset-2 hover:underline"
      >
        Clear form
      </button>
    </div>
  )

  return (
    <div>
      {/* Letter type */}
      <div role="tablist" aria-label="Letter type" className="grid gap-3 sm:grid-cols-3">
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
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-800" aria-live="polite">
              {missing === 0 ? 'Letter complete — read it once more before you sign.' : `${missing} field${missing === 1 ? '' : 's'} still to fill (highlighted in amber)`}
            </p>
            {actions}
          </div>
          <div className="max-h-[calc(100vh-9rem)] overflow-y-auto rounded-xl bg-gray-100 p-3 sm:p-5">
            <Paper blocks={blocks} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-gray-500">
            Your details stay in your browser. Nothing is uploaded or saved.
          </p>
        </div>
      </div>
    </div>
  )
}
