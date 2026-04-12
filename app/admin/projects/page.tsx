import { createClient } from "@/lib/supabase/server"
import { requireAdmin } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ProjectsManager } from "@/components/admin/projects/ProjectsManager"
import type { Project } from "@/types"

export default async function AdminProjectsPage() {
  const session = await requireAdmin()
  if (!session) redirect("/login")

  let projects: Project[] = []

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false })

    if (data) projects = data
  } catch {}

  return <ProjectsManager initialProjects={projects} />
}
