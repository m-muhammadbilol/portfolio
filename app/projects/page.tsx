import { ProjectsContent } from "@/components/public/projects/ProjectsContent"
import { createClient } from "@supabase/supabase-js"
import type { Project } from "@/types"

export const revalidate = 60

export default async function ProjectsPage() {
  let projects: Project[] = []
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at", { ascending: false })
    if (data) projects = data
  } catch {}
  return <ProjectsContent initialProjects={projects} />
}
