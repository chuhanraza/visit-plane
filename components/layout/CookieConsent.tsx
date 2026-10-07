'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CONSENT_KEY as KEY } from '@/lib/consent'

type Choice = 'granted' | 'denied'

function pushConsent(choice: Choice) {
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  // Consent Mode v2 update — GTM reads this from dataLayer.
  w.dataLayer.push(['consent', 'update', {
    analytics_storage: choice,
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
  }])
}

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch {
      setShow(true)
    }
  }, [])

  function choose(choice: Choice) {
    try { localStorage.setItem(KEY, choice) } catch { /* ignore */ }
    pushConsent(choice)
    setShow(false)
  }

  if (!show) return null
  return (
    <div role="dialog" aria-label="Cookie consent" className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-200 bg-white p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-700">
          We use analytics cookies to see which pages are useful. They stay off unless you accept.{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose('denied')} className="min-h-[44px] rounded-lg border border-gray-300 px-4 text-sm font-semibold text-gray-800">Reject</button>
          <button type="button" onClick={() => choose('granted')} className="min-h-[44px] rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white">Accept</button>
        </div>
      </div>
    </div>
  )
}
