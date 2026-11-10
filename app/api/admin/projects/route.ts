import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from("projects").select("*").order("sort_order").order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ projects: data })
  } catch {
    return NextResponse.json({ error: "Set SUPABASE_SERVICE_ROLE_KEY on the server" }, { status: 503 })
  }
}
