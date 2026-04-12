import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { FolderOpen, FileText, Settings, ExternalLink } from "lucide-react"

export default async function AdminDashboard() {
  const session = await requireAdmin()
  if (!session) redirect("/login")

  let projectCount = 0
  let publishedCount = 0
  let draftCount = 0

  try {
    const supabase = await createClient()
    const { data } = await supabase.from("projects").select("is_published")
    if (data) {
      projectCount = data.length
      publishedCount = data.filter(p => p.is_published).length
      draftCount = data.filter(p => !p.is_published).length
    }
  } catch {}

  const stats = [
    { label: "Total Projects", value: projectCount, icon: FolderOpen },
    { label: "Published", value: publishedCount, icon: ExternalLink },
    { label: "Drafts", value: draftCount, icon: FileText },
  ]

  const quickLinks = [
    { href: "/admin/projects", label: "Manage Projects", icon: FolderOpen, desc: "Add, edit, delete projects" },
    { href: "/admin/content", label: "Edit Content", icon: FileText, desc: "Home & About page content" },
    { href: "/admin/settings", label: "Settings", icon: Settings, desc: "Cursor, theme, credentials" },
  ]

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Welcome back, {session.username}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{label}</span>
              <Icon size={13} className="text-muted-foreground" />
            </div>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="p-4 rounded-lg border border-border bg-card hover:border-foreground/20 hover:bg-accent/50 transition-all group"
            >
              <Icon size={16} className="mb-3 text-muted-foreground group-hover:text-foreground transition-colors" />
              <p className="text-sm font-medium mb-1">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* View site link */}
      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink size={12} />
          View public site
        </Link>
      </div>
    </div>
  )
}
