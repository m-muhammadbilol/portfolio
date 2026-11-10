ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'Web';

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS social_youtube TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_facebook TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_twitter TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS social_linkedin TEXT NOT NULL DEFAULT '';

ALTER TABLE site_settings ALTER COLUMN default_language SET DEFAULT 'en';
UPDATE site_settings SET default_language = 'en';

CREATE TABLE IF NOT EXISTS resume (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE resume ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read resume" ON resume;
CREATE POLICY "Public read resume" ON resume FOR SELECT USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('resume', 'resume', true)
ON CONFLICT (id) DO NOTHING;
