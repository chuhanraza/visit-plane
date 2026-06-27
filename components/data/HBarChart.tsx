// Pure server component — a lightweight horizontal bar chart built from CSS only
// (no charting library, no client JS). Renders accessible labelled bars so the
// data is readable by humans and crawlers alike.

export interface BarDatum {
  label: string
  value: number
  /** Optional display string for the value (defaults to value). */
  display?: string
  flag?: string
}

export default function HBarChart({
  data,
  unit = '',
  max,
  barClass = 'bg-gradient-to-r from-teal-400 to-emerald-500',
}: {
  data: BarDatum[]
  unit?: string
  max?: number
  barClass?: string
}) {
  const peak = max ?? Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="space-y-2.5" role="img" aria-label="Bar chart">
      {data.map((d) => {
        const pct = Math.max(2, Math.round((d.value / peak) * 100))
        return (
          <div key={d.label} className="flex items-center gap-3">
            <div className="w-28 shrink-0 truncate text-right text-xs font-medium text-gray-600 sm:w-40">
              {d.flag ? <span className="mr-1" aria-hidden="true">{d.flag}</span> : null}
              {d.label}
            </div>
            <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-gray-100">
              <div
                className={`h-full rounded-md ${barClass}`}
                style={{ width: `${pct}%` }}
              />
              <span className="absolute inset-y-0 right-2 flex items-center text-[11px] font-bold text-gray-700">
                {d.display ?? `${d.value}${unit}`}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
