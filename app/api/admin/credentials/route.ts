import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { requireAdmin, signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  type: z.enum(["username", "password"]),
  currentPassword: z.string().min(1),
  newUsername: z.string().min(3).optional(),
  newPassword: z.string().min(6).optional(),
})

export async function POST(request: Request) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { type, currentPassword, newUsername, newPassword } = schema.parse(body)

    const supabase = await createClient()
    const { data: user } = await supabase
      .from("admin_users")
      .select("id, username, password_hash")
      .eq("id", session.id)
      .single()

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!valid) return NextResponse.json({ error: "Wrong current password" }, { status: 401 })

    if (type === "username" && newUsername) {
      await supabase.from("admin_users").update({ username: newUsername, updated_at: new Date().toISOString() }).eq("id", session.id)
      const token = await signToken({ id: session.id, username: newUsername })
      const response = NextResponse.json({ success: true })
      response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS)
      return response
    }

    if (type === "password" && newPassword) {
      const hash = await bcrypt.hash(newPassword, 12)
      await supabase.from("admin_users").update({ password_hash: hash, updated_at: new Date().toISOString() }).eq("id", session.id)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
