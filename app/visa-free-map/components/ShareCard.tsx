'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { ALL_COUNTRIES } from '@/components/CountrySelect'

const FLAG_MAP = Object.fromEntries(ALL_COUNTRIES.map(c => [c.name.toLowerCase(), c.flag]))
function getFlag(name: string) { return FLAG_MAP[name.toLowerCase()] ?? '🌍' }

interface Props {
  passport: string
  free: number
  arrival: number
  required: number
  total: number
  coverage: number
  rank?: number
}

function TwitterIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
}
function WhatsAppIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2.003a9.997 9.997 0 0 0-8.591 15.09L2 22l5.068-1.332A9.997 9.997 0 1 0 12.004 2.003zm0 18.18a8.16 8.16 0 0 1-4.162-1.14l-.298-.178-3.091.811.825-3.016-.194-.31a8.18 8.18 0 1 1 6.92 3.833z"/></svg>
}

export default function ShareCard({ passport, free, arrival, required, total, coverage, rank = 99 }: Props) {
  const [copied, setCopied] = useState(false)
  const flag = getFlag(passport)

  const waText = `My ${passport} 🛂 passport ranks #${rank} in the world!\n✅ ${free} visa-free countries\n🟡 ${arrival} on arrival\nCheck yours → visitplane.com/visa-free-map ✈️`
  const tweetText = `My ${passport} ${flag} passport:\n✅ ${free} visa-free countries\n🟡 ${arrival} on arrival\n#${rank} globally ranked passport 🌍\n\nCheck yours: visitplane.com/visa-free-map`
  const copyText = `My ${passport} passport ranks #${rank} worldwide and can access ${free + arrival} countries easily! Check yours → visitplane.com/visa-free-map ✈️`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(copyText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl p-px"
      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(20,184,166,0.3) 50%, rgba(168,85,247,0.4) 100%)' }}
    >
      <div className="relative rounded-[23px] p-8 sm:p-10 text-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 50%, #1e1b4b 100%)' }}>
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.12), transparent 60%)' }} />

        <div className="relative">
          {/* Trophy + badge */}
          <div className="text-5xl mb-4">🏆</div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold text-indigo-300 mb-5">
            🛂 Henley Passport Index 2026
          </div>

          {/* Main stat */}
          <h3 className="text-3xl font-extrabold text-white mb-1">
            My {flag} {passport} Passport
          </h3>
          <div className="text-5xl font-black text-indigo-300 mb-1">Ranks #{rank}</div>
          <p className="text-white/50 text-sm mb-2">in the world</p>
          <p className="text-white/70 text-lg font-bold mb-6">
            <span className="text-teal-400">{free + arrival}</span> countries accessible easily!
          </p>

          {/* Progress bar */}
          <div className="mx-auto max-w-sm mb-8">
            <div className="flex items-center justify-between text-xs text-white/40 mb-2">
              <span>0%</span>
              <span className="text-teal-400 font-bold">Your world coverage: {coverage}%</span>
              <span>100%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${coverage}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #14b8a6, #10b981)' }}
              />
            </div>
          </div>

          {/* Share buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(waText)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-[#25d366]/30 bg-[#25d366]/10 px-5 py-2.5 text-sm font-bold text-[#25d366] transition hover:bg-[#25d366]/20"
            >
              <WhatsAppIcon /> Share on WhatsApp
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/12"
            >
              <TwitterIcon /> Share on X
            </a>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${copied ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'border border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20'}`}
            >
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
