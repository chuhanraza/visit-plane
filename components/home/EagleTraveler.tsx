'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// ─────────────────────────────────────────────────────────────────────────────
// Brand mascot illustration band — the "Captain Eagle" traveler riding the
// signature green wave. Renders /images/eagle-traveler.png (a transparent PNG
// supplied separately).
//
// GRACEFUL FALLBACK: the eagle is kept invisible until it successfully loads,
// and the wave + shadow only appear once it has. If the asset is missing or
// fails to load, the whole band removes itself — so the page never shows a
// broken-image glyph or an empty wave; the section simply reads
// headline → comparison until the PNG is added at public/images/eagle-traveler.png.
// ─────────────────────────────────────────────────────────────────────────────
export default function EagleTraveler() {
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  if (failed) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={loaded ? { opacity: 1, y: 0 } : { opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`relative mx-auto flex w-full max-w-2xl items-end justify-center ${loaded ? 'mb-10 mt-2 sm:mb-12' : ''}`}
    >
      {loaded && (
        <>
          {/* signature green wave behind the mascot */}
          <svg
            viewBox="0 0 800 220"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-x-0 bottom-10 h-28 w-full sm:bottom-12"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="eagle-wave" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#5EEAD4" stopOpacity="0.25" />
                <stop offset="0.5" stopColor="#34D399" />
                <stop offset="1" stopColor="#86EFAC" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <path
              d="M0 150 C 160 95 280 195 420 150 S 660 80 800 140"
              fill="none"
              stroke="url(#eagle-wave)"
              strokeWidth="14"
              strokeLinecap="round"
            />
          </svg>
          {/* soft contact shadow */}
          <div className="pointer-events-none absolute bottom-9 left-1/2 h-5 w-44 -translate-x-1/2 rounded-[50%] bg-gray-900/10 blur-md sm:bottom-11" aria-hidden="true" />
        </>
      )}

      <img
        src="/images/eagle-traveler.png"
        alt="VisitPlane eagle travel mascot sitting on a suitcase holding a boarding pass"
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`relative z-10 h-auto w-[260px] select-none object-contain transition-opacity duration-500 sm:w-[330px] lg:w-[380px] ${loaded ? 'opacity-100' : 'pointer-events-none absolute opacity-0'}`}
        draggable={false}
      />
    </motion.div>
  )
}
