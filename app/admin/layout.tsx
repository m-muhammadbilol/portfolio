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
        <header className="flex h-16 items-center justify-between border-b border-border px-5 sm:px-6">
          <div className="md:hidden" /> {/* spacer for mobile menu btn */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="mr-2 hidden text-sm text-muted-foreground sm:block">
              {session.username}
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* Page */}
        <main className="p-5 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
