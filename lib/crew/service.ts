/**
 * Group Sync server-side operations.
 *
 * The service client is used ONLY where pure RLS cannot express the rule
 * (token vault reads/writes, join-by-token) — always behind explicit checks,
 * mirroring the codebase's established privileged-ops pattern. Everything a
 * member does day-to-day (dashboard reads, own status toggles, leaving)
 * rides the RLS-scoped session client instead.
 *
 * SERVER-ONLY — imports lib/supabase/admin.
 */
import { getServiceClient } from '@/lib/supabase/admin'
import { writeAudit } from '@/lib/audit'
import { resolveSlotsForDestination } from './slots'
import type { CrewSlot } from './types'

export const MAX_ACTIVE_CREWS_PER_USER = 5
export const INVITE_TTL_DAYS = 30

const SITE_ORIGIN = 'https://www.visitplane.com'

export function crewJoinUrl(token: string, origin?: string): string {
  return `${origin || SITE_ORIGIN}/crew/join/${token}`
}

/** First word of a full name (never expose full names/emails by default). */
export function defaultDisplayName(fullName: string | null, email: string): string {
  const first = (fullName ?? '').trim().split(/\s+/)[0]
  if (first) return first.slice(0, 60)
  // fall back to the email local part BEFORE any dot/plus — still not the address
  const local = email.split('@')[0]?.split(/[.+]/)[0] ?? 'Traveler'
  return (local || 'Traveler').slice(0, 60)
}

interface CreateCrewInput {
  userId: string
  displayName: string
  name: string
  destinationIso: string | null
  destinationName: string
  travelDate: string | null
}

export async function createCrew(input: CreateCrewInput): Promise<
  { ok: true; crewId: string } | { ok: false; status: number; error: string }
> {
  const svc = getServiceClient()

  // Per-user active-crew cap (abuse guard)
  const { count } = await svc
    .from('crews')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', input.userId)
  if ((count ?? 0) >= MAX_ACTIVE_CREWS_PER_USER) {
    return { ok: false, status: 422, error: `You can have at most ${MAX_ACTIVE_CREWS_PER_USER} crews. Delete one to create another.` }
  }

  const { data: crew, error: crewErr } = await svc
    .from('crews')
    .insert({
      name: input.name,
      destination_iso: input.destinationIso,
      destination_name: input.destinationName,
      travel_date: input.travelDate,
      created_by: input.userId,
    })
    .select('id')
    .single()
  if (crewErr || !crew) return { ok: false, status: 500, error: 'Could not create the crew. Please try again.' }

  const { error: memberErr } = await svc.from('crew_members').insert({
    crew_id: crew.id,
    user_id: input.userId,
    role: 'leader',
    display_name: input.displayName,
  })
  if (memberErr) {
    await svc.from('crews').delete().eq('id', crew.id)
    return { ok: false, status: 500, error: 'Could not create the crew. Please try again.' }
  }

  // Token row (vault table — service-role only) relies on column defaults.
  const { error: inviteErr } = await svc.from('crew_invites').insert({ crew_id: crew.id })
  if (inviteErr) {
    await svc.from('crews').delete().eq('id', crew.id) // cascades members
    return { ok: false, status: 500, error: 'Could not create the crew. Please try again.' }
  }

  const slots = await resolveSlotsForDestination(svc, input.destinationIso, input.destinationName)
  await seedProgress(crew.id, input.userId, slots)

  await writeAudit({
    actor: `customer:${input.userId}`, actorType: 'customer',
    action: 'crew.created', entityType: 'crew', entityId: crew.id,
    metadata: { destination: input.destinationName },
  })

  return { ok: true, crewId: crew.id }
}

async function seedProgress(crewId: string, userId: string, slots: CrewSlot[]): Promise<void> {
  const svc = getServiceClient()
  await svc.from('crew_member_progress').upsert(
    slots.map((s) => ({
      crew_id: crewId,
      user_id: userId,
      slot_key: s.key,
      slot_label: s.label,
    })),
    { onConflict: 'crew_id,user_id,slot_key', ignoreDuplicates: true },
  )
}

/** Public-safe invite lookup for the join landing page. Returns minimal info only. */
export async function lookupInvite(token: string): Promise<
  | { ok: true; crewId: string; name: string; destinationName: string; memberCount: number; maxMembers: number; leaderName: string }
  | { ok: false; reason: 'invalid' | 'expired' | 'full' }
> {
  if (!/^[0-9a-f]{64}$/.test(token)) return { ok: false, reason: 'invalid' }
  const svc = getServiceClient()

  const { data: invite } = await svc
    .from('crew_invites')
    .select('crew_id, expires_at')
    .eq('token', token)
    .maybeSingle()
  if (!invite) return { ok: false, reason: 'invalid' }
  if (new Date(invite.expires_at).getTime() < Date.now()) return { ok: false, reason: 'expired' }

  const [{ data: crew }, { count }, { data: leader }] = await Promise.all([
    svc.from('crews').select('id, name, destination_name, max_members').eq('id', invite.crew_id).maybeSingle(),
    svc.from('crew_members').select('id', { count: 'exact', head: true }).eq('crew_id', invite.crew_id),
    svc.from('crew_members').select('display_name').eq('crew_id', invite.crew_id).eq('role', 'leader').maybeSingle(),
  ])
  if (!crew) return { ok: false, reason: 'invalid' }
  const memberCount = count ?? 0
  if (memberCount >= crew.max_members) return { ok: false, reason: 'full' }

  return {
    ok: true,
    crewId: crew.id,
    name: crew.name,
    destinationName: crew.destination_name,
    memberCount,
    maxMembers: crew.max_members,
    leaderName: leader?.display_name ?? 'A traveler',
  }
}

export async function joinCrew(token: string, userId: string, displayName: string): Promise<
  { ok: true; crewId: string } | { ok: false; status: number; error: string }
> {
  const invite = await lookupInvite(token)
  if (!invite.ok) {
    const msg = invite.reason === 'expired' ? 'This invite link has expired — ask the crew leader for a new one.'
      : invite.reason === 'full' ? 'This crew is full.'
      : 'This invite link is not valid.'
    return { ok: false, status: 404, error: msg }
  }

  const svc = getServiceClient()
  const { data: existing } = await svc
    .from('crew_members')
    .select('id')
    .eq('crew_id', invite.crewId)
    .eq('user_id', userId)
    .maybeSingle()
  if (existing) return { ok: true, crewId: invite.crewId } // already in — idempotent

  const { error: joinErr } = await svc.from('crew_members').insert({
    crew_id: invite.crewId,
    user_id: userId,
    role: 'member',
    display_name: displayName,
  })
  if (joinErr) return { ok: false, status: 500, error: 'Could not join the crew. Please try again.' }

  const { data: crew } = await svc
    .from('crews')
    .select('destination_iso, destination_name')
    .eq('id', invite.crewId)
    .maybeSingle()
  const slots = await resolveSlotsForDestination(svc, crew?.destination_iso ?? null, crew?.destination_name ?? '')
  await seedProgress(invite.crewId, userId, slots)

  await writeAudit({
    actor: `customer:${userId}`, actorType: 'customer',
    action: 'crew.member_joined', entityType: 'crew', entityId: invite.crewId,
    metadata: {},
  })

  return { ok: true, crewId: invite.crewId }
}

/** Leader-only: fetch the share link. Caller MUST have verified leadership. */
export async function getInviteForLeader(crewId: string): Promise<{ url: string; expiresAt: string } | null> {
  const svc = getServiceClient()
  const { data } = await svc
    .from('crew_invites')
    .select('token, expires_at')
    .eq('crew_id', crewId)
    .maybeSingle()
  if (!data) return null
  return { url: crewJoinUrl(data.token), expiresAt: data.expires_at }
}

/** Leader-only: rotate the token (invalidates every previously shared link). */
export async function rotateInvite(crewId: string, userId: string): Promise<{ url: string; expiresAt: string } | null> {
  const svc = getServiceClient()
  const newToken = (crypto.randomUUID() + crypto.randomUUID()).replaceAll('-', '')
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86400_000).toISOString()
  const { data, error } = await svc
    .from('crew_invites')
    .update({ token: newToken, expires_at: expiresAt, rotated_at: new Date().toISOString() })
    .eq('crew_id', crewId)
    .select('token, expires_at')
    .maybeSingle()
  if (error || !data) return null

  await writeAudit({
    actor: `customer:${userId}`, actorType: 'customer',
    action: 'crew.invite_rotated', entityType: 'crew', entityId: crewId,
    metadata: {},
  })
  return { url: crewJoinUrl(data.token), expiresAt: data.expires_at }
}

/**
 * Advance the uploader's own crew status when they upload/receive review on a
 * document in THEIR OWN order. Carries only the status word into crew tables.
 * Never downgrades an approved slot on re-upload of a rejected one.
 */
export async function syncProgressFromDocument(
  userId: string,
  docType: string,
  status: 'uploaded' | 'approved' | 'rejected',
): Promise<void> {
  try {
    const { docTypeToSlotKey } = await import('./slots')
    const slotKey = docTypeToSlotKey(docType)
    const svc = getServiceClient()

    let query = svc
      .from('crew_member_progress')
      .update({ status })
      .eq('user_id', userId)
      .eq('slot_key', slotKey)
    // an upload never downgrades an already-approved slot
    if (status === 'uploaded') query = query.neq('status', 'approved')
    await query
  } catch {
    // Crew sync is best-effort — a failure here must never break the upload.
  }
}

/**
 * Order-scoped variant for the document routes: resolves the ORDER OWNER
 * (not the acting user — admins can upload/review on a customer's behalf)
 * and advances that member's crew status.
 */
export async function syncProgressForOrderDocument(
  orderId: string,
  docType: string,
  status: 'uploaded' | 'approved' | 'rejected',
): Promise<void> {
  try {
    const svc = getServiceClient()
    const { data: order } = await svc
      .from('orders')
      .select('customers!inner(user_id)')
      .eq('id', orderId)
      .maybeSingle()
    const ownerUserId = (order as { customers?: { user_id?: string | null } } | null)?.customers?.user_id
    if (!ownerUserId) return
    await syncProgressFromDocument(ownerUserId, docType, status)
  } catch {
    // best-effort, never break the calling route
  }
}
