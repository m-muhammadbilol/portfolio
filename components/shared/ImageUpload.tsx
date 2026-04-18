"use client"

import { useState, useRef } from "react"
import { Upload, X, Loader2, RefreshCw } from "lucide-react"
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

export function ImageUpload({ value, onChange, bucket, path, label = "Rasm yuklash" }: ImageUploadProps) {
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
      toast.success("Rasm yuklandi!")
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
        <div className="relative w-full rounded-lg overflow-hidden border border-border bg-muted" style={{ aspectRatio: "16/9" }}>
          <Image src={value} alt="Preview" fill className="object-cover" />

          {/* Overlay with buttons - always visible */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
            {/* Change image */}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-white text-black rounded-md hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <RefreshCw size={13} />
              )}
              {uploading ? "Yuklanmoqda..." : "Almashtirish"}
            </button>

            {/* Delete image */}
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <X size={13} />
              O'chirish
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors disabled:opacity-50"
          style={{ aspectRatio: "16/9" }}
        >
          {uploading ? (
            <>
              <Loader2 size={24} className="animate-spin" />
              <span>Yuklanmoqda...</span>
            </>
          ) : (
            <>
              <Upload size={24} />
              <span>{label}</span>
              <span className="text-xs text-muted-foreground">PNG, JPG, WEBP — max 5MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) upload(f)
          e.target.value = ""
        }}
      />
    </div>
  )
}
