/**
 * POST /api/push/send-visa-alert
 * Admin / cron endpoint — sends push notifications to subscribed users.
 *
 * ⚠️ WARNING: Protected by x-admin-secret header.
 *    Set ADMIN_SECRET in .env.local (never commit it).
 *
 * Body: { country, changeType, title, body, url, image? }
 *
 * Install: npm install web-push @types/web-push
 */

import { NextRequest, NextResponse } from 'next/server';
import webPush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// ⚠️ WARNING: VAPID keys from env only — never hardcode
webPush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function POST(req: NextRequest) {
  // ⚠️ Auth check — reject requests without the admin secret
  if (req.headers.get('x-admin-secret') !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { country, changeType, title, body: msgBody, url, image } = await req.json() as {
    country?: string; changeType?: string;
    title: string;   body: string;
    url?: string;    image?: string;
  };

  if (!title || !msgBody) {
    return NextResponse.json({ error: 'title and body required' }, { status: 400 });
  }

  const supabase = getSupabase();

  // Fetch matching subscriptions — filter by country if specified
  let query = supabase.from('push_subscriptions').select('*').eq('is_active', true);
  if (country) query = query.or(`country.eq.${country},country.is.null`);

  const { data: subs, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subs?.length) return NextResponse.json({ success: true, sent: 0 });

  const payload = JSON.stringify({ title, body: msgBody, url: url ?? '/', image, country, changeType, sentAt: new Date().toISOString() });
  const stale: string[] = [];
  const results = { sent: 0, failed: 0, stale: 0 };

  // Process in batches of 50
  for (let i = 0; i < subs.length; i += 50) {
    await Promise.allSettled(
      subs.slice(i, i + 50).map(async (sub) => {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload,
            { TTL: 24 * 3600, urgency: 'normal', topic: `visa-${country ?? 'general'}` }
          );
          results.sent++;
          await supabase.from('push_subscriptions').update({ last_sent_at: new Date().toISOString() }).eq('endpoint', sub.endpoint);
        } catch (e: any) {
          if (e.statusCode === 410 || e.statusCode === 404) {
            stale.push(sub.endpoint); results.stale++;
          } else {
            results.failed++;
          }
        }
      })
    );
  }

  // Clean up stale subscriptions
  if (stale.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', stale);
  }

  return NextResponse.json({ success: true, results });
}
