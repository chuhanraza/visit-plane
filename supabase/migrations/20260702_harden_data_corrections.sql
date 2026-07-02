-- Audit fix (AUDIT-AND-ROADMAP.md F13): data_corrections holds free-text user
-- reports (which can contain contact details). Nothing client-side reads it —
-- the admin dashboard and review API both use the service role, which bypasses
-- RLS — so the anon SELECT policy only exposed user submissions publicly.
DROP POLICY IF EXISTS "public_read_corrections" ON data_corrections;
