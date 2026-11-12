"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Loader2, X } from "lucide-react"
import { toast } from "sonner"

const MAX_IMAGES = 12

export function ProjectImageGallery({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    const selected = Array.from(files)
    if (images.length + selected.length > MAX_IMAGES) {
      toast.error(`A project can have up to ${MAX_IMAGES} images`)
      return
    }
    const invalid = selected.find((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)
    if (invalid) {
      toast.error("Choose image files under 5MB each")
      return
    }

    setUploading(true)
    const uploadedUrls: string[] = []
    try {
      for (const file of selected) {
        const form = new FormData()
        form.set("file", file)
        form.set("bucket", "projects")
        form.set("path", `project-${crypto.randomUUID()}`)
        const response = await fetch("/api/admin/upload", { method: "POST", body: form })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || "Upload failed")
        uploadedUrls.push(result.url)
      }
      onChange([...images, ...uploadedUrls])
      toast.success(`${uploadedUrls.length} image${uploadedUrls.length === 1 ? "" : "s"} uploaded`)
    } catch (error) {
      if (uploadedUrls.length) onChange([...images, ...uploadedUrls])
      toast.error(error instanceof Error ? error.message : "Upload failed")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
              <Image src={src} alt={`Project image ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover" />
              <span className="absolute bottom-2 left-2 rounded bg-black/65 px-2 py-0.5 text-xs text-white">{index + 1}</span>
              <button
                type="button"
                aria-label={`Remove image ${index + 1}`}
                onClick={() => onChange(images.filter((_, imageIndex) => imageIndex !== index))}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => upload(event.target.files)} />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading || images.length >= MAX_IMAGES}
        className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-sm transition-colors hover:bg-accent disabled:opacity-50"
      >
        {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
        {uploading ? "Uploading images..." : `Add images (${images.length}/${MAX_IMAGES})`}
      </button>
      <p className="text-xs text-muted-foreground">The first image shows first. The card rotates through images automatically.</p>
    </div>
  )
}
