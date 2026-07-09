'use client'

/**
 * The member's OWN checklist chip. Manual states toggle ready/not-started;
 * order-backed states (uploaded/approved/rejected) link to the portal where
 * the real document lives — they are never manually togglable.
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ORDER_BACKED_STATUSES, STATUS_META, type SlotStatus } from '@/lib/crew/types'

export default function OwnSlotChip({ crewId, slotKey, slotLabel, status }: {
  crewId: string
  slotKey: string
  slotLabel: string
  status: SlotStatus
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const meta = STATUS_META[status]

  if (ORDER_BACKED_STATUSES.includes(status)) {
    return (
      <Link href="/portal"
        title="Tracked from your visa application — updates automatically"
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${meta.chip} ring-1 ring-inset ring-gray-200`}>
        <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
        {slotLabel} · {meta.label}
      </Link>
    )
  }

  async function toggle() {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch(`/api/crew/${crewId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotKey, status: status === 'ready' ? 'not_started' : 'ready' }),
      })
      if (res.ok) router.refresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button onClick={toggle} disabled={busy}
      aria-pressed={status === 'ready'}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 min-h-[36px] text-xs font-medium transition active:scale-95 ${meta.chip} ${busy ? 'opacity-50' : 'hover:ring-1 hover:ring-blue-300'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
      {slotLabel}
      {status === 'ready' ? ' ✓' : ''}
    </button>
  )
}
