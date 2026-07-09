import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getSessionUser, getSupabaseServerClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rateLimit'
import { createCrew, defaultDisplayName } from '@/lib/crew/service'

export const dynamic = 'force-dynamic'

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  destinationName: z.string().trim().min(1).max(80),
  destinationIso: z.string().trim().length(2).toUpperCase().optional().nullable(),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
})

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  if (!rateLimit(`crew-create:${user.id}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests — try again shortly' }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Please fill in a crew name and destination.' }, { status: 422 })

  // Display name from the user's own profile (RLS-scoped read), first name only.
  const supabase = await getSupabaseServerClient()
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle()

  const result = await createCrew({
    userId: user.id,
    displayName: defaultDisplayName(profile?.full_name ?? null, user.email ?? ''),
    name: parsed.data.name,
    destinationIso: parsed.data.destinationIso ?? null,
    destinationName: parsed.data.destinationName,
    travelDate: parsed.data.travelDate ?? null,
  })

  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ id: result.crewId }, { status: 201 })
}
