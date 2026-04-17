export interface Project {
  id: string
  title_uz: string
  title_en: string
  description_uz: string
  description_en: string
  image_url: string
  live_link: string
  github_link: string
  tags: string[]
  sort_order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface SiteContent {
  id: string
  key: string
  value_uz: string
  value_en: string
  type: string
}

export interface SiteSettings {
  id: string
  active_cursor: string
  default_theme: string
  default_language: string
  social_instagram: string
  social_telegram: string
  social_github: string
  social_youtube: string
  social_facebook: string
  social_twitter: string
  social_linkedin: string
  home_image_url: string
}

export interface AdminUser {
  id: string
  username: string
}

export type CursorType =
  | 'dot'
  | 'dot-ring'
  | 'glow'
  | 'square'
  | 'inverted'
  | 'outlined'
  | 'crosshair'
  | 'pulse'
  | 'trailing'
  | 'micro-ring'

export type Language = 'uz' | 'en'
export type Theme = 'light' | 'dark' | 'system'
