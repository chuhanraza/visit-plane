'use client'
import { motion } from 'framer-motion'
import { ALL_COUNTRIES } from '@/components/CountrySelect'

const FLAG_MAP = Object.fromEntries(ALL_COUNTRIES.map(c => [c.name.toLowerCase(), c.flag]))
function getFlag(name: string) { return FLAG_MAP[name.toLowerCase()] ?? '🌍' }

interface RankInfo { rank: number; score: number }

interface Props {
  passport: string
  rankInfo: RankInfo
  freeCount: number
  total: number
}

export default function PassportRankCard({ passport, rankInfo, freeCount, total }: Props) {
  const flag = getFlag(passport)
  const percentile = Math.round(((199 - rankInfo.rank) / 198) * 100)
  const worldPct = total > 0 ? Math.round((freeCount / total) * 100) : 0
  const usDiff = rankInfo.score - 179 // USA score

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl border border-white/10"
      style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1a1040 50%, #0f0c29 100%)' }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(139,92,246,0.25), transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(ellipse at bottom right, rgba(20,184,166,0.2), transparent 55%)' }} />

      <div className="relative grid grid-cols-1 gap-8 p-8 sm:grid-cols-2 sm:p-10">
        {/* Left column */}
        <div className="flex flex-col justify-center">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-yellow-400 text-xl">🏆</span>
            <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Your Passport Rank</span>
          </div>
          <div className="text-6xl font-black text-white leading-none mb-1">
            #{rankInfo.rank}
          </div>
          <p className="text-white/50 text-sm mb-6">out of 199 passports worldwide</p>
          <p className="text-xs text-white/30 mb-3 font-semibold">Henley Passport Index 2026</p>

          {/* Progress bar (rank percentile) */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white/40">
              <span>Weakest (#199)</span>
              <span className="text-purple-400 font-semibold">Top {100 - percentile}%</span>
              <span>Strongest (#1)</span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentile}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #7c3aed, #a855f7, #c084fc)' }}
              />
            </div>
          </div>

          {/* Visa-free score pill */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-teal-500/25 bg-teal-500/10 px-4 py-2 w-fit">
            <span className="text-teal-400 font-bold text-lg">{rankInfo.score}</span>
            <span className="text-teal-400/70 text-xs font-semibold">visa-free destinations (Henley)</span>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col justify-center space-y-5">
          {/* Flag + country */}
          <div className="flex items-center gap-4">
            <span className="text-6xl leading-none">{flag}</span>
            <div>
              <div className="text-2xl font-extrabold text-white">{passport}</div>
              <div className="text-white/40 text-sm">Passport</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/8 p-4 text-center">
              <div className="text-3xl font-black text-emerald-400">{freeCount}</div>
              <div className="text-xs text-white/40 mt-1">DB Visa-Free</div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/8 p-4 text-center">
              <div className="text-3xl font-black text-teal-400">{worldPct}%</div>
              <div className="text-xs text-white/40 mt-1">of world</div>
            </div>
          </div>

          {/* Comparison vs USA */}
          <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
            <div className="text-xs text-white/40 mb-2 font-semibold uppercase tracking-wide">vs USA Passport</div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🇺🇸</span>
              <div className="flex-1">
                {usDiff === 0 ? (
                  <span className="text-sm text-white/60 font-semibold">Same power as USA 🤝</span>
                ) : usDiff > 0 ? (
                  <span className="text-sm text-emerald-400 font-bold">+{usDiff} more destinations than USA 🚀</span>
                ) : (
                  <span className="text-sm text-rose-400 font-bold">{usDiff} fewer destinations than USA</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
