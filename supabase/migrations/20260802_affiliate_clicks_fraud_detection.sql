-- Distributed bot campaign detected 2026-08-02: ~1,000 rotating IPs, ~49 rotating
-- browser UAs, SG/HK-heavy geo, hammering /go/wayaway and /go/safetywing since
-- 2026-07-31 18:00 UTC at ~48x the prior organic rate (216/day baseline vs
-- ~10,500/day during the campaign), still ongoing. All rows logged as
-- is_bot=false -- the existing UA-regex bot check (BOT_UA_RE) doesn't catch
-- rotating real-looking UAs. Additive only, fully reversible (flag, not delete).

ALTER TABLE public.affiliate_clicks
  ADD COLUMN IF NOT EXISTS is_suspected_fraud boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS fraud_reason text;

CREATE INDEX IF NOT EXISTS affiliate_clicks_is_suspected_fraud_idx
  ON public.affiliate_clicks (is_suspected_fraud);

-- Supports the app-level rate-limit lookback query in app/go/[partner]/route.ts.
CREATE INDEX IF NOT EXISTS affiliate_clicks_ip_hash_clicked_at_idx
  ON public.affiliate_clicks (user_ip_hash, clicked_at);

-- Retroactively flag the bot campaign window (confirmed via investigation:
-- ~1,020 distinct IPs, ~49 rotating UAs, irregular async timing, 45% SG/HK
-- geo, 48x rate spike vs. baseline).
-- Reversible: UPDATE public.affiliate_clicks SET is_suspected_fraud = false,
-- fraud_reason = NULL WHERE fraud_reason = 'retroactive_2026-07-31_bot_campaign';
UPDATE public.affiliate_clicks
SET is_suspected_fraud = true,
    fraud_reason = 'retroactive_2026-07-31_bot_campaign'
WHERE partner IN ('wayaway', 'safetywing')
  AND is_bot = false
  AND clicked_at >= '2026-07-31T18:00:00Z';
