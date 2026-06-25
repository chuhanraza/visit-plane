'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

interface Activity { ts: string; kind: string; title: string; href: string }

const KIND_DOT: Record<string, string> = {
  lead: 'bg-emerald-400', correction: 'bg-amber-400', revenue: 'bg-blue-400',
  order: 'bg-blue-400', conversion: 'bg-purple-400', alert: 'bg-red-400',
}

function ago(ts: string) {
  const s = Math.max(0, (Date.now() - new Date(ts).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [activity, setActivity] = useState<Activity[]>([])
  const [unread, setUnread] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications')
      const j = await res.json()
      setActivity(j.activity ?? []); setUnread(j.unread ?? 0); setLoaded(true)
    } catch { setLoaded(true) }
  }, [])

  useEffect(() => { load() }, [load])

  async function toggle() {
    const next = !open
    setOpen(next)
    if (next) {
      await load()
      // mark seen
      await fetch('/api/admin/notifications', { method: 'POST' }).catch(() => {})
      setUnread(0)
    }
  }

  return (
    <div className="relative">
      <button onClick={toggle} className="relative text-gray-400 hover:text-white p-1" aria-label="Notifications">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        {loaded && unread > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 max-h-[28rem] overflow-y-auto bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl z-50">
            <div className="px-4 py-2.5 border-b border-gray-800 text-sm font-semibold text-white">Activity</div>
            {activity.length === 0 ? (
              <p className="px-4 py-8 text-center text-gray-500 text-sm">No recent activity.</p>
            ) : (
              <ul className="divide-y divide-gray-800/60">
                {activity.map((a, i) => (
                  <li key={i}>
                    <Link href={a.href} onClick={() => setOpen(false)} className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-gray-800/50">
                      <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${KIND_DOT[a.kind] ?? 'bg-gray-500'}`} />
                      <span className="text-gray-200 text-sm leading-snug">{a.title}</span>
                      <span className="text-gray-600 text-[11px] ml-auto shrink-0">{ago(a.ts)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
