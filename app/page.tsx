import { HomeProfile } from "@/components/public/home/HomeProfile"
import { createClient } from "@supabase/supabase-js"
import type { SiteContent, SiteSettings } from "@/types"

export const revalidate = 3600

export default async function HomePage() {
  let content: Record<string, SiteContent> = {}
  let settings: SiteSettings | null = null

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const [contentRes, settingsRes] = await Promise.all([
      supabase.from("site_content").select("*").in("key", ["home_title", "home_subtitle"]),
      supabase.from("site_settings").select("*").single(),
    ])
    if (contentRes.data) content = Object.fromEntries(contentRes.data.map((c: SiteContent) => [c.key, c]))
    if (settingsRes.data) settings = settingsRes.data
  } catch {}

  return <HomeProfile content={content} settings={settings} />
}
