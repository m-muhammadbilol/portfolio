"use client"

import { useState } from "react"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { createClient } from "@/lib/supabase/client"
import type { Project } from "@/types"

interface Props {
  project?: Project | null
  onClose: () => void
  onSaved: () => void
}

interface FormState {
  title_uz: string
  title_en: string
  description_uz: string
  description_en: string
  live_link: string
  github_link: string
  tags: string
  sort_order: string
  is_published: boolean
}

export function ProjectModal({ project, onClose, onSaved }: Props) {
  const [imageUrl, setImageUrl] = useState(project?.image_url || "")
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})

  const [form, setForm] = useState<FormState>({
    title_uz: project?.title_uz || "",
    title_en: project?.title_en || "",
    description_uz: project?.description_uz || "",
    description_en: project?.description_en || "",
    live_link: project?.live_link || "",
    github_link: project?.github_link || "",
    tags: project?.tags?.join(", ") || "",
    sort_order: String(project?.sort_order ?? 0),
    is_published: project?.is_published ?? true,
  })

  const supabase = createClient()

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {}
    if (!form.title_uz.trim()) errs.title_uz = "Required"
    if (!form.title_en.trim()) errs.title_en = "Required"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    try {
      const payload = {
        title_uz: form.title_uz.trim(),
        title_en: form.title_en.trim(),
        description_uz: form.description_uz.trim(),
        description_en: form.description_en.trim(),
        live_link: form.live_link.trim(),
        github_link: form.github_link.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        sort_order: parseInt(form.sort_order || "0", 10),
        is_published: form.is_published,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      }

      if (project) {
        const { error } = await supabase.from("projects").update(payload).eq("id", project.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("projects").insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
      }

      toast.success(project ? "Project updated" : "Project created")
      onSaved()
      onClose()
    } catch {
      toast.error("Failed to save project")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-lg">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-5 py-3.5 flex items-center justify-between z-10">
          <h2 className="text-sm font-medium">{project ? "Edit Project" : "New Project"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-accent transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Image */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Image</label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              bucket="projects"
              path={`project-${Date.now()}`}
            />
          </div>

          {/* Titles */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title (UZ) *</label>
              <input
                value={form.title_uz}
                onChange={set("title_uz")}
                className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.title_uz && <p className="text-xs text-destructive mt-1">{errors.title_uz}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title (EN) *</label>
              <input
                value={form.title_en}
                onChange={set("title_en")}
                className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.title_en && <p className="text-xs text-destructive mt-1">{errors.title_en}</p>}
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description (UZ)</label>
              <textarea
                value={form.description_uz}
                onChange={set("description_uz")}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description (EN)</label>
              <textarea
                value={form.description_en}
                onChange={set("description_en")}
                rows={3}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Live Link</label>
              <input
                value={form.live_link}
                onChange={set("live_link")}
                placeholder="https://"
                className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">GitHub Link</label>
              <input
                value={form.github_link}
                onChange={set("github_link")}
                placeholder="https://github.com/..."
                className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Tags + Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={set("tags")}
                placeholder="React, Next.js, TypeScript"
                className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Sort Order</label>
              <input
                value={form.sort_order}
                onChange={set("sort_order")}
                type="number"
                className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center gap-2">
            <input
              id="is_published"
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm((prev) => ({ ...prev, is_published: e.target.checked }))}
              className="w-3.5 h-3.5 rounded"
            />
            <label htmlFor="is_published" className="text-sm">Published</label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-border hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {project ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
