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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Loyihalar</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{projects.length} ta</p>
        </div>
        <button
          onClick={() => { setEditProject(null); setModalOpen(true) }}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
        >
          <Plus size={13} />
          Qo'shish
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground border border-border rounded-lg">
          Hozircha loyihalar yo'q.
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Sarlavha</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden sm:table-cell">Teglar</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground hidden md:table-cell">Holat</th>
                <th className="px-4 py-2.5 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, i) => (
                <tr key={project.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm truncate max-w-[200px]">{project.title_uz}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{project.title_en}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {project.tags?.slice(0, 3).map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 text-[10px] rounded border border-border text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 text-[10px] rounded-full border ${project.is_published ? "border-foreground/20 text-foreground" : "border-border text-muted-foreground"}`}>
                      {project.is_published ? "Chop etilgan" : "Qoralama"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => togglePublish(project)} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        {project.is_published ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                      <button onClick={() => { setEditProject(project); setModalOpen(true) }} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteId(project.id)} className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 size={13} />
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
