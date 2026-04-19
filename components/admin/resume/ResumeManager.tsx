"use client"

import { useState, useRef } from "react"
import { Upload, Trash2, Loader2, FileText, Download } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@supabase/supabase-js"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import type { Resume } from "@/types"

export function ResumeManager({ initialResume }: { initialResume: Resume | null }) {
  const [resume, setResume] = useState<Resume | null>(initialResume)
  const [uploading, setUploading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function getClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  const upload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Faqat PDF fayl yuklang")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Fayl 10MB dan kichik bolsin")
      return
    }

    setUploading(true)
    try {
      const supabase = getClient()
      const fileName = `resume-${Date.now()}.pdf`

      const { error: uploadError } = await supabase.storage
        .from("resume")
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("resume").getPublicUrl(fileName)

      if (resume) {
        const { data: updated } = await supabase
          .from("resume")
          .update({
            file_url: data.publicUrl,
            file_name: file.name,
            updated_at: new Date().toISOString(),
          })
          .eq("id", resume.id)
          .select()
          .single()
        if (updated) setResume(updated)
      } else {
        const { data: inserted } = await supabase
          .from("resume")
          .insert({
            file_url: data.publicUrl,
            file_name: file.name,
          })
          .select()
          .single()
        if (inserted) setResume(inserted)
      }

      toast.success("Resume yuklandi!")
    } catch (err) {
      console.error(err)
      toast.error("Yuklashda xato")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!resume) return
    try {
      const supabase = getClient()
      await supabase.from("resume").delete().eq("id", resume.id)
      setResume(null)
      toast.success("Resume ochirildi")
    } catch {
      toast.error("Ochirshda xato")
    }
  }

  return (
    <div className="space-y-5 max-w-xl">
      <div>
        <h2 className="text-sm font-medium mb-1">Resume / CV</h2>
        <p className="text-xs text-muted-foreground">PDF formatda yuklang. Foydalanuvchilar yuklab olishadi.</p>
      </div>

      {resume ? (
        <div className="p-4 rounded-lg border border-border bg-card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{resume.file_name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(resume.updated_at).toLocaleDateString("uz-UZ")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={resume.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-md border border-border hover:bg-accent transition-colors"
            >
              <Download size={13} />
              Ko&apos;rish
            </a>

            <button
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Upload size={13} />
              )}
              {uploading ? "Yuklanmoqda..." : "Almashtirish"}
            </button>

            <button
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-md text-destructive border border-destructive/30 hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={13} />
              Ochirish
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full p-8 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              <span className="text-sm">Yuklanmoqda...</span>
            </>
          ) : (
            <>
              <Upload size={24} />
              <span className="text-sm font-medium">Resume yuklash</span>
              <span className="text-xs">PDF format — max 10MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) upload(f)
          e.target.value = ""
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Resumeni ochirish?"
        description="Bu amal qaytarilmaydi."
        confirmLabel="Ochirish"
        cancelLabel="Bekor qilish"
      />
    </div>
  )
}
