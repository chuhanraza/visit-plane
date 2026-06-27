'use client'

/**
 * FunnelBeacon — fires a single anonymous page.view to /api/track on each money
 * page (visa, seo, visa-data, wizard, itinerary-generator, blog). Privacy-first:
 * respects Do-Not-Track / Global Privacy Control client-side, sends no PII, and
 * uses keepalive so it never blocks navigation or hurts performance.
 */
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const MONEY_PAGE_RE = /^\/(visa\/|seo\/|visa-data|wizard|itinerary-generator|blog\/)/

function dntEnabled(): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { msDoNotTrack?: string; globalPrivacyControl?: boolean }
  const win = window as Window & { doNotTrack?: string }
  return nav.doNotTrack === '1' || win.doNotTrack === '1' || nav.msDoNotTrack === '1' || nav.globalPrivacyControl === true
}

export default function FunnelBeacon() {
  const pathname = usePathname()
  const lastSent = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname || !MONEY_PAGE_RE.test(pathname)) return
    if (dntEnabled()) return
    if (lastSent.current === pathname) return // guard StrictMode double-mount + same-path
    lastSent.current = pathname

    try {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'page.view', page: pathname }),
        keepalive: true,
        credentials: 'same-origin',
      }).catch(() => {})
    } catch {
      /* never throw from analytics */
    }
  }, [pathname])

  return null
}
