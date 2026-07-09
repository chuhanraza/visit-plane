'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateCrewForm({ hasCrews }: { hasCrews: boolean }) {
  const router = useRouter()
  const [open, setOpen] = useState(!hasCrews)
  const [name, setName] = useState('')
  const [destination, setDestination] = useState('')
  const [travelDate, setTravelDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          destinationName: destination,
          travelDate: travelDate || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Could not create the crew')
      router.push(`/crew/${json.id}`)
    } catch (err) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl px-4 py-3">
        + Create a crew
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
      <div>
        <h2 className="font-bold text-gray-900">Create a crew</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          You&apos;ll get a link to share with your travel companions — only people you send it to can join.
        </p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">{error}</div>}
      <div>
        <label htmlFor="crew-name" className="block text-sm font-medium text-gray-700 mb-1">Crew name</label>
        <input id="crew-name" type="text" required maxLength={80} value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Family Umrah Trip"
          className="w-full text-base border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="crew-dest" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
        <input id="crew-dest" type="text" required maxLength={80} value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Saudi Arabia"
          className="w-full text-base border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label htmlFor="crew-date" className="block text-sm font-medium text-gray-700 mb-1">
          Travel date <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input id="crew-date" type="date" value={travelDate}
          onChange={(e) => setTravelDate(e.target.value)}
          className="w-full text-base border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading}
          className="flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-500 disabled:bg-gray-300 text-white text-sm font-medium rounded-xl px-4 py-3">
          {loading ? 'Creating…' : 'Create crew'}
        </button>
        {hasCrews && (
          <button type="button" onClick={() => setOpen(false)}
            className="min-h-[44px] text-sm text-gray-600 hover:text-gray-900 px-4">
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
