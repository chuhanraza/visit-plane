-- Revenue sprint Phase 4: seed the 3-email welcome sequence.
-- Idempotent: only seeds if a 'Welcome sequence' flow does not already exist.
-- The flow engine (lib/admin/flows.ts) enrolls leads confirmed AFTER flow.created_at,
-- so existing subscribers are never retroactively emailed. Sends are gated behind
-- the email_broadcasts_enabled flag, honor unsubscribe, and are idempotent per step.
-- Applied to project wmoywcqadkjxujgwduup.

do $$
declare new_flow uuid;
begin
  if not exists (select 1 from flows where name = 'Welcome sequence') then
    insert into flows (name, trigger_type, active) values ('Welcome sequence', 'lead.created', true)
    returning id into new_flow;

    insert into flow_steps (flow_id, position, delay_minutes, subject, body) values
      (new_flow, 0, 0,    'Your visa checklist is here', '<p>Welcome to VisitPlane. Your free visa checklist: https://www.visitplane.com/checklist — tip: passport valid 6+ months. Not sure which visa? https://www.visitplane.com/wizard</p>'),
      (new_flow, 1, 2880, 'The 3 free tools most travelers miss', '<p>Wizard, document checklist and passport-strength checker — all free at https://www.visitplane.com</p>'),
      (new_flow, 2, 5760, 'Before you fly: 2 things that trip people up', '<p>Travel insurance (required for Schengen) and an eSIM for arrival. See https://www.visitplane.com/go/safetywing?placement=email_sequence and https://www.visitplane.com/go/airalo?placement=email_sequence (affiliate links).</p>');
  end if;
end $$;

-- NOTE: the production flow bodies are the richer HTML seeded via the admin/MCP at
-- deploy time and are editable in /admin/marketing. This migration is a minimal,
-- self-contained fallback so the sequence is reproducible from source control.
