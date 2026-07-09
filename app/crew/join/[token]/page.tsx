import type { Metadata } from 'next'
import Link from 'next/link'
import { getSessionUser, getSupabaseServerClient } from '@/lib/supabase/server'
import { lookupInvite } from '@/lib/crew/service'
import { CREW_PRIVACY_NOTICE } from '@/lib/crew/types'
import JoinForm from './JoinForm'

export const metadata: Metadata = { title: 'Join a crew — VisitPlane', robots: { index: false } }
export const dynamic = 'force-dynamic'

/**
 * Public invite landing. Server-side token lookup returns ONLY
 * {name, destination, member count, leader first name} — crew tables have no
 * anon RLS policies, so nothing else is reachable from the browser.
 */
export default async function JoinPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params
  const invite = await lookupInvite(token)

  if (!invite.ok) {
    const message =
      invite.reason === 'expired'
        ? 'This invite link has expired. Ask the person who invited you to send a fresh one.'
        : invite.reason === 'full'
          ? 'This crew is already full.'
          : 'This invite link is not valid. Check that the full link was copied.'
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-3xl mb-3">🔗</div>
          <h1 className="text-lg font-bold text-gray-900 mb-1">Can&apos;t open this invite</h1>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-xl px-5 py-3">
            Go to VisitPlane
          </Link>
        </div>
      </div>
    )
  }

  const user = await getSessionUser()

  // Already a member? Straight to the dashboard link (idempotent join also
  // handles this server-side; this just improves the UX).
  let alreadyMember = false
  if (user) {
    const supabase = await getSupabaseServerClient()
    const { data } = await supabase
      .from('crew_members')
      .select('id')
      .eq('crew_id', invite.crewId)
      .eq('user_id', user.id)
      .maybeSingle()
    alreadyMember = !!data
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-3xl mb-3">🧳</div>
          <h1 className="text-xl font-bold text-gray-900">
            {invite.leaderName} invited you to join
          </h1>
          <p className="text-2xl font-bold text-blue-600 mt-1 break-words">{invite.name}</p>
          <p className="text-sm text-gray-500 mt-2">
            Trip to <span className="font-medium text-gray-700">{invite.destinationName}</span>
            {' · '}{invite.memberCount} member{invite.memberCount === 1 ? '' : 's'} so far
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Before you join</h2>
          <p className="text-xs text-gray-600 leading-relaxed">{CREW_PRIVACY_NOTICE}</p>
        </div>

        <JoinForm token={token} signedIn={!!user} alreadyMember={alreadyMember} crewId={invite.crewId} />
      </div>
    </div>
  )
}
