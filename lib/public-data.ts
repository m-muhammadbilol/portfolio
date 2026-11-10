import { unstable_cache } from "next/cache"
import { createClient } from "@supabase/supabase-js"
import type { Resume, SiteContent } from "@/types"

const getPublicClient = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const getHomeData = unstable_cache(
  async () => {
    const supabase = getPublicClient()
    const [contentRes, settingsRes, resumeRes] = await Promise.all([
      supabase.from("site_content").select("*").in("key", ["home_title", "home_subtitle"]),
      supabase.from("site_settings").select("*").single(),
      supabase.from("resume").select("*").order("created_at", { ascending: false }).limit(1).single(),
    ])
    return {
      content: Object.fromEntries((contentRes.data || []).map((item: SiteContent) => [item.key, item])),
      settings: settingsRes.data,
      resume: resumeRes.data as Resume | null,
    }
  },
  ["home-page-data"],
  { revalidate: 300, tags: ["home-page-data"] }
)

export const getAboutData = unstable_cache(
  async () => {
    const { data } = await getPublicClient().from("site_content").select("*")
    return Object.fromEntries((data || []).map((item: SiteContent) => [item.key, item]))
  },
  ["about-page-data"],
  { revalidate: 300, tags: ["about-page-data"] }
)
