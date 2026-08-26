'use client'

import { useState, useTransition } from 'react'

interface PhotoActionsProps {
  photoId: string
  destinationId: string
  isActive: boolean
}

export default function PhotoActions({ photoId, destinationId, isActive }: PhotoActionsProps) {
  const [pending, startTransition] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)

  function act(action: 'approve' | 'reject') {
    startTransition(async () => {
      setMsg(null)
      const res = await fetch(`/api/admin/destination-photos/${photoId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, destinationId }),
      })
      if (res.ok) {
        setMsg(action === 'approve' ? 'Approved — now live' : 'Rejected')
        setTimeout(() => window.location.reload(), 600)
      } else {
        const j = await res.json().catch(() => ({}))
        setMsg((j as { error?: string }).error ?? 'Failed')
      }
    })
  }

  return (
    <div className="mt-1.5 flex items-center gap-2">
      {!isActive && (
        <button
          type="button"
          disabled={pending}
          onClick={() => act('approve')}
          className="rounded-lg bg-emerald-700 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          Approve
        </button>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() => act('reject')}
        className="rounded-lg bg-gray-800 px-2 py-1 text-[11px] font-bold text-gray-300 hover:bg-red-900 hover:text-red-200 disabled:opacity-50"
      >
        {isActive ? 'Unpublish' : 'Reject'}
      </button>
      {msg && <span className="text-[11px] text-gray-500">{msg}</span>}
    </div>
  )
}
