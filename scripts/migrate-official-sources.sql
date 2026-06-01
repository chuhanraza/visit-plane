-- ============================================================
-- scripts/migrate-official-sources.sql
--
-- Adds official_sources and source_status columns to the
-- 'destinations' table in Supabase.
--
-- Run once via the Supabase SQL Editor or psql:
--   psql $DATABASE_URL -f scripts/migrate-official-sources.sql
-- ============================================================

-- 1. Add official_sources JSONB column
--    Each entry in the array follows this shape:
--    {
--      "type": "mofa" | "embassy" | "evisa_portal" | "iata" | "other",
--      "label": "string",
--      "url": "https://...",
--      "verified_at": "YYYY-MM-DD",
--      "is_authoritative": true | false
--    }
ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS official_sources JSONB DEFAULT '[]'::jsonb;

-- 2. Add source_status enum-style text column with check constraint
ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS source_status TEXT
    NOT NULL DEFAULT 'pending_verification'
    CHECK (source_status IN ('verified', 'pending_verification', 'unverified'));

-- 3. Index for faster lookups by passport + destination + source_status
CREATE INDEX IF NOT EXISTS idx_destinations_source_status
  ON destinations (passport_country, country_name, source_status);

-- 4. Add a GIN index on official_sources for JSON queries
CREATE INDEX IF NOT EXISTS idx_destinations_official_sources
  ON destinations USING GIN (official_sources);

-- 5. Verify
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'destinations'
  AND column_name IN ('official_sources', 'source_status')
ORDER BY column_name;
