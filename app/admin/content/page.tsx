import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ContentManager } from "@/components/admin/content/ContentManager"
import type { SiteContent, SiteSettings } from "@/types"

export default async function AdminContentPage() {
  const session = await requireAdmin()
  if (!session) redirect("/login")

  let content: Record<string, SiteContent> = {}
  let settings: SiteSettings | null = null

  try {
    const supabase = await createClient()
    const [contentRes, settingsRes] = await Promise.all([
      supabase.from("site_content").select("*"),
      supabase.from("site_settings").select("*").single(),
    ])
    if (contentRes.data) {
      content = Object.fromEntries(contentRes.data.map((c: SiteContent) => [c.key, c]))
    }
    if (settingsRes.data) settings = settingsRes.data
  } catch {}

  return <ContentManager content={content} settings={settings} />
}
