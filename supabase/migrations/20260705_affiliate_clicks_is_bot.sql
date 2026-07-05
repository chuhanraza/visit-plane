-- Flag bot/crawler traffic in affiliate_clicks so EPC math excludes it.
-- Crawlers (ClaudeBot, MJ12bot, Bingbot, Googlebot, GPTBot, AhrefsBot,
-- publisherdiscovery, curl, etc.) fetch pages containing /go/[partner] links
-- and were being logged as if they were human clicks. Additive only — no
-- rows dropped, no existing columns altered.

ALTER TABLE public.affiliate_clicks
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false;

-- Backfill existing rows. Same signature coverage as the insert-time check
-- in app/go/[partner]/route.ts (BOT_UA_RE) — keep both in sync.
UPDATE public.affiliate_clicks
SET is_bot = true
WHERE is_bot = false
  AND (
    user_agent IS NULL
    OR user_agent = ''
    OR user_agent ~* '(bot|crawl|spider|slurp|bingpreview|curl|wget|python-requests|headless)'
  );

CREATE INDEX IF NOT EXISTS affiliate_clicks_is_bot_idx ON public.affiliate_clicks (is_bot);
