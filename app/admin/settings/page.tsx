import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsManager } from "@/components/admin/settings/SettingsManager"
import type { SiteSettings } from "@/types"

export default async function AdminSettingsPage() {
  const session = await requireAdmin()
  if (!session) redirect("/login")

  let settings: SiteSettings | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase.from("site_settings").select("*").single()
    if (data) settings = data
  } catch {}

  return <SettingsManager settings={settings} />
}
