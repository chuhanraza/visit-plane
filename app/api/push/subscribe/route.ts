/**
 * POST   /api/push/subscribe  — store a new push subscription
 * DELETE /api/push/subscribe  — remove a subscription
 * PATCH  /api/push/subscribe  — update country interest
 *
 * Storage: Supabase table `push_subscriptions`
 *
 * Run this SQL once in your Supabase SQL editor:
 * ──────────────────────────────────────────────
 * CREATE TABLE IF NOT EXISTS push_subscriptions (
 *   id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   endpoint     text NOT NULL UNIQUE,
 *   p256dh       text NOT NULL,
 *   auth         text NOT NULL,
 *   user_id      text,
 *   country      text,
 *   subscribed_at timestamptz DEFAULT now(),
 *   last_sent_at  timestamptz,
 *   is_active    boolean DEFAULT true
 * );
 * CREATE INDEX IF NOT EXISTS idx_push_country ON push_subscriptions(country);
 * ──────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, clientKey } from '@/lib/rateLimit'
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Use service role key to bypass RLS for server-side writes
    // ⚠️ WARNING: Never expose SUPABASE_SERVICE_ROLE_KEY to the browser
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ── POST — store subscription ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // Unauthenticated insert — cap the spam surface.
    if (!rateLimit(clientKey(req, 'push-subscribe'), 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many attempts' }, { status: 429 });
    }

    const body = await req.json();
    const { subscription, country, userId } = body as {
      subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
      country?: string;
      userId?: string;
    };

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const supabase = getSupabase();

    // Upsert — handles re-subscription after user grants permission again
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        {
          endpoint:      subscription.endpoint,
          p256dh:        subscription.keys.p256dh,
          auth:          subscription.keys.auth,
          user_id:       userId  ?? null,
          country:       country ?? null,
          is_active:     true,
        },
        { onConflict: 'endpoint' }
      );

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('[Push subscribe]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ── DELETE — remove subscription ──────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const { endpoint } = await req.json() as { endpoint: string };
    if (!endpoint) return NextResponse.json({ error: 'endpoint required' }, { status: 400 });

    const supabase = getSupabase();
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Push unsubscribe]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ── PATCH — update country interest ───────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const { endpoint, country } = await req.json() as { endpoint: string; country: string };
    const supabase = getSupabase();
    await supabase.from('push_subscriptions').update({ country }).eq('endpoint', endpoint);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Push patch]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
