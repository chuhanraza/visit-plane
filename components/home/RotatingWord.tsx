'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Rotating hero adjective (iVisa-style). Cycles a green-gradient word in the
// headline to add motion + reinforce the value props. Width is reserved by an
// invisible sizer (the longest word) so the rest of the line never jumps, and
// it freezes on the first word under prefers-reduced-motion.
const WORDS = ['easiest', 'smartest', 'fastest', 'simplest', 'clearest']
const GRADIENT = 'linear-gradient(135deg, #16C95C 0%, #0EA94A 100%)'
const INTERVAL = 2200

export default function RotatingWord() {
  const [index, setIndex] = useState(0)
  const [reduced, setReduced] = useState(false)

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

  const longest = WORDS.reduce((a, b) => (b.length > a.length ? b : a))

  return (
    <span className="relative inline-block align-baseline">
      {/* sizer reserves the widest word's width so the line never reflows */}
      <span className="invisible" aria-hidden="true">{longest}</span>
      {/* one stable word for screen readers / crawlers (visible words are decorative) */}
      <span className="sr-only">{WORDS[0]}</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={WORDS[index]}
          aria-hidden="true"
          initial={reduced ? false : { y: '0.55em', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? undefined : { y: '-0.55em', opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 flex items-center justify-center whitespace-nowrap bg-clip-text text-transparent"
          style={{ backgroundImage: GRADIENT }}
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
