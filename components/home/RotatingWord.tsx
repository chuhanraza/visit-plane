'use client'

import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Rotating hero adjective (iVisa-style). Cycles a green-gradient word in the
// headline to add motion + reinforce the value props. Exactly ONE word exists
// in the DOM at a time (mode="wait"), so server HTML / crawlers read a single
// clean word.
//
// SPACING: the slot width is measured from the CURRENT word (a hidden sizer
// with the inherited font metrics) and animated with a CSS width transition, so
// "The <word> way" always reads with natural single spaces — no lopsided gaps —
// and the line re-centres smoothly as the word changes. Freezes on the first
// word under prefers-reduced-motion.
const WORDS = ['easiest', 'smartest', 'fastest', 'simplest', 'clearest']
const GRADIENT = 'linear-gradient(135deg, #16C95C 0%, #0EA94A 100%)'
const INTERVAL = 2200

export default function RotatingWord() {
  const [index, setIndex] = useState(0)
  const [reduced, setReduced] = useState(false)
  const [width, setWidth] = useState<number>()
  const sizerRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (reduced) return
    const id = setInterval(() => setIndex((i) => (i + 1) % WORDS.length), INTERVAL)
    return () => clearInterval(id)
  }, [reduced])

  // Measure the current word to size the slot exactly (accurate for the
  // proportional font). Re-measure on resize / font swaps.
  useLayoutEffect(() => {
    const measure = () => {
      if (sizerRef.current) setWidth(sizerRef.current.offsetWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    // Re-measure once web fonts finish loading — initial metrics use a fallback
    // font and can be off, which briefly mis-sizes the slot.
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {})
    }
    return () => window.removeEventListener('resize', measure)
  }, [index])

  return (
    <span
      className="relative inline-block whitespace-nowrap align-baseline text-left"
      style={{
        width: width ? `${width}px` : undefined,
        transition: reduced ? undefined : 'width 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Invisible sizer — inherits the headline font metrics for an exact width. */}
      <span ref={sizerRef} aria-hidden className="invisible absolute left-0 top-0 whitespace-nowrap">
        {WORDS[index]}
      </span>
      {/* mode="wait": exactly ONE word in the DOM at a time, so SSR/crawlers read
          a clean headline and exiting words never pile up. The swap is a quick
          fade+slide; the slot stays word-sized so spacing is always natural. */}
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={WORDS[index]}
          initial={reduced ? false : { y: '0.4em', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? undefined : { y: '-0.4em', opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block whitespace-nowrap bg-clip-text text-transparent"
          style={{ backgroundImage: GRADIENT }}
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
