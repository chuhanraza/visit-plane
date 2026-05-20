'use client'
import { useState } from 'react'
import { ALL_COUNTRIES } from '@/components/CountrySelect'

const FLAG_MAP = Object.fromEntries(ALL_COUNTRIES.map(c => [c.name.toLowerCase(), c.flag]))
const EXTRA_FLAGS: Record<string, string> = { 'uae': '🇦🇪' }
function getFlag(name: string) { return FLAG_MAP[name.toLowerCase()] ?? EXTRA_FLAGS[name.toLowerCase()] ?? '🌍' }

interface Props {
  passport: string
  free: number
  total: number
  coverage: number
}

function TwitterIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
}
function WhatsAppIcon() {
  return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12.004 2.003a9.997 9.997 0 0 0-8.591 15.09L2 22l5.068-1.332A9.997 9.997 0 1 0 12.004 2.003zm0 18.18a8.16 8.16 0 0 1-4.162-1.14l-.298-.178-3.091.811.825-3.016-.194-.31a8.18 8.18 0 1 1 6.92 3.833z"/></svg>
}

export default function ShareCard({ passport, free, total, coverage }: Props) {
  const [copied, setCopied] = useState(false)
  const flag = getFlag(passport)
  const shareText = `My ${passport} ${flag} passport can access ${free} countries visa-free out of ${total}! 🌍✈️\nCheck yours → visitplane.com/visa-free-map`
  const waText = `My ${passport} 🛂 passport can access ${free} countries visa-free!\nCheck yours → visitplane.com/visa-free-map`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl p-px"
      style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.4), rgba(59,130,246,0.2) 50%, rgba(139,92,246,0.25))' }}>
      <div className="relative rounded-[23px] bg-[#0C1526] p-8 sm:p-10 text-center">
        <div className="absolute inset-0 rounded-[23px] bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.08),transparent_60%)] pointer-events-none" />
        <div className="relative">
          <div className="text-4xl mb-4">🌍</div>
          <h3 className="text-2xl font-extrabold text-white mb-1">My {passport} Passport</h3>
          <p className="text-white/50 text-sm mb-2">Can access <span className="text-teal-400 font-bold">{free}</span> countries visa-free!</p>
          {/* Progress bar */}
          <div className="mx-auto max-w-sm mb-6">
            <div className="flex items-center justify-between text-xs text-white/40 mb-1.5">
              <span>0%</span>
              <span className="text-teal-400 font-semibold">{coverage}% of world accessible</span>
              <span>100%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-1000"
                style={{ width: `${coverage}%` }} />
            </div>
          </div>
          {/* Share buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={`https://wa.me/?text=${encodeURIComponent(waText)}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-[#25d366]/30 bg-[#25d366]/10 px-5 py-2.5 text-sm font-bold text-[#25d366] transition hover:bg-[#25d366]/20">
              <WhatsAppIcon /> Share on WhatsApp
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/12">
              <TwitterIcon /> Share on X
            </a>
            <button onClick={handleCopy}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                copied ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30' : 'border border-teal-500/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20'
              }`}>
              {copied ? '✓ Copied!' : '📋 Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
