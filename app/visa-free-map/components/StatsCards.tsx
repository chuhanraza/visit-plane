'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

interface Props {
  free: number
  arrival: number
  required: number
  total: number
  rank?: number
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const started = useRef(false)
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const start = Date.now()
    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(target * ease))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target, duration])

  return { count, ref }
}

interface CardProps {
  icon: string
  label: string
  value: number | string
  sublabel: string
  color: string
  bg: string
  delay: number
  prefix?: string
  suffix?: string
  animated?: boolean
  rawValue?: number
}

function Card({ icon, label, value, sublabel, color, bg, delay, prefix = '', suffix = '', animated = true, rawValue }: CardProps) {
  const { count, ref } = useCountUp(typeof rawValue === 'number' ? rawValue : 0, 1400)
  const displayValue = animated && typeof rawValue === 'number' ? count : value

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border p-6 text-center"
      style={{ borderColor: `${color}28`, background: bg }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{ background: `radial-gradient(circle at 50% -20%, ${color}, transparent 70%)` }} />
      <div className="relative">
        <div className="text-3xl mb-3">{icon}</div>
        <div className="text-4xl font-black tabular-nums leading-none" style={{ color }}>
          {prefix}{displayValue}{suffix}
        </div>
        <div className="mt-2 text-sm font-bold text-white">{label}</div>
        <div className="mt-0.5 text-xs text-white/40">{sublabel}</div>
      </div>
    </motion.div>
  )
}

export default function StatsCards({ free, arrival, required, total, rank }: Props) {
  const rankNum = rank ?? 99
  const rankDisplay = `#${rankNum}`
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card
        icon="🟢" label="Visa Free" value={free}
        rawValue={free} sublabel="Just pack and go!"
        color="#10B981" bg="rgba(16,185,129,0.07)" delay={0}
      />
      <Card
        icon="🟡" label="Visa on Arrival" value={arrival}
        rawValue={arrival} sublabel="Get stamp at airport"
        color="#F59E0B" bg="rgba(245,158,11,0.07)" delay={0.1}
      />
      <Card
        icon="🔴" label="Visa Required" value={required}
        rawValue={required} sublabel="Pre-travel application"
        color="#EF4444" bg="rgba(239,68,68,0.07)" delay={0.2}
      />
      <Card
        icon="🏆" label="Passport Rank" value={rankDisplay}
        sublabel="Global ranking 2026" animated={false}
        color="#A855F7" bg="rgba(168,85,247,0.07)" delay={0.3}
      />
    </div>
  )
}
