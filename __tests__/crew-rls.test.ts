/**
 * Group Sync RLS proof test.
 *
 * Proves with real Supabase clients that:
 *  1. Crew member A CAN read crew-mate B's coarse status rows (the intended surface).
 *  2. A CANNOT read B's orders / order_items / order_documents / customers rows.
 *  3. A CANNOT update B's progress rows.
 *  4. Anon/authenticated clients CANNOT read crew_invites (token vault) at all.
 *
 * Requires live credentials, so it is SKIPPED unless env vars are present:
 *   CREW_RLS_TEST_URL          — Supabase project URL
 *   CREW_RLS_TEST_ANON_KEY     — anon key
 *   CREW_RLS_TEST_SERVICE_KEY  — service-role key (test-user setup/teardown only)
 *
 * Run: CREW_RLS_TEST_URL=... CREW_RLS_TEST_ANON_KEY=... CREW_RLS_TEST_SERVICE_KEY=... npm test
 * NEVER point this at production with real user data you care about — it creates
 * and deletes two throwaway auth users (crew-rls-a/b@test.visitplane.local).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'

const URL_ = process.env.CREW_RLS_TEST_URL
const ANON = process.env.CREW_RLS_TEST_ANON_KEY
const SERVICE = process.env.CREW_RLS_TEST_SERVICE_KEY
const enabled = !!(URL_ && ANON && SERVICE)

const EMAIL_A = 'crew-rls-a@test.visitplane.local'
const EMAIL_B = 'crew-rls-b@test.visitplane.local'
const PASSWORD = 'crew-rls-test-Passw0rd!'

let svc: SupabaseClient
let clientA: SupabaseClient
let clientB: SupabaseClient
let userA: User
let userB: User
let crewId: string

async function ensureUser(email: string): Promise<User> {
  const { data: created, error } = await svc.auth.admin.createUser({
    email, password: PASSWORD, email_confirm: true,
  })
  if (created?.user) return created.user
  // already exists from a previous run — look it up
  if (error) {
    const { data } = await svc.auth.admin.listUsers()
    const existing = data.users.find((u) => u.email === email)
    if (existing) return existing
    throw error
  }
  throw new Error('unreachable')
}

describe.skipIf(!enabled)('Group Sync RLS isolation', () => {
  beforeAll(async () => {
    svc = createClient(URL_!, SERVICE!, { auth: { persistSession: false } })
    userA = await ensureUser(EMAIL_A)
    userB = await ensureUser(EMAIL_B)

    // Crew with both members + one progress row each (service-role setup)
    const { data: crew } = await svc.from('crews')
      .insert({ name: 'RLS Test Crew', destination_name: 'Testland', created_by: userA.id })
      .select('id').single()
    crewId = crew!.id
    await svc.from('crew_invites').insert({ crew_id: crewId })
    await svc.from('crew_members').insert([
      { crew_id: crewId, user_id: userA.id, role: 'leader', display_name: 'A' },
      { crew_id: crewId, user_id: userB.id, role: 'member', display_name: 'B' },
    ])
    await svc.from('crew_member_progress').insert([
      { crew_id: crewId, user_id: userA.id, slot_key: 'passport', slot_label: 'Passport' },
      { crew_id: crewId, user_id: userB.id, slot_key: 'passport', slot_label: 'Passport' },
    ])
    // A private order for B — the thing A must never see
    const { data: customerB } = await svc.from('customers')
      .upsert({ user_id: userB.id, email: EMAIL_B }, { onConflict: 'user_id' })
      .select('id').single()
    await svc.from('orders').insert({
      customer_id: customerB!.id, contact_email: EMAIL_B, internal_notes: 'rls-test-order-b',
    })

    clientA = createClient(URL_!, ANON!, { auth: { persistSession: false } })
    clientB = createClient(URL_!, ANON!, { auth: { persistSession: false } })
    const a = await clientA.auth.signInWithPassword({ email: EMAIL_A, password: PASSWORD })
    const b = await clientB.auth.signInWithPassword({ email: EMAIL_B, password: PASSWORD })
    if (a.error || b.error) throw a.error ?? b.error
  }, 30_000)

  afterAll(async () => {
    if (!svc) return
    if (crewId) await svc.from('crews').delete().eq('id', crewId)
    // remove B's throwaway order then the users
    const { data: cB } = await svc.from('customers').select('id').eq('user_id', userB.id).maybeSingle()
    if (cB) await svc.from('orders').delete().eq('customer_id', cB.id).eq('internal_notes', 'rls-test-order-b')
    await svc.auth.admin.deleteUser(userA.id)
    await svc.auth.admin.deleteUser(userB.id)
  }, 30_000)

  it('member A CAN read crew-mate B coarse status (the intended surface)', async () => {
    const { data, error } = await clientA
      .from('crew_member_progress')
      .select('user_id, slot_key, status')
      .eq('crew_id', crewId)
      .eq('user_id', userB.id)
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(Object.keys(data![0]).sort()).toEqual(['slot_key', 'status', 'user_id'])
  })

  it('member A CANNOT read B orders (zero rows, not an error — RLS filters)', async () => {
    const { data } = await clientA.from('orders').select('id')
    expect(data ?? []).toHaveLength(0)
  })

  it('member A CANNOT read B order_items / order_documents / customers', async () => {
    const [items, docs, customers] = await Promise.all([
      clientA.from('order_items').select('id'),
      clientA.from('order_documents').select('id'),
      clientA.from('customers').select('id').eq('user_id', userB.id),
    ])
    expect(items.data ?? []).toHaveLength(0)
    expect(docs.data ?? []).toHaveLength(0)
    expect(customers.data ?? []).toHaveLength(0)
  })

  it('member A CANNOT update B progress rows (0 rows affected)', async () => {
    const { data } = await clientA
      .from('crew_member_progress')
      .update({ status: 'ready' })
      .eq('crew_id', crewId)
      .eq('user_id', userB.id)
      .select('id')
    expect(data ?? []).toHaveLength(0)

    // and B's row is untouched
    const { data: check } = await svc
      .from('crew_member_progress')
      .select('status')
      .eq('crew_id', crewId)
      .eq('user_id', userB.id)
      .single()
    expect(check!.status).toBe('not_started')
  })

  it('authenticated clients CANNOT read the crew_invites token vault', async () => {
    const { data } = await clientA.from('crew_invites').select('token').eq('crew_id', crewId)
    expect(data ?? []).toHaveLength(0)
  })

  it('member A CAN update their OWN progress', async () => {
    const { data, error } = await clientA
      .from('crew_member_progress')
      .update({ status: 'ready' })
      .eq('crew_id', crewId)
      .eq('user_id', userA.id)
      .select('status')
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data![0].status).toBe('ready')
  })
})
