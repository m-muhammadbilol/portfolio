import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "muhammadbilol-portfolio-secret-key-change-in-production"
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_session")?.value
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    try {
      await jwtVerify(token, SECRET)
      return NextResponse.next()
    } catch {
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("admin_session")
      return response
    }
  }

  // Redirect authenticated admin away from login
  if (pathname === "/login") {
    const token = request.cookies.get("admin_session")?.value
    if (token) {
      try {
        await jwtVerify(token, SECRET)
        return NextResponse.redirect(new URL("/admin", request.url))
      } catch {}
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
}
