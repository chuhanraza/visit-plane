import { Suspense } from 'react'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSessionUser } from '@/lib/supabase/server'
import PortalAuthForm from '../components/PortalAuthForm'

export const metadata: Metadata = { title: 'Sign in — VisitPlane Portal', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function PortalLoginPage() {
  const user = await getSessionUser()
  if (user) redirect('/portal')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Suspense>
        <PortalAuthForm />
      </Suspense>
    </div>
  )
}
