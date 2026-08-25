-- Lifecycle re-engagement: Track A (win-back) + Track B (confirm nudge) sent-at guards.
-- Nullable, additive only. Each column is the SOLE idempotency guard for its track —
-- a subscriber can never receive that track's email twice. Applied to wmoywcqadkjxujgwduup.

alter table public.email_subscribers
  add column if not exists winback_email_sent_at timestamptz,
  add column if not exists confirm_nudge_sent_at timestamptz;

comment on column public.email_subscribers.winback_email_sent_at is 'Track A: one-time win-back email sent-at guard (idempotency).';
comment on column public.email_subscribers.confirm_nudge_sent_at is 'Track B: one-time confirm-reminder sent-at guard (idempotency).';
