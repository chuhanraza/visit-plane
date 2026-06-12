'use client'
import { useState, useEffect } from 'react'

interface UserCountry {
  countryCode: string
  countryName: string
  loading: boolean
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

    // Fetch from our geo API — abort after 4 s to prevent infinite "Detecting..."
    const controller = new AbortController()
    const timeoutId = setTimeout(() => {
      controller.abort()
      setData({ countryCode: 'PK', countryName: 'Pakistan', loading: false })
    }, 4000)

    fetch('/api/geo', { signal: controller.signal })
      .then((r) => r.json())
      .then((result) => {
        clearTimeout(timeoutId)
        const countryData = {
          countryCode: result.countryCode,
          countryName: result.countryName,
          timestamp: Date.now(),
        }
        try {
          localStorage.setItem('userCountry', JSON.stringify(countryData))
        } catch {
          // ignore
        }
        setData({ countryCode: countryData.countryCode, countryName: countryData.countryName, loading: false })
      })
      .catch((err) => {
        clearTimeout(timeoutId)
        if (err?.name !== 'AbortError') {
          setData({ countryCode: 'PK', countryName: 'Pakistan', loading: false })
        }
      })

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  return data
}
