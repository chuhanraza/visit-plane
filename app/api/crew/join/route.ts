import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser, getSupabaseServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { joinCrew, defaultDisplayName } from '@/lib/crew/service'

export const dynamic = 'force-dynamic'

const JoinSchema = z.object({
  token: z.string().regex(/^[0-9a-f]{64}$/),
  // Consent is explicit: the checkbox value must arrive as literal true.
  consent: z.literal(true),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!rateLimit(`crew-join:${user.id}`, 10, 60_000) || !rateLimit(`crew-join-ip:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: 'Too many attempts — try again shortly' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const parsed = JoinSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please accept the status-sharing notice to join.' }, { status: 422 })
  }

  const supabase = await getSupabaseServerClient()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()

  const result = await joinCrew(
    parsed.data.token,
    user.id,
    defaultDisplayName(profile?.full_name ?? null, user.email ?? ''),
  )
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ id: result.crewId })
}
