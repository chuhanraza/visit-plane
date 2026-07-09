-- ════════════════════════════════════════════════════════════════════════════
-- VisitPlane Group Sync — Phase 1 schema (feature/group-sync)
-- Additive: new tables only. Does NOT touch orders / documents / visa data.
-- RLS on EVERY table. The crew-shared surface (crew_member_progress) contains
-- zero PII by construction. Invite tokens live in crew_invites which has RLS
-- enabled and NO policies — unreadable by anon/authenticated clients entirely;
-- only server-side service-role code can touch them.
-- See docs/group-sync-PRD.md
-- ════════════════════════════════════════════════════════════════════════════

-- ─── crews ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS crews (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  destination_iso   char(2),
  destination_name  text NOT NULL CHECK (char_length(destination_name) BETWEEN 1 AND 80),
  travel_date       date,
  created_by        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  max_members       int NOT NULL DEFAULT 10 CHECK (max_members BETWEEN 2 AND 20),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crews_created_by ON crews(created_by);

-- ─── crew_members (membership + role + consent; no emails, no PII) ──────────
CREATE TABLE IF NOT EXISTS crew_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id       uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'member' CHECK (role IN ('leader','member')),
  display_name  text NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 60),
  consented_at  timestamptz NOT NULL DEFAULT now(),
  joined_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (crew_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_crew_members_crew ON crew_members(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_user ON crew_members(user_id);

-- ─── crew_invites (token vault — service-role only, see RLS note below) ─────
CREATE TABLE IF NOT EXISTS crew_invites (
  crew_id     uuid PRIMARY KEY REFERENCES crews(id) ON DELETE CASCADE,
  -- 256-bit hex token (two UUIDs, dashes stripped) — unguessable
  token       text UNIQUE NOT NULL
                DEFAULT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  expires_at  timestamptz NOT NULL DEFAULT now() + interval '30 days',
  rotated_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ─── crew_member_progress (THE shared surface — coarse status only) ─────────
-- Deliberately contains no PII columns and no FK to orders/order_documents:
-- the schema cannot express "crew-mate reads my application" even by accident.
CREATE TABLE IF NOT EXISTS crew_member_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id     uuid NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_key    text NOT NULL CHECK (char_length(slot_key) BETWEEN 1 AND 60),
  slot_label  text NOT NULL CHECK (char_length(slot_label) BETWEEN 1 AND 120),
  -- ALL status values shipped in the same migration (CHECK-constraint lesson
  -- from affiliate_clicks: a missed value makes inserts fail silently later).
  status      text NOT NULL DEFAULT 'not_started'
                CHECK (status IN ('not_started','ready','uploaded','approved','rejected')),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (crew_id, user_id, slot_key)
);
CREATE INDEX IF NOT EXISTS idx_crew_progress_crew ON crew_member_progress(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_progress_user ON crew_member_progress(user_id);

-- ─── updated_at touch triggers (reuse existing evisa helper) ─────────────────
DROP TRIGGER IF EXISTS trg_crews_touch ON crews;
CREATE TRIGGER trg_crews_touch BEFORE UPDATE ON crews
  FOR EACH ROW EXECUTE FUNCTION evisa_touch_updated_at();
DROP TRIGGER IF EXISTS trg_crew_progress_touch ON crew_member_progress;
CREATE TRIGGER trg_crew_progress_touch BEFORE UPDATE ON crew_member_progress
  FOR EACH ROW EXECUTE FUNCTION evisa_touch_updated_at();

-- ─── Immutability backstop: membership identity/role cannot be edited ────────
-- MVP has no role transfer; display_name is the only member-editable column.
CREATE OR REPLACE FUNCTION crew_members_lock_identity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.crew_id <> OLD.crew_id OR NEW.user_id <> OLD.user_id OR NEW.role <> OLD.role THEN
    RAISE EXCEPTION 'crew membership identity/role is immutable'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crew_members_lock ON crew_members;
CREATE TRIGGER trg_crew_members_lock BEFORE UPDATE ON crew_members
  FOR EACH ROW EXECUTE FUNCTION crew_members_lock_identity();

-- Same for progress rows: only `status` may change after seeding.
CREATE OR REPLACE FUNCTION crew_progress_lock_identity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.crew_id <> OLD.crew_id OR NEW.user_id <> OLD.user_id
     OR NEW.slot_key <> OLD.slot_key THEN
    RAISE EXCEPTION 'crew progress identity is immutable'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_crew_progress_lock ON crew_member_progress;
CREATE TRIGGER trg_crew_progress_lock BEFORE UPDATE ON crew_member_progress
  FOR EACH ROW EXECUTE FUNCTION crew_progress_lock_identity();

-- ─── Membership helpers (mirror is_admin(): SECURITY DEFINER avoids recursive
--     RLS when policies on crew tables consult crew_members) ─────────────────
CREATE OR REPLACE FUNCTION is_crew_member(p_crew_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM crew_members WHERE crew_id = p_crew_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_crew_leader(p_crew_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM crew_members
    WHERE crew_id = p_crew_id AND user_id = auth.uid() AND role = 'leader'
  );
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- RLS — enabled on EVERY table
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE crews                ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_members         ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_invites         ENABLE ROW LEVEL SECURITY;
ALTER TABLE crew_member_progress ENABLE ROW LEVEL SECURITY;

-- crew_invites: RLS enabled, ZERO policies — no anon/authenticated access at
-- all. Tokens are only ever read/written by service-role server code
-- (join validation, leader share-link fetch, rotation). This is deliberate.

-- crews: members read; creator reads own even before membership row lands
-- (also lets the create flow's WITH CHECK subselects resolve). Leader manages.
DROP POLICY IF EXISTS p_crews_select ON crews;
CREATE POLICY p_crews_select ON crews FOR SELECT TO authenticated
  USING (is_crew_member(id) OR created_by = auth.uid());
DROP POLICY IF EXISTS p_crews_insert ON crews;
CREATE POLICY p_crews_insert ON crews FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
DROP POLICY IF EXISTS p_crews_update ON crews;
CREATE POLICY p_crews_update ON crews FOR UPDATE TO authenticated
  USING (is_crew_leader(id)) WITH CHECK (is_crew_leader(id));
DROP POLICY IF EXISTS p_crews_delete ON crews;
CREATE POLICY p_crews_delete ON crews FOR DELETE TO authenticated
  USING (is_crew_leader(id));

-- crew_members: members see the roster (display_name/role/dates only — the
-- table holds nothing else). Joins are inserted by the token-validating
-- service-role route; the ONLY RLS insert allowed is the creator seeding
-- their own leader row at crew creation.
DROP POLICY IF EXISTS p_crew_members_select ON crew_members;
CREATE POLICY p_crew_members_select ON crew_members FOR SELECT TO authenticated
  USING (is_crew_member(crew_id));
DROP POLICY IF EXISTS p_crew_members_insert_leader ON crew_members;
CREATE POLICY p_crew_members_insert_leader ON crew_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND role = 'leader'
    AND crew_id IN (SELECT id FROM crews WHERE created_by = auth.uid())
  );
DROP POLICY IF EXISTS p_crew_members_update_self ON crew_members;
CREATE POLICY p_crew_members_update_self ON crew_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
-- leave (non-leaders) or leader removes someone else; leaders cannot leave —
-- they delete the crew instead (prevents orphaned crews).
DROP POLICY IF EXISTS p_crew_members_delete ON crew_members;
CREATE POLICY p_crew_members_delete ON crew_members FOR DELETE TO authenticated
  USING (
    (user_id = auth.uid() AND role <> 'leader')
    OR (is_crew_leader(crew_id) AND user_id <> auth.uid())
  );

-- crew_member_progress: crew-visible coarse status; only the OWNER writes.
DROP POLICY IF EXISTS p_crew_progress_select ON crew_member_progress;
CREATE POLICY p_crew_progress_select ON crew_member_progress FOR SELECT TO authenticated
  USING (is_crew_member(crew_id));
DROP POLICY IF EXISTS p_crew_progress_insert ON crew_member_progress;
CREATE POLICY p_crew_progress_insert ON crew_member_progress FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_crew_member(crew_id));
DROP POLICY IF EXISTS p_crew_progress_update ON crew_member_progress;
CREATE POLICY p_crew_progress_update ON crew_member_progress FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS p_crew_progress_delete ON crew_member_progress;
CREATE POLICY p_crew_progress_delete ON crew_member_progress FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- NOTE: no anon policies on any crew table. The public join landing page is
-- served by server code using the service client and returns only
-- {name, destination, member_count, leader_display_name}.

COMMENT ON TABLE crews IS 'Group Sync crews. Shared surface is status-only; see docs/group-sync-PRD.md.';
COMMENT ON TABLE crew_invites IS 'Invite tokens. RLS enabled with zero policies: service-role only, by design.';
COMMENT ON TABLE crew_member_progress IS 'Coarse per-slot readiness ticks. Contains no PII by construction.';
