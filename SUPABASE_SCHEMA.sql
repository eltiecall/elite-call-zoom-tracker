-- Run this in your Supabase SQL Editor
-- Go to: supabase.com → your project → SQL Editor → New Query → paste this → Run

CREATE TABLE IF NOT EXISTS zoom_entries (
  id TEXT PRIMARY KEY,
  month TEXT NOT NULL,
  date TEXT,
  rep TEXT NOT NULL,
  company TEXT NOT NULL,
  zoom_type TEXT,
  sat TEXT,
  outcome TEXT,
  deal_value TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) — allow all reads and writes (public app)
ALTER TABLE zoom_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all reads" ON zoom_entries FOR SELECT USING (true);
CREATE POLICY "Allow all inserts" ON zoom_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all updates" ON zoom_entries FOR UPDATE USING (true);
CREATE POLICY "Allow all deletes" ON zoom_entries FOR DELETE USING (true);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE zoom_entries;
