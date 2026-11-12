ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS category_details JSONB NOT NULL DEFAULT '{}'::jsonb;
