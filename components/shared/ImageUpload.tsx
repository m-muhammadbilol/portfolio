"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  bucket: string
  path: string
  label?: string
}

export function ImageUpload({ value, onChange, bucket, path, label = "Upload image" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Faqat rasm fayl")
    if (file.size > 5 * 1024 * 1024) return toast.error("Fayl 5MB dan kichik bo'lsin")

    setUploading(true)
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const ext = file.name.split(".").pop()
      const fileName = `${path}-${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      onChange(data.publicUrl)
      toast.success("Rasm yuklandi")
    } catch (err) {
      console.error(err)
      toast.error("Yuklash xato ketdi")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group w-full aspect-video rounded-md overflow-hidden border border-border bg-muted">
          <Image src={value} alt="Preview" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video rounded-md border border-dashed border-border flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <><Loader2 size={18} className="animate-spin" /><span>Yuklanmoqda...</span></>
          ) : (
            <><Upload size={18} /><span>{label}</span></>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }}
      />
    </div>
  )
}
