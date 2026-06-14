'use client'
import { useState, useEffect } from 'react'

interface UserCountry {
  countryCode: string
  countryName: string
  loading: boolean
}

// Resolve a sensible passport when geo detection times out or fails:
//  (a) the user's previously chosen passport, persisted under 'visitplane_passport'
//  (b) otherwise default to the United States
function resolveFallback(): { countryCode: string; countryName: string } {
  try {
    const saved = localStorage.getItem('visitplane_passport')
    if (saved && saved.trim()) {
      return { countryCode: '', countryName: saved }
    }
  } catch {
    // ignore localStorage errors
  }
  return { countryCode: 'US', countryName: 'United States' }
}

export function useUserCountry(): UserCountry {
  const [data, setData] = useState<UserCountry>({
    countryCode: '',
    countryName: '',
    loading: true,
  })

  useEffect(() => {
    // Check localStorage cache first (avoid repeated API calls)
    try {
      const cached = localStorage.getItem('userCountry')
      if (cached) {
        const parsed = JSON.parse(cached)
        // Cache for 24 hours
        if (Date.now() - parsed.timestamp < 86400000) {
          setData({ countryCode: parsed.countryCode, countryName: parsed.countryName, loading: false })
          return
        }
      }
    } catch {
      // ignore localStorage errors
    }

    // Fetch from our geo API — abort after 2 s so "🌍 Detecting…" can never stick.
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      const fb = resolveFallback()
      setData({ ...fb, loading: false })
    }, 2000)

    fetch('/api/geo', { signal: controller.signal })
      .then((r) => r.json())
      .then((result) => {
        clearTimeout(timeoutId)
        if (!result?.countryName) {
          // API responded but with nothing usable → fall back.
          const fb = resolveFallback()
          setData({ ...fb, loading: false })
          return
        }
        const countryData = {
          countryCode: result.countryCode,
          countryName: result.countryName,
          timestamp: Date.now(),
        }
        try {
          localStorage.setItem('userCountry', JSON.stringify(countryData))
          localStorage.setItem('visitplane_passport', result.countryName)
        } catch {
          // ignore
        }
        setData({ countryCode: countryData.countryCode, countryName: countryData.countryName, loading: false })
      })
      .catch((err) => {
        clearTimeout(timeoutId)
        if (err?.name !== 'AbortError') {
          const fb = resolveFallback()
          setData({ ...fb, loading: false })
        }
      })

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  return data
}
