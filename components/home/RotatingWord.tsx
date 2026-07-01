'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// Rotating hero adjective (iVisa-style). Cycles a green-gradient word in the
// headline to add motion + reinforce the value props. Exactly ONE word exists
// in the DOM at a time (mode="wait"), so server HTML / crawlers read a single
// clean word — the old sizer+sr-only+animated trio rendered as
// "smartesteasiesteasiest" in the raw H1. Width is reserved with a ch-based
// min-width so the line doesn't reflow, and it freezes on the first word under
// prefers-reduced-motion.
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
    <span
      className="inline-block whitespace-nowrap text-center align-baseline"
      style={{ minWidth: `${longest.length + 0.5}ch` }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={WORDS[index]}
          initial={reduced ? false : { y: '0.4em', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduced ? undefined : { y: '-0.4em', opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block bg-clip-text text-transparent"
          style={{ backgroundImage: GRADIENT }}
        >
          {WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
