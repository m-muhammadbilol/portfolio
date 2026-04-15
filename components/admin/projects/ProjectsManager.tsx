"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { ProjectModal } from "./ProjectModal"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import { createClient } from "@supabase/supabase-js"
import type { Project } from "@/types"

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function ProjectsManager({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [modalOpen, setModalOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const refresh = async () => {
    const supabase = getClient()
    const { data } = await supabase.from("projects").select("*").order("sort_order").order("created_at", { ascending: false })
    if (data) setProjects(data)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const supabase = getClient()
    const { error } = await supabase.from("projects").delete().eq("id", deleteId)
    if (error) { toast.error("O'chirishda xato"); return }
    toast.success("Loyiha o'chirildi")
    setDeleteId(null)
    refresh()
  }

  const togglePublish = async (project: Project) => {
    const supabase = getClient()
    const { error } = await supabase.from("projects").update({ is_published: !project.is_published }).eq("id", project.id)
    if (!error) {
      setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_published: !p.is_published } : p))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Loyihalar</h1>
          <p className="mt-1 text-sm text-muted-foreground">{projects.length} ta</p>
        </div>
        <button
          onClick={() => { setEditProject(null); setModalOpen(true) }}
          className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-base text-background transition-colors hover:bg-foreground/90"
        >
          <Plus size={15} />
          Qo&apos;shish
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-border py-16 text-center text-base text-muted-foreground">
          Hozircha loyihalar yo&apos;q.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Sarlavha</th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground sm:table-cell">Teglar</th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium text-muted-foreground md:table-cell">Holat</th>
                <th className="px-4 py-2.5 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, i) => (
                <tr key={project.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-4 py-3">
                    <div className="max-w-[220px] truncate text-base font-medium">{project.title_uz}</div>
                    <div className="max-w-[220px] truncate text-sm text-muted-foreground">{project.title_en}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {project.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`rounded-full border px-2.5 py-1 text-xs ${project.is_published ? "border-foreground/20 text-foreground" : "border-border text-muted-foreground"}`}>
                      {project.is_published ? "Chop etilgan" : "Qoralama"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => togglePublish(project)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                        {project.is_published ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => { setEditProject(project); setModalOpen(true) }} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => setDeleteId(project.id)} className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <ProjectModal
          project={editProject}
          onClose={() => { setModalOpen(false); setEditProject(null) }}
          onSaved={refresh}
        />
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Loyihani o'chirish?"
        description="Bu amal qaytarilmaydi."
        confirmLabel="O'chirish"
        cancelLabel="Bekor qilish"
      />
    </div>
  )
}
