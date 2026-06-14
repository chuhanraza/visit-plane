'use client'

import { useState } from 'react'

interface Props {
  /** Selected date as ISO yyyy-mm-dd, or '' if none */
  value: string
  onChange: (iso: string) => void
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function toIso(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

export default function InlineCalendar({ value, onChange }: Props) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const selected = value ? new Date(`${value}T00:00:00`) : null

  const [view, setView] = useState(() => {
    const base = selected ?? today
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  const year = view.getFullYear()
  const month = view.getMonth()
  const startWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthLabel = view.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  // Don't allow navigating to months entirely before the current month
  const canGoPrev =
    year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth())

  const cells: (number | null)[] = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isPast = (d: number) => {
    const dt = new Date(year, month, d)
    dt.setHours(0, 0, 0, 0)
    return dt < today
  }
  const isToday = (d: number) =>
    year === today.getFullYear() && month === today.getMonth() && d === today.getDate()
  const isSelected = (d: number) => value === toIso(year, month, d)

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {/* Header: month nav */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => canGoPrev && setView(new Date(year, month - 1, 1))}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className={[
            'flex h-8 w-8 items-center justify-center rounded-lg border text-slate-600 transition',
            canGoPrev
              ? 'border-slate-200 hover:border-teal-400 hover:bg-teal-50'
              : 'border-slate-100 text-slate-300 cursor-not-allowed',
          ].join(' ')}
        >
          ‹
        </button>
        <span className="text-sm font-bold text-slate-800">{monthLabel}</span>
        <button
          type="button"
          onClick={() => setView(new Date(year, month + 1, 1))}
          aria-label="Next month"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-teal-400 hover:bg-teal-50"
        >
          ›
        </button>
      </div>

      {/* Weekday labels */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-center text-xs font-semibold text-slate-400">
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} />
          const past = isPast(d)
          const sel = isSelected(d)
          return (
            <button
              key={d}
              type="button"
              disabled={past}
              onClick={() => onChange(toIso(year, month, d))}
              className={[
                'flex h-9 items-center justify-center rounded-lg text-sm transition',
                sel
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 font-bold text-white'
                  : past
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700',
                !sel && isToday(d) ? 'ring-1 ring-teal-400' : '',
              ].join(' ')}
            >
              {d}
            </button>
          )
        })}
      </div>

      {/* Selected summary / clear */}
      {value && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500">
            Selected:{' '}
            <span className="font-semibold text-slate-700">
              {selected?.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs font-medium text-slate-400 underline underline-offset-2 hover:text-slate-600"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
