import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { requireCustomer } from '@/lib/portal/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getInviteForLeader } from '@/lib/crew/service'
import {
  COMPLETE_STATUSES, CREW_PRIVACY_NOTICE, STATUS_META,
  type SlotStatus, type CrewRole,
} from '@/lib/crew/types'
import ShareBlock from './ShareBlock'
import OwnSlotChip from './OwnSlotChip'
import CrewActions from './CrewActions'

export const metadata: Metadata = { title: 'Crew — VisitPlane', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function CrewDashboardPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const { userId } = await requireCustomer()
  const supabase = await getSupabaseServerClient()

  // RLS: non-members get zero rows here → 404. Explicit columns only.
  const { data: crew } = await supabase
    .from('crews')
    .select('id, name, destination_name, travel_date, max_members, created_at')
    .eq('id', id)
    .maybeSingle()
  if (!crew) notFound()

  const [{ data: members }, { data: progress }] = await Promise.all([
    supabase
      .from('crew_members')
      .select('user_id, role, display_name, joined_at')
      .eq('crew_id', id)
      .order('joined_at', { ascending: true }),
    supabase
      .from('crew_member_progress')
      .select('user_id, slot_key, slot_label, status')
      .eq('crew_id', id),
  ])

  const me = (members ?? []).find((m) => m.user_id === userId)
  if (!me) notFound()
  const isLeader = me.role === 'leader'

  // Invite link: leader-only (leadership just verified via RLS-scoped read).
  const invite = isLeader ? await getInviteForLeader(id) : null

  const memberCards = (members ?? []).map((m) => {
    const rows = (progress ?? [])
      .filter((p) => p.user_id === m.user_id)
      .sort((a, b) => a.slot_key.localeCompare(b.slot_key))
    const done = rows.filter((p) => COMPLETE_STATUSES.includes(p.status as SlotStatus)).length
    return { ...m, role: m.role as CrewRole, rows, done, total: rows.length }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h1 className="text-2xl font-bold text-gray-900 min-w-0 break-words">{crew.name}</h1>
          <Link href="/crew" className="text-sm text-gray-500 hover:text-gray-900 shrink-0 py-1">← My crews</Link>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          {crew.destination_name}
          {crew.travel_date ? ` · ${new Date(crew.travel_date).toLocaleDateString()}` : ''}
          {` · ${memberCards.length}/${crew.max_members} members`}
        </p>

        {isLeader && invite && (
          <ShareBlock crewId={crew.id} crewName={crew.name} destination={crew.destination_name}
            inviteUrl={invite.url} expiresAt={invite.expiresAt} />
        )}

        <div className="space-y-4 mt-6">
          {memberCards.map((m) => {
            const isMe = m.user_id === userId
            return (
              <div key={m.user_id}
                className={`bg-white border rounded-2xl p-5 ${isMe ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-gray-900 truncate">{m.display_name}</span>
                    {isMe && <span className="text-[10px] uppercase tracking-wide bg-blue-50 text-blue-700 rounded-full px-2 py-0.5 shrink-0">You</span>}
                    {m.role === 'leader' && <span className="text-[10px] uppercase tracking-wide bg-amber-50 text-amber-700 rounded-full px-2 py-0.5 shrink-0">Leader</span>}
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ${m.done === m.total && m.total > 0 ? 'text-emerald-600' : 'text-gray-600'}`}>
                    {m.total > 0 ? `${m.done}/${m.total} ready` : 'No checklist'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {m.rows.map((row) =>
                    isMe ? (
                      <OwnSlotChip key={row.slot_key} crewId={crew.id}
                        slotKey={row.slot_key} slotLabel={row.slot_label}
                        status={row.status as SlotStatus} />
                    ) : (
                      <span key={row.slot_key}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${STATUS_META[row.status as SlotStatus].chip}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[row.status as SlotStatus].dot}`} />
                        {row.slot_label}
                      </span>
                    ),
                  )}
                </div>

                {isMe && (
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-gray-400">Tap an item to mark it ready.</p>
                    <Link href="/order"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-500 min-h-[44px] inline-flex items-center">
                      Get help with your visa →
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <CrewActions crewId={crew.id} userId={userId} isLeader={isLeader}
          removableMembers={isLeader
            ? memberCards.filter((m) => m.user_id !== userId).map((m) => ({ userId: m.user_id, name: m.display_name }))
            : []} />

        <p className="mt-8 text-[11px] text-gray-400 leading-relaxed border-t border-gray-200 pt-4">
          {CREW_PRIVACY_NOTICE}
        </p>
      </div>
    </div>
  )
}
