ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

UPDATE projects
SET image_urls = ARRAY[image_url]
WHERE cardinality(image_urls) = 0
  AND image_url IS NOT NULL
  AND btrim(image_url) <> '';
