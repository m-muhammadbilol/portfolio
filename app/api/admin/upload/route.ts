import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

const bucketNames = new Set(["avatars", "projects", "resume"])

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const form = await request.formData()
    const multiFiles = form.getAll("files")
    const files = multiFiles.length ? multiFiles : [form.get("file")]
    const bucket = form.get("bucket")
    const path = form.get("path")
    if (files.some((file) => !(file instanceof File)) || typeof bucket !== "string" || !bucketNames.has(bucket) || typeof path !== "string" || !/^[\w/-]+$/.test(path)) {
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 })
    }
    const isResume = bucket === "resume"
    const maxFiles = bucket === "projects" ? 12 : 1
    if (files.length === 0 || files.length > maxFiles) {
      return NextResponse.json({ error: `Choose between 1 and ${maxFiles} file${maxFiles === 1 ? "" : "s"}` }, { status: 400 })
    }
    const maxSize = isResume ? 10 : 5
    const invalidFile = files.find((file) => {
      if (!(file instanceof File)) return true
      const validType = isResume ? file.type === "application/pdf" : file.type.startsWith("image/")
      return !validType || file.size > maxSize * 1024 * 1024
    })
    if (invalidFile) {
      return NextResponse.json({ error: `Upload ${isResume ? "a PDF under 10MB" : "image files under 5MB each"}` }, { status: 400 })
    }

    const supabase = createAdminClient()
    const uploaded = await Promise.all(files.map(async (file) => {
      if (!(file instanceof File)) throw new Error("Invalid file")
      const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || (isResume ? "pdf" : "img")
      const fileName = `${path}-${crypto.randomUUID()}.${extension}`
      const { error } = await supabase.storage.from(bucket).upload(fileName, Buffer.from(await file.arrayBuffer()), {
        contentType: file.type,
        upsert: false,
      })
      if (error) throw error
      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
      return { url: data.publicUrl, fileName: file.name }
    }))
    if (multiFiles.length) return NextResponse.json({ urls: uploaded.map((file) => file.url), files: uploaded })
    return NextResponse.json(uploaded[0])
  } catch {
    return NextResponse.json({ error: "Upload failed. Check server Supabase configuration and storage bucket." }, { status: 503 })
  }
}
