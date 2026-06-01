-- Add official_sources JSONB and source_status columns to destinations table
-- Run once in Supabase SQL Editor

ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS official_sources JSONB DEFAULT '[]'::jsonb;

ALTER TABLE destinations
  ADD COLUMN IF NOT EXISTS source_status TEXT
    NOT NULL DEFAULT 'pending_verification'
    CHECK (source_status IN ('verified', 'pending_verification', 'unverified'));

CREATE INDEX IF NOT EXISTS idx_destinations_source_status
  ON destinations (passport_country, country_name, source_status);

CREATE INDEX IF NOT EXISTS idx_destinations_official_sources
  ON destinations USING GIN (official_sources);
