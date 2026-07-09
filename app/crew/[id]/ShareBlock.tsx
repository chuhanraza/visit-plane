'use client'

/**
 * Leader-only share block. The USER shares their own link — WhatsApp prefill,
 * copy, or the native share sheet. No SMS/email is ever sent by the app.
 * (Same wa.me / navigator.share pattern as the blog share strip.)
 */
import { useState } from 'react'

export default function ShareBlock({ crewId, crewName, destination, inviteUrl, expiresAt }: {
  crewId: string
  crewName: string
  destination: string
  inviteUrl: string
  expiresAt: string
}) {
  const [url, setUrl] = useState(inviteUrl)
  const [expiry, setExpiry] = useState(expiresAt)
  const [copied, setCopied] = useState(false)
  const [rotating, setRotating] = useState(false)

  const shareText =
    `Join my crew "${crewName}" on VisitPlane — we're tracking our ${destination} trip documents together. ` +
    `Tap to join: ${url}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard unavailable */ }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: `Join ${crewName} on VisitPlane`, text: shareText, url })
    } catch { /* user dismissed / unsupported */ }
  }

  async function rotate() {
    if (!confirm('Get a new link? Everyone who has the old link will no longer be able to join with it.')) return
    setRotating(true)
    try {
      const res = await fetch(`/api/crew/${crewId}/invite`, { method: 'POST' })
      const json = await res.json()
      if (res.ok) { setUrl(json.url); setExpiry(json.expiresAt) }
    } finally {
      setRotating(false)
    }
  }

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
      <h2 className="font-bold text-gray-900 text-sm mb-1">Invite your travel companions</h2>
      <p className="text-xs text-gray-500 mb-3">
        Share this link yourself — only people you send it to can join.
        Link valid until {new Date(expiry).toLocaleDateString()}.
      </p>

      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 mb-3">
        <span className="text-xs text-gray-600 truncate flex-1 font-mono">{url}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
          target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 min-h-[44px] bg-[#25D366] hover:opacity-90 text-white text-sm font-semibold rounded-xl px-4 py-2.5">
          WhatsApp
        </a>
        <button onClick={copy}
          className="inline-flex items-center min-h-[44px] bg-gray-900 hover:bg-gray-700 text-white text-sm font-semibold rounded-xl px-4 py-2.5">
          {copied ? 'Copied ✓' : 'Copy link'}
        </button>
        {canNativeShare && (
          <button onClick={nativeShare}
            className="inline-flex items-center min-h-[44px] bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl px-4 py-2.5">
            Share…
          </button>
        )}
        <button onClick={rotate} disabled={rotating}
          className="inline-flex items-center min-h-[44px] text-xs text-gray-500 hover:text-gray-900 px-2 ml-auto">
          {rotating ? 'Rotating…' : 'New link'}
        </button>
      </div>
    </div>
  )
}
