'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Code-split the exit-intent modal (it pulls framer-motion) out of the shared
// layout bundle. Mounted in the root layout, it was shipping framer-motion in
// the critical JS of EVERY page — including server-rendered visa/blog pages
// that use no animation. ssr:false is safe: the modal is invisible until an
// exit-intent/timeout fires, so there is nothing to server-render.
const ExitIntentModal = dynamic(() => import('@/components/ExitIntentModal'), {
  ssr: false,
})

export default function LazyExitIntent() {
  const [ready, setReady] = useState(false)

  // Wait until well after LCP before even downloading the chunk — on slow 3G
  // (most of our mobile traffic) every early byte competes with the hero image.
  // The modal itself only ever appears on exit intent or a long-dwell timer,
  // so a 6s download delay is invisible to users.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 6000)
    return () => clearTimeout(t)
  }, [])

  if (!ready) return null
  return <ExitIntentModal />
}
