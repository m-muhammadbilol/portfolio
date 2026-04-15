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
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <h2 className="text-base font-medium">{project ? "Edit Project" : "New Project"}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-accent"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Image</label>
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
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Title (UZ) *</label>
              <input
                value={form.title_uz}
                onChange={set("title_uz")}
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-base focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.title_uz && <p className="mt-1.5 text-sm text-destructive">{errors.title_uz}</p>}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Title (EN) *</label>
              <input
                value={form.title_en}
                onChange={set("title_en")}
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-base focus:outline-none focus:ring-1 focus:ring-ring"
              />
              {errors.title_en && <p className="mt-1.5 text-sm text-destructive">{errors.title_en}</p>}
            </div>
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Description (UZ)</label>
              <textarea
                value={form.description_uz}
                onChange={set("description_uz")}
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Description (EN)</label>
              <textarea
                value={form.description_en}
                onChange={set("description_en")}
                rows={3}
                className="w-full resize-none rounded-md border border-border bg-background px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Live Link</label>
              <input
                value={form.live_link}
                onChange={set("live_link")}
                placeholder="https://"
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-base focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">GitHub Link</label>
              <input
                value={form.github_link}
                onChange={set("github_link")}
                placeholder="https://github.com/..."
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-base focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          {/* Tags + Order */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Tags (comma separated)</label>
              <input
                value={form.tags}
                onChange={set("tags")}
                placeholder="React, Next.js, TypeScript"
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-base focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">Sort Order</label>
              <input
                value={form.sort_order}
                onChange={set("sort_order")}
                type="number"
                className="h-11 w-full rounded-md border border-border bg-background px-4 text-base focus:outline-none focus:ring-1 focus:ring-ring"
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
              className="h-4 w-4 rounded"
            />
            <label htmlFor="is_published" className="text-base">Published</label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2.5 text-base transition-colors hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-md bg-foreground px-4 py-2.5 text-base text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {project ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
