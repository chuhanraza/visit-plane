import Link from 'next/link'
import type { Metadata } from 'next'
import { requireCustomer } from '@/lib/portal/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { COMPLETE_STATUSES } from '@/lib/crew/types'
import CreateCrewForm from './CreateCrewForm'

export const metadata: Metadata = { title: 'My crews — VisitPlane', robots: { index: false } }
export const dynamic = 'force-dynamic'

export default async function CrewListPage() {
  const { userId } = await requireCustomer()
  const supabase = await getSupabaseServerClient()

  // RLS: memberships return only the caller's rows; crews only ones they belong to.
  const { data: memberships } = await supabase
    .from('crew_members')
    .select('crew_id, role')
    .eq('user_id', userId)

  const crewIds = (memberships ?? []).map((m) => m.crew_id)
  const roleByCrew = new Map((memberships ?? []).map((m) => [m.crew_id, m.role]))

  const [{ data: crews }, { data: allMembers }, { data: progress }] = await Promise.all([
    crewIds.length
      ? supabase.from('crews').select('id, name, destination_name, travel_date, created_at').in('id', crewIds).order('created_at', { ascending: false })
      : Promise.resolve({ data: [] as { id: string; name: string; destination_name: string; travel_date: string | null; created_at: string }[] }),
    crewIds.length
      ? supabase.from('crew_members').select('crew_id, user_id')
      : Promise.resolve({ data: [] as { crew_id: string; user_id: string }[] }),
    crewIds.length
      ? supabase.from('crew_member_progress').select('crew_id, user_id, status')
      : Promise.resolve({ data: [] as { crew_id: string; user_id: string; status: string }[] }),
  ])

  const list = (crews ?? []).map((c) => {
    const members = (allMembers ?? []).filter((m) => m.crew_id === c.id)
    const rows = (progress ?? []).filter((p) => p.crew_id === c.id)
    const done = rows.filter((p) => COMPLETE_STATUSES.includes(p.status as never)).length
    return { ...c, memberCount: members.length, done, total: rows.length, role: roleByCrew.get(c.id) }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-gray-900">My crews</h1>
          <Link href="/portal" className="text-sm text-gray-500 hover:text-gray-900">← Portal</Link>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Plan a group trip together — everyone tracks their own documents, the crew sees simple readiness ticks.
        </p>

        {list.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100 mb-8">
            {list.map((c) => (
              <Link key={c.id} href={`/crew/${c.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {c.name}
                    {c.role === 'leader' && (
                      <span className="ml-2 text-[10px] uppercase tracking-wide bg-blue-50 text-blue-700 rounded-full px-2 py-0.5">Leader</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {c.destination_name}
                    {c.travel_date ? ` · ${new Date(c.travel_date).toLocaleDateString()}` : ''}
                    {` · ${c.memberCount} member${c.memberCount === 1 ? '' : 's'}`}
                  </div>
                </div>
                <div className="text-sm text-gray-600 shrink-0 ml-4">
                  {c.total > 0 ? `${c.done}/${c.total} ready` : '—'}
                </div>
              </Link>
            ))}
          </div>
        )}

        <CreateCrewForm hasCrews={list.length > 0} />
      </div>
    </div>
  )
}
