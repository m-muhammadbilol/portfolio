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
    <div className="max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-base text-muted-foreground">Welcome back, {session.username}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon size={16} className="text-muted-foreground" />
            </div>
            <p className="text-3xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickLinks.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-lg border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:bg-accent/50"
            >
              <Icon size={18} className="mb-3 text-muted-foreground transition-colors group-hover:text-foreground" />
              <p className="mb-1 text-base font-medium">{label}</p>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* View site link */}
      <div className="flex items-center gap-3 pt-2">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ExternalLink size={14} />
          View public site
        </Link>
      </div>
    </div>
  )
}
