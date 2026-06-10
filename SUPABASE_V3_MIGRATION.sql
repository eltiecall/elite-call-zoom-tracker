-- V3 Migration: Months table (shared across all browsers) + fix reps realtime
-- Run this in: supabase.com → your project → SQL Editor → New Query → Run

-- ─── 1. Fix reps table: ensure it exists, has RLS, and is on realtime ───────

CREATE TABLE IF NOT EXISTS reps (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reps ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reps' AND policyname='reps_select') THEN
    CREATE POLICY "reps_select" ON reps FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reps' AND policyname='reps_insert') THEN
    CREATE POLICY "reps_insert" ON reps FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reps' AND policyname='reps_delete') THEN
    CREATE POLICY "reps_delete" ON reps FOR DELETE USING (true);
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE reps;

-- ─── 2. Create months table ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS months (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE months ENABLE ROW LEVEL SECURITY;

CREATE POLICY "months_select" ON months FOR SELECT USING (true);
CREATE POLICY "months_insert" ON months FOR INSERT WITH CHECK (true);
CREATE POLICY "months_delete" ON months FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE months;

-- ─── 3. Seed all months March–December 2025 ─────────────────────────────────

INSERT INTO months (name) VALUES
  ('March 2025'),
  ('April 2025'),
  ('May 2025'),
  ('June 2025'),
  ('July 2025'),
  ('August 2025'),
  ('September 2025'),
  ('October 2025'),
  ('November 2025'),
  ('December 2025')
ON CONFLICT DO NOTHING;
