"use client"

import { useState } from "react"
import { Loader2, X } from "lucide-react"
import { toast } from "sonner"
import { ProjectImageGallery } from "./ProjectImageGallery"
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
  category: string
  is_published: boolean
}

export function ProjectModal({ project, onClose, onSaved }: Props) {
  const [imageUrls, setImageUrls] = useState<string[]>(project?.image_urls?.length ? project.image_urls : project?.image_url ? [project.image_url] : [])
  const [categoryDetails, setCategoryDetails] = useState<Record<string, string>>(project?.category_details || {})
  const categoryDetailKeys: Record<string, string[]> = {
    Web: ["project_type"],
    App: ["app_type", "app_platform"],
    Ads: ["platform", "format", "objective", "campaign_url", "result"],
    Design: ["design_type", "tool", "preview_url", "deliverables"],
  }
  const categoryDetailDefaults: Record<string, Record<string, string>> = {
    Web: { project_type: "Landing page" },
    App: { app_type: "Web app" },
    Ads: { platform: "Meta Ads" },
    Design: { design_type: "Brand identity", tool: "Figma" },
  }
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
    category: project?.category || "Web",
    is_published: project?.is_published ?? true,
  })

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const setDetail = (key: string, value: string) =>
    setCategoryDetails((previous) => ({ ...previous, [key]: value }))

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
        category: form.category,
        category_details: Object.fromEntries((categoryDetailKeys[form.category] || []).flatMap((key) => {
          const value = categoryDetails[key] || categoryDetailDefaults[form.category]?.[key] || ""
          return value ? [[key, value] as const] : []
        })),
        is_pinned: project?.is_pinned ?? false,
        sort_order: parseInt(form.sort_order || "0", 10),
        is_published: form.is_published,
        image_urls: imageUrls,
        image_url: imageUrls[0] || "",
        updated_at: new Date().toISOString(),
      }

      const response = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "project.save", project: { ...payload, ...(project ? { id: project.id } : {}) } }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || "Failed to save project")

      toast.success(project ? "Project updated" : "Project created")
      onSaved()
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save project")
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
            <ProjectImageGallery images={imageUrls} onChange={setImageUrls} />
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

          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Category</label>
            <select
              value={form.category}
              onChange={(e) => { setForm((prev) => ({ ...prev, category: e.target.value })); setCategoryDetails((previous) => Object.fromEntries(Object.entries(previous).filter(([key]) => (categoryDetailKeys[e.target.value] || []).includes(key)))) }}
              className="h-11 w-full rounded-md border border-border bg-background px-4 text-base focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="Web">Web</option>
              <option value="App">App</option>
              <option value="Ads">Ads</option>
              <option value="Design">Design</option>
            </select>
          </div>

          {form.category === "Ads" ? (
            <div className="space-y-4 rounded-md border border-border p-4">
              <h3 className="text-sm font-medium">Ad campaign details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Platform</label>
                  <select value={categoryDetails.platform || "Meta Ads"} onChange={(e) => setDetail("platform", e.target.value)} className="h-11 w-full rounded-md border border-border bg-background px-4 text-base">
                    <option>Meta Ads</option><option>Google Ads</option><option>TikTok Ads</option><option>LinkedIn Ads</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-muted-foreground">Ad format</label>
                  <input value={categoryDetails.format || ""} onChange={(e) => setDetail("format", e.target.value)} placeholder="Video, banner, carousel..." className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">Campaign objective</label>
                <input value={categoryDetails.objective || ""} onChange={(e) => setDetail("objective", e.target.value)} placeholder="Leads, sales, awareness..." className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">Campaign link (optional)</label>
                <input value={categoryDetails.campaign_url || ""} onChange={(e) => setDetail("campaign_url", e.target.value)} placeholder="https://" className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" />
              </div>
              <div>
                <label className="mb-2 block text-sm text-muted-foreground">Result (optional)</label>
                <input value={categoryDetails.result || ""} onChange={(e) => setDetail("result", e.target.value)} placeholder="e.g. 2.4x ROAS" className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" />
              </div>
            </div>
          ) : form.category === "Design" ? (
            <div className="space-y-4 rounded-md border border-border bg-muted/20 p-4">
              <div><h3 className="text-sm font-semibold">Graphic & UI design details</h3><p className="mt-1 text-xs text-muted-foreground">Show what you designed, which tools you used, and what you delivered.</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-2 block text-sm text-muted-foreground">Design type</label><select value={categoryDetails.design_type || "Brand identity"} onChange={(e) => setDetail("design_type", e.target.value)} className="h-11 w-full rounded-md border border-border bg-background px-4 text-base"><option>Brand identity</option><option>Social media graphics</option><option>Ad creative</option><option>UI/UX design</option><option>Logo design</option><option>Print design</option><option>Illustration</option><option>Other</option></select></div>
                <div><label className="mb-2 block text-sm text-muted-foreground">Design tool</label><select value={categoryDetails.tool || "Figma"} onChange={(e) => setDetail("tool", e.target.value)} className="h-11 w-full rounded-md border border-border bg-background px-4 text-base"><option>Figma</option><option>Adobe Photoshop</option><option>Adobe Illustrator</option><option>Adobe InDesign</option><option>Adobe XD</option><option>Canva</option><option>Other</option></select></div>
              </div>
              <div><label className="mb-2 block text-sm text-muted-foreground">Preview / case study link (optional)</label><input value={categoryDetails.preview_url || ""} onChange={(e) => setDetail("preview_url", e.target.value)} placeholder="https://behance.net/..." className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" /></div>
              <div><label className="mb-2 block text-sm text-muted-foreground">Deliverables</label><input value={categoryDetails.deliverables || ""} onChange={(e) => setDetail("deliverables", e.target.value)} placeholder="Logo, social post set, brand guide..." className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" /></div>
            </div>
          ) : form.category === "Web" ? (
            <div className="space-y-4 rounded-md border border-border bg-muted/20 p-4">
              <div><h3 className="text-sm font-semibold">Website project details</h3><p className="mt-1 text-xs text-muted-foreground">Add the website type, live page, repository, and technologies.</p></div>
              <div><label className="mb-2 block text-sm text-muted-foreground">Website type</label><select value={categoryDetails.project_type || "Landing page"} onChange={(e) => setDetail("project_type", e.target.value)} className="h-11 w-full rounded-md border border-border bg-background px-4 text-base"><option>Landing page</option><option>Business website</option><option>E-commerce</option><option>Portfolio</option><option>Dashboard</option><option>Blog / CMS</option><option>Other</option></select></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="mb-2 block text-sm text-muted-foreground">Live website</label><input value={form.live_link} onChange={set("live_link")} placeholder="https://example.com" className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" /></div><div><label className="mb-2 block text-sm text-muted-foreground">Source code</label><input value={form.github_link} onChange={set("github_link")} placeholder="https://github.com/..." className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" /></div></div>
              <div><label className="mb-2 block text-sm text-muted-foreground">Tech stack (comma separated)</label><input value={form.tags} onChange={set("tags")} placeholder="Next.js, Tailwind CSS, Supabase" className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" /></div>
            </div>
          ) : (
            <div className="space-y-4 rounded-md border border-border bg-muted/20 p-4">
              <div><h3 className="text-sm font-semibold">App project details</h3><p className="mt-1 text-xs text-muted-foreground">Describe the app platform and add its demo or repository.</p></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="mb-2 block text-sm text-muted-foreground">App type</label><select value={categoryDetails.app_type || "Web app"} onChange={(e) => setDetail("app_type", e.target.value)} className="h-11 w-full rounded-md border border-border bg-background px-4 text-base"><option>Web app</option><option>Android app</option><option>iOS app</option><option>Cross-platform app</option><option>Desktop app</option><option>Other</option></select></div><div><label className="mb-2 block text-sm text-muted-foreground">Platform / framework</label><input value={categoryDetails.app_platform || ""} onChange={(e) => setDetail("app_platform", e.target.value)} placeholder="React Native, Flutter..." className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" /></div></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="mb-2 block text-sm text-muted-foreground">App / demo link</label><input value={form.live_link} onChange={set("live_link")} placeholder="https://..." className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" /></div><div><label className="mb-2 block text-sm text-muted-foreground">Source code</label><input value={form.github_link} onChange={set("github_link")} placeholder="https://github.com/..." className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" /></div></div>
              <div><label className="mb-2 block text-sm text-muted-foreground">Technologies (comma separated)</label><input value={form.tags} onChange={set("tags")} placeholder="Flutter, Firebase..." className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" /></div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">Sort Order</label>
            <input value={form.sort_order} onChange={set("sort_order")} type="number" className="h-11 w-full rounded-md border border-border bg-background px-4 text-base" />
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
