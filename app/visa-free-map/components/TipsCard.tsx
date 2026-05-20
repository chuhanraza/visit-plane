'use client'
import { motion } from 'framer-motion'

interface Props {
  passport: string
  rank: number
}

const TIPS = [
  {
    icon: '📋',
    title: 'Apply for Long-Term Visas',
    desc: 'A 10-year US visa unlocks all connected destinations too — it builds your travel profile and makes future applications easier.',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.07)',
    border: 'rgba(59,130,246,0.2)',
  },
  {
    icon: '🏙️',
    title: 'Get Residency Abroad',
    desc: 'UAE, Portugal or other residency programmes give you significant travel advantages and unlock more visa-free access.',
    color: '#A855F7',
    bg: 'rgba(168,85,247,0.07)',
    border: 'rgba(168,85,247,0.2)',
  },
  {
    icon: '✈️',
    title: 'Use Visa-Free Routes First',
    desc: 'Build a strong travel history by visiting accessible countries first — stamps demonstrate ties and financial stability for harder visas.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.07)',
    border: 'rgba(16,185,129,0.2)',
  },
]

export default function TipsCard({ passport, rank }: Props) {
  // Only show for mid-to-low ranked passports
  if (rank < 30) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <div className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">💡 Travel Smarter</p>
        <h2 className="text-2xl font-extrabold text-white">Tips to Travel More with Your {passport} Passport</h2>
        <p className="text-white/40 text-sm mt-2">Practical strategies to expand your travel options</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {TIPS.map((tip, i) => (
          <motion.div
            key={tip.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.45 }}
            className="relative overflow-hidden rounded-2xl border p-6"
            style={{ borderColor: tip.border, background: tip.bg }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{ background: `radial-gradient(circle at 50% -10%, ${tip.color}, transparent 65%)` }} />
            <div className="relative">
              <div className="text-4xl mb-4">{tip.icon}</div>
              <h3 className="text-base font-bold text-white mb-2">{tip.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{tip.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
