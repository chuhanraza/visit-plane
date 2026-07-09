'use client'

/** Leave crew (members) / manage members + delete crew (leader). */
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CrewActions({ crewId, userId, isLeader, removableMembers }: {
  crewId: string
  userId: string
  isLeader: boolean
  removableMembers: { userId: string; name: string }[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  async function leave() {
    if (!confirm('Leave this crew? Your readiness ticks will be removed from the group.')) return
    setBusy(true)
    const res = await fetch(`/api/crew/${crewId}/members/${userId}`, { method: 'DELETE' })
    if (res.ok) router.push('/crew')
    else setBusy(false)
  }

  async function removeMember(targetId: string, name: string) {
    if (!confirm(`Remove ${name} from the crew? Their ticks will be removed from the group.`)) return
    setBusy(true)
    await fetch(`/api/crew/${crewId}/members/${targetId}`, { method: 'DELETE' })
    router.refresh()
    setBusy(false)
  }

  async function deleteCrew() {
    if (!confirm('Delete this crew for everyone? This cannot be undone. (Nobody’s visa application or documents are affected.)')) return
    setBusy(true)
    const res = await fetch(`/api/crew/${crewId}`, { method: 'DELETE' })
    if (res.ok) router.push('/crew')
    else setBusy(false)
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
      {!isLeader && (
        <button onClick={leave} disabled={busy} className="min-h-[44px] hover:text-red-600">
          Leave crew
        </button>
      )}
      {isLeader && removableMembers.map((m) => (
        <button key={m.userId} onClick={() => removeMember(m.userId, m.name)} disabled={busy}
          className="min-h-[44px] hover:text-red-600">
          Remove {m.name}
        </button>
      ))}
      {isLeader && (
        <button onClick={deleteCrew} disabled={busy} className="min-h-[44px] hover:text-red-600 ml-auto">
          Delete crew
        </button>
      )}
    </div>
  )
}
