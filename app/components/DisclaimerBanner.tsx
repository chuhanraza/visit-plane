'use client'

import { useState, useEffect } from 'react'

export default function DisclaimerBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Re-show if user hasn't dismissed in this session
    const dismissed = sessionStorage.getItem('disclaimer-dismissed')
    if (!dismissed) setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem('disclaimer-dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="relative z-50 bg-amber-50 border-b border-amber-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5 text-sm text-amber-900">
          <span className="shrink-0 text-base leading-none">⚠️</span>
          <p>
            <span className="font-semibold">Estimated data.</span>{' '}
            Always verify visa requirements with official embassy or consulate sources before traveling.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss disclaimer"
          className="shrink-0 rounded-lg p-1 text-amber-600 transition hover:bg-amber-100 hover:text-amber-900"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
