import { ProjectsContent } from "@/components/public/projects/ProjectsContent"
import { createClient } from "@supabase/supabase-js"
import type { Project } from "@/types"
import { unstable_cache } from "next/cache"

const getPublishedProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("is_published", true)
      .order("sort_order")
      .order("created_at", { ascending: false })
    if (error) throw error
    return (data || []) as Project[]
  },
  ["published-projects"],
  { revalidate: 300, tags: ["published-projects"] }
)

export default async function ProjectsPage() {
  let projects: Project[] = []
  try {
    projects = await getPublishedProjects()
  } catch {}
  return <ProjectsContent initialProjects={projects} />
}
