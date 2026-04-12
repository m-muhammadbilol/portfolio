import { AboutContent } from "@/components/public/about/AboutContent"
import { createClient } from "@supabase/supabase-js"
import type { SiteContent } from "@/types"

export const revalidate = 3600

export default async function AboutPage() {
  let content: Record<string, SiteContent> = {}
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase.from("site_content").select("*")
    if (data) content = Object.fromEntries(data.map((c: SiteContent) => [c.key, c]))
  } catch {}
  return <AboutContent content={content} />
}
