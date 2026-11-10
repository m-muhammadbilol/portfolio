import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

const bucketNames = new Set(["avatars", "projects", "resume"])

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const form = await request.formData()
    const file = form.get("file")
    const bucket = form.get("bucket")
    const path = form.get("path")
    if (!(file instanceof File) || typeof bucket !== "string" || !bucketNames.has(bucket) || typeof path !== "string" || !/^[\w/-]+$/.test(path)) {
      return NextResponse.json({ error: "Invalid upload" }, { status: 400 })
    }
    const isResume = bucket === "resume"
    const validType = isResume ? file.type === "application/pdf" : file.type.startsWith("image/")
    const maxSize = isResume ? 10 : 5
    if (!validType || file.size > maxSize * 1024 * 1024) {
      return NextResponse.json({ error: `Upload a ${isResume ? "PDF under 10MB" : "valid image under 5MB"}` }, { status: 400 })
    }

    const supabase = createAdminClient()
    const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || (isResume ? "pdf" : "img")
    const fileName = `${path}-${Date.now()}.${extension}`
    const { error } = await supabase.storage.from(bucket).upload(fileName, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      upsert: true,
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return NextResponse.json({ url: data.publicUrl, fileName: file.name })
  } catch {
    return NextResponse.json({ error: "Upload failed. Check server Supabase configuration and storage bucket." }, { status: 503 })
  }
}
