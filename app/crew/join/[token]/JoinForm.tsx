'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function JoinForm({ token, signedIn, alreadyMember, crewId }: {
  token: string
  signedIn: boolean
  alreadyMember: boolean
  crewId: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (alreadyMember) {
    return (
      <Link href={`/crew/${crewId}`}
        className="block w-full text-center min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-4 py-3">
        You&apos;re in this crew — open the dashboard →
      </Link>
    )
  }

  if (!signedIn) {
    return (
      <div className="space-y-3">
        <Link href={`/portal/login?next=${encodeURIComponent(pathname)}`}
          className="block w-full text-center min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-4 py-3">
          Sign in or create an account to join
        </Link>
        <p className="text-[11px] text-gray-400 text-center">
          Free account — you&apos;ll come right back here to finish joining.
        </p>
      </div>
    )
  }

  async function join() {
    if (!consent) { setError('Please tick the box to share your readiness status with the crew.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/crew/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, consent: true }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not join')
      router.push(`/crew/${json.id}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
      <label className="flex items-start gap-3 cursor-pointer">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
        <span className="text-sm text-gray-700">
          I agree to share my document-readiness <span className="font-semibold">status</span> (ticks only — never my
          documents or personal details) with this crew.
        </span>
      </label>
      <button onClick={join} disabled={loading || !consent}
        className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl px-4 py-3">
        {loading ? 'Joining…' : 'Join the crew'}
      </button>
    </div>
  )
}
