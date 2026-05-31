'use client'
interface Props { checksUsed: number }
export default function ProUpsellBanner({ checksUsed }: Props) {
  if (checksUsed < 3) return null
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-900/30 to-orange-900/20 px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="text-sm font-bold text-amber-300">You&apos;ve used {checksUsed} free document checks today</p>
            <p className="mt-0.5 text-xs text-amber-400/80">Upgrade to <strong className="text-amber-300">VisitPlane Pro</strong> for unlimited checks and expert human review.</p>
          </div>
        </div>
        <button className="shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:from-amber-400 hover:to-orange-400">
          Upgrade for $9/month →
        </button>
      </div>
    </div>
  )
}
