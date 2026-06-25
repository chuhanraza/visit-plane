'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

// g-then-key navigation map.
const GOTO: { key: string; href: string; label: string }[] = [
  { key: 'd', href: '/admin', label: 'Dashboard' },
  { key: 'a', href: '/admin/analytics', label: 'Analytics' },
  { key: 'l', href: '/admin/leads', label: 'Leads / CRM' },
  { key: 'o', href: '/admin/orders', label: 'e-Visa orders' },
  { key: 'r', href: '/admin/revenue', label: 'Revenue' },
  { key: 'f', href: '/admin/affiliate-mgmt', label: 'Affiliates' },
  { key: 'c', href: '/admin/content', label: 'Content' },
  { key: 'e', href: '/admin/email', label: 'Email' },
  { key: 'm', href: '/admin/marketing', label: 'Marketing' },
  { key: 'p', href: '/admin/ops', label: 'Ops' },
  { key: 'v', href: '/admin/developers', label: 'Developers' },
  { key: 's', href: '/admin/settings', label: 'Settings' },
]

function isTyping(el: EventTarget | null): boolean {
  const t = el as HTMLElement | null
  if (!t) return false
  const tag = t.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable
}

export default function KeyboardShortcuts() {
  const router = useRouter()
  const [help, setHelp] = useState(false)
  const goMode = useRef(false)
  const goTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key === 'Escape') { setHelp(false); goMode.current = false; return }
      if (isTyping(e.target)) return

      if (goMode.current) {
        goMode.current = false
        if (goTimer.current) clearTimeout(goTimer.current)
        const dest = GOTO.find(g => g.key === e.key.toLowerCase())
        if (dest) { e.preventDefault(); router.push(dest.href) }
        return
      }
      if (e.key === '?') { e.preventDefault(); setHelp(h => !h) }
      else if (e.key.toLowerCase() === 'g') {
        goMode.current = true
        if (goTimer.current) clearTimeout(goTimer.current)
        goTimer.current = setTimeout(() => { goMode.current = false }, 1500)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [router])

  if (!help) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={() => setHelp(false)}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl p-6" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-white mb-3">Keyboard shortcuts</h2>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between"><span className="text-gray-300">Command palette / search</span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300 text-xs">⌘K</kbd></div>
          <div className="flex justify-between"><span className="text-gray-300">This help</span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300 text-xs">?</kbd></div>
          <div className="pt-2 text-gray-500 text-xs uppercase">Go to (press g, then…)</div>
          {GOTO.map(g => (
            <div key={g.key} className="flex justify-between"><span className="text-gray-300">{g.label}</span><kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-300 text-xs">g {g.key}</kbd></div>
          ))}
        </div>
        <button onClick={() => setHelp(false)} className="mt-4 w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-200 text-sm">Close</button>
      </div>
    </div>
  )
}
