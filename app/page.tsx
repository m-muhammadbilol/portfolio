import { HomeProfile } from "@/components/public/home/HomeProfile"
import { createClient } from "@supabase/supabase-js"
import type { SiteContent, SiteSettings, Resume } from "@/types"

export const revalidate = 0
export const dynamic = "force-dynamic"

export default async function HomePage() {
  let content: Record<string, SiteContent> = {}
  let settings: SiteSettings | null = null
  let resume: Resume | null = null

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const [contentRes, settingsRes, resumeRes] = await Promise.all([
      supabase.from("site_content").select("*").in("key", ["home_title", "home_subtitle"]),
      supabase.from("site_settings").select("*").single(),
      supabase.from("resume").select("*").order("created_at", { ascending: false }).limit(1).single(),
    ])
    if (contentRes.data) content = Object.fromEntries(contentRes.data.map((c: SiteContent) => [c.key, c]))
    if (settingsRes.data) settings = settingsRes.data
    if (resumeRes.data) resume = resumeRes.data
  } catch {}

  return <HomeProfile content={content} settings={settings} resume={resume} />
}
