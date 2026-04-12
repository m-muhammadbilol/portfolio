# Muhammadbilol Portfolio

Premium minimal bilingual portfolio — Next.js 14 + TypeScript + Tailwind CSS + Supabase.

## Quick Start

### 1. Install
```bash
npm install
cp .env.local.example .env.local
# fill in Supabase URL, anon key, service role key, JWT secret
```

### 2. Database
Run `database/schema.sql` in Supabase SQL Editor.

Generate real bcrypt hash for default password:
```bash
node database/seed-password.js
```
Copy output SQL → run in Supabase.

### 3. Storage
Create two public buckets in Supabase Storage: `avatars` and `projects`.

### 4. Realtime
Enable replication for `projects` table in Supabase Dashboard → Database → Replication.

### 5. Run
```bash
npm run dev
```

## Default Admin Login
- Username: `muhammadbilol`
- Password: `911266268`
Change both from Admin → Settings after first login.

## Pages
| URL | Description |
|-----|-------------|
| `/` | Home |
| `/about` | About |
| `/projects` | Projects (realtime) |
| `/login` | Admin login |
| `/admin` | Dashboard |
| `/admin/projects` | Project CRUD |
| `/admin/content` | Edit content |
| `/admin/settings` | Cursor / theme / credentials |

## Features
- Bilingual UZ/EN, instant switch
- Dark/light/system theme
- 10 custom cursors (admin-controlled)
- Realtime project updates
- Secure JWT auth (httpOnly cookies, bcrypt)
- Full admin CRUD with image upload
- Responsive, skeleton loading, accessible
