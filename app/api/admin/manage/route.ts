import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath, revalidateTag } from "next/cache"

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  title_uz: z.string().min(1), title_en: z.string().min(1),
  description_uz: z.string(), description_en: z.string(),
  live_link: z.string(), github_link: z.string(), image_url: z.string(),
  image_urls: z.array(z.string().url()).max(12),
  tags: z.array(z.string()), category: z.enum(["Web", "App", "Ads", "Design"]),
  category_details: z.record(z.string(), z.string().max(500)),
  sort_order: z.number().int(), is_published: z.boolean(),
})

const requestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("project.save"), project: projectSchema }),
  z.object({ action: z.literal("project.publish"), id: z.string().uuid(), is_published: z.boolean() }),
  z.object({ action: z.literal("project.delete"), id: z.string().uuid() }),
  z.object({ action: z.literal("content.save"), content: z.array(z.object({ key: z.string(), value_uz: z.string(), value_en: z.string() })), settings: z.record(z.string(), z.string()).optional() }),
  z.object({ action: z.literal("settings.cursor"), cursor: z.string() }),
  z.object({ action: z.literal("settings.theme"), theme: z.enum(["light", "dark", "system"]) }),
  z.object({ action: z.literal("resume.save"), file_url: z.string().url(), file_name: z.string().min(1) }),
  z.object({ action: z.literal("resume.delete"), id: z.string().uuid() }),
])

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = requestSchema.parse(await request.json())
    const supabase = createAdminClient()
    let error
    let savedResume: { id: string; file_url: string; file_name: string; created_at: string; updated_at: string } | null = null

    if (body.action === "project.save") {
      const { id, ...values } = body.project
      const result = id
        ? await supabase.from("projects").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id)
        : await supabase.from("projects").insert(values)
      error = result.error
    } else if (body.action === "project.publish") {
      error = (await supabase.from("projects").update({ is_published: body.is_published, updated_at: new Date().toISOString() }).eq("id", body.id)).error
    } else if (body.action === "project.delete") {
      error = (await supabase.from("projects").delete().eq("id", body.id)).error
    } else if (body.action === "content.save") {
      const contentResult = await supabase.from("site_content").upsert(body.content, { onConflict: "key" })
      error = contentResult.error
      if (!error && body.settings && Object.keys(body.settings).length) {
        error = (await supabase.from("site_settings").update({ ...body.settings, updated_at: new Date().toISOString() })).error
      }
    } else if (body.action === "settings.cursor") {
      error = (await supabase.from("site_settings").update({ active_cursor: body.cursor, updated_at: new Date().toISOString() })).error
    } else if (body.action === "settings.theme") {
      error = (await supabase.from("site_settings").update({ default_theme: body.theme, updated_at: new Date().toISOString() })).error
    } else if (body.action === "resume.save") {
      const { data: current, error: readError } = await supabase.from("resume").select("id").order("created_at", { ascending: false }).limit(1).maybeSingle()
      error = readError
      if (!error) {
        const values = { file_url: body.file_url, file_name: body.file_name, updated_at: new Date().toISOString() }
        const saved = current
          ? await supabase.from("resume").update(values).eq("id", current.id).select().single()
          : await supabase.from("resume").insert(values).select().single()
        error = saved.error
        savedResume = saved.data
      }
    } else {
      error = (await supabase.from("resume").delete().eq("id", body.id)).error
    }

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (body.action.startsWith("project.")) revalidateTag("published-projects", { expire: 0 })
    if (body.action.startsWith("settings.") || body.action === "content.save") {
      revalidateTag("public-site-settings", { expire: 0 })
      revalidateTag("home-page-data", { expire: 0 })
      revalidateTag("about-page-data", { expire: 0 })
      revalidatePath("/")
      revalidatePath("/about")
    }
    if (body.action.startsWith("resume.")) {
      revalidateTag("home-page-data", { expire: 0 })
      revalidatePath("/")
    }
    return NextResponse.json({ success: true, ...(savedResume ? { resume: savedResume } : {}) })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request"
    const missingCredentials = message.includes("Missing Supabase server credentials")
    return NextResponse.json({ error: missingCredentials ? "Set SUPABASE_SERVICE_ROLE_KEY on the server" : message }, { status: missingCredentials ? 503 : 400 })
  }
}
