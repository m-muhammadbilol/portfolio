-- ============================================================
-- Muhammadbilol Portfolio — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username     TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_settings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_cursor     TEXT DEFAULT 'dot',
  default_theme     TEXT DEFAULT 'system',
  default_language  TEXT DEFAULT 'uz',
  social_instagram  TEXT DEFAULT '',
  social_telegram   TEXT DEFAULT '',
  social_github     TEXT DEFAULT '',
  home_image_url    TEXT DEFAULT '',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_content (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  value_uz   TEXT DEFAULT '',
  value_en   TEXT DEFAULT '',
  type       TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_uz        TEXT NOT NULL,
  title_en        TEXT NOT NULL,
  description_uz  TEXT DEFAULT '',
  description_en  TEXT DEFAULT '',
  image_url       TEXT DEFAULT '',
  live_link       TEXT DEFAULT '',
  github_link     TEXT DEFAULT '',
  tags            TEXT[] DEFAULT '{}',
  sort_order      INT DEFAULT 0,
  is_published    BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Admin user
-- Default credentials: muhammadbilol / 911266268
-- IMPORTANT: Generate a fresh hash before going live:
--   node -e "const b=require('bcryptjs'); b.hash('YOUR_PASSWORD',12).then(console.log)"
INSERT INTO admin_users (username, password_hash)
VALUES (
  'muhammadbilol',
  'b2$vfRaICcIRw9xRVkbYFFdW.mVBRF8kDRfiXh9v6ogd0mo8iG1XkRDa'
  -- NOTE: This is bcrypt hash of "password" — replace with real hash!
  -- Run: node -e "require('bcryptjs').hash('911266268',12).then(console.log)"
)
ON CONFLICT (username) DO NOTHING;

-- Site settings (single row)
INSERT INTO site_settings (active_cursor, default_theme, default_language, social_github)
VALUES ('dot', 'system', 'uz', 'https://github.com/muhammadbilol')
ON CONFLICT DO NOTHING;

-- Default content
INSERT INTO site_content (key, value_uz, value_en, type) VALUES
('home_title',
  'Assalomu alaykum, men Muhammadbilol',
  'Hello, I am Muhammadbilol',
  'text'),
('home_subtitle',
  'Frontend dasturchi',
  'Frontend Developer',
  'text'),
('about_bio',
  'Men Muhammadbilol, frontend dasturchi, 8+ oy tajribaga egaman. Foydalanuvchilarga qulay va chiroyli interfeys yaratish men uchun asosiy maqsad. React, Next.js va zamonaviy veb texnologiyalari bilan ishlashni yaxshi ko''raman.',
  'I am Muhammadbilol, a frontend developer with 8+ months of experience. Building user-friendly and elegant interfaces is my core goal. I enjoy working with React, Next.js, and modern web technologies.',
  'text'),
('about_experience',
  '8+ oy tajriba — zamonaviy frontend texnologiyalar bilan ishlash: React, Next.js, TypeScript, Tailwind CSS.',
  '8+ months of experience working with modern frontend technologies: React, Next.js, TypeScript, Tailwind CSS.',
  'text'),
('about_education',
  'NAJOT TA''LIM — Frontend dasturlash kursi. Zamonaviy veb ishlab chiqish asoslarini o''rgandim.',
  'NAJOT TA''LIM — Frontend Development Course. Learned the fundamentals of modern web development.',
  'text'),
('about_skills',
  'React,Next.js,TypeScript,JavaScript,Tailwind CSS,HTML,CSS,Git',
  'React,Next.js,TypeScript,JavaScript,Tailwind CSS,HTML,CSS,Git',
  'text')
ON CONFLICT (key) DO NOTHING;

-- Sample project
INSERT INTO projects (title_uz, title_en, description_uz, description_en, tags, is_published, sort_order)
VALUES (
  'Portfolio Veb-sayt',
  'Portfolio Website',
  'Shaxsiy portfolio veb-sayti — Next.js, TypeScript va Tailwind CSS yordamida qurilgan.',
  'Personal portfolio website built with Next.js, TypeScript, and Tailwind CSS.',
  ARRAY['Next.js', 'TypeScript', 'Tailwind CSS'],
  true,
  0
)
ON CONFLICT DO NOTHING;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read site_settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Public read site_content"
  ON site_content FOR SELECT USING (true);

CREATE POLICY "Public read published projects"
  ON projects FOR SELECT USING (is_published = true);

-- Allow anon to read all projects (admin uses service role for writes)
-- If you want admin reads through anon key too:
CREATE POLICY "Anon read all projects"
  ON projects FOR SELECT USING (true);

-- ============================================================
-- STORAGE BUCKETS
-- Run these or create them manually in Supabase dashboard
-- ============================================================

-- In Supabase Dashboard > Storage:
-- 1. Create bucket "avatars" → Public: ON
-- 2. Create bucket "projects" → Public: ON
--
-- Or via SQL (requires storage schema):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
-- INSERT INTO storage.buckets (id, name, public) VALUES ('projects', 'projects', true) ON CONFLICT DO NOTHING;

-- ============================================================
-- REALTIME
-- Enable in Supabase Dashboard > Database > Replication
-- Add "projects" table to replication
-- ============================================================
