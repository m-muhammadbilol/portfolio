import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsManager } from "@/components/admin/settings/SettingsManager"

export default async function AdminSettingsPage() {
  const session = await requireAdmin()
  if (!session) redirect("/login")

  return <SettingsManager />
}
