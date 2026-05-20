'use client'
import { motion } from 'framer-motion'

interface Props {
  free: number
  arrival: number
  required: number
  total: number
}

function Card({
  icon, label, value, sublabel, color, bg, delay,
}: {
  icon: string; label: string; value: string | number; sublabel: string
  color: string; bg: string; delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl border p-6 text-center"
      style={{ borderColor: `${color}25`, background: bg }}
    >
      <div className="absolute inset-0 pointer-events-none opacity-[0.08]"
        style={{ background: `radial-gradient(circle at 50% -20%, ${color}, transparent 70%)` }} />
      <div className="relative">
        <div className="text-3xl mb-3">{icon}</div>
        <div className="text-4xl font-black tabular-nums leading-none" style={{ color }}>{value}</div>
        <div className="mt-2 text-sm font-bold text-white">{label}</div>
        <div className="mt-0.5 text-xs text-white/40">{sublabel}</div>
      </div>
    </motion.div>
  )
}

export default function StatsCards({ free, arrival, required, total }: Props) {
  const coverage = total > 0 ? Math.round(((free + arrival) / total) * 100) : 0
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card
        icon="🟢" label="Visa Free" value={free}
        sublabel="Just pack and go!"
        color="#10B981" bg="rgba(16,185,129,0.07)" delay={0}
      />
      <Card
        icon="🟡" label="Visa on Arrival" value={arrival}
        sublabel="Get stamp at airport"
        color="#F59E0B" bg="rgba(245,158,11,0.07)" delay={0.1}
      />
      <Card
        icon="🔴" label="Visa Required" value={required}
        sublabel="Pre-travel application"
        color="#EF4444" bg="rgba(239,68,68,0.07)" delay={0.2}
      />
      <Card
        icon="🌍" label="World Coverage" value={`${coverage}%`}
        sublabel="Your passport power"
        color="#3B82F6" bg="rgba(59,130,246,0.07)" delay={0.3}
      />
    </div>
  )
}
