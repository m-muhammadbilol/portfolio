import { NextResponse } from "next/server"
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { createClient } from "@supabase/supabase-js"

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = schema.parse(body)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: user, error } = await supabase
      .from("admin_users")
      .select("id, username, password_hash")
      .eq("username", username)
      .single()

    if (error || !user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = await signToken({ id: user.id, username: user.username })
    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS)
    return response
  } catch (err) {
    console.error("Login error:", err)
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }
}
