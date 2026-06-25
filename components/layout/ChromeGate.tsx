'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Hides public site chrome (header / footer / command palette) on /admin routes,
 * where the operator admin shell provides its own header + palette. Prevents the
 * public and admin headers from doubling up.
 */
export default function ChromeGate({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) return null
  return <>{children}</>
}
