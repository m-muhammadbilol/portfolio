import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />

      {/* Main content */}
      <div className="md:pl-52">
        {/* Top bar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-5">
          <div className="md:hidden" /> {/* spacer for mobile menu btn */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-xs text-muted-foreground mr-2 hidden sm:block">
              {session.username}
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Page */}
        <main className="p-5 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
