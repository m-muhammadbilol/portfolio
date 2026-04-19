import { createClient } from "@supabase/supabase-js"
import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ContentManager } from "@/components/admin/content/ContentManager"
import { ResumeManager } from "@/components/admin/resume/ResumeManager"
import type { SiteContent, SiteSettings, Resume } from "@/types"

export default async function AdminContentPage() {
  const session = await requireAdmin()
  if (!session) redirect("/login")

  let content: Record<string, SiteContent> = {}
  let settings: SiteSettings | null = null
  let resume: Resume | null = null

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const [contentRes, settingsRes, resumeRes] = await Promise.all([
      supabase.from("site_content").select("*"),
      supabase.from("site_settings").select("*").single(),
      supabase.from("resume").select("*").order("created_at", { ascending: false }).limit(1).single(),
    ])
    if (contentRes.data) content = Object.fromEntries(contentRes.data.map((c: SiteContent) => [c.key, c]))
    if (settingsRes.data) settings = settingsRes.data
    if (resumeRes.data) resume = resumeRes.data
  } catch {}

  return (
    <div className="space-y-10">
      <ContentManager content={content} settings={settings} />
      <div className="border-t border-border pt-8">
        <ResumeManager initialResume={resume} />
      </div>
    </div>
  )
}
