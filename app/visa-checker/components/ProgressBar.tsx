'use client'

type Props = { step: number; totalSteps: number }

export default function ProgressBar({ step, totalSteps }: Props) {
  const pct = Math.round((step / totalSteps) * 100)

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Label row */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-600">Step {step} of {totalSteps}</span>
        <span className="text-sm font-bold text-teal-600">{pct}% complete</span>
      </div>

      {/* Track */}
      <div className="relative h-3 rounded-full bg-gray-200 overflow-visible">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-teal-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
        {/* Airplane icon riding the bar */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 text-lg leading-none select-none"
          style={{ left: `clamp(1rem, ${pct}%, calc(100% - 1rem))` }}
        >
          🛫
        </div>
      </div>
    </div>
  )
}
