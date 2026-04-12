import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { LanguageProvider } from "@/components/providers/LanguageProvider"
import { CursorProvider } from "@/components/providers/CursorProvider"
import { CustomCursor } from "@/components/shared/CustomCursor"
import { createClient } from "@supabase/supabase-js"
import "./globals.css"

export const metadata: Metadata = {
  title: "Muhammadbilol — Frontend Developer",
  description: "Portfolio of Muhammadbilol, frontend developer",
  icons: [],
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let cursor = "dot"
  let defaultLang = "uz"

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data } = await supabase
      .from("site_settings")
      .select("active_cursor, default_language")
      .single()
    if (data) {
      cursor = data.active_cursor || "dot"
      defaultLang = data.default_language || "uz"
    }
  } catch {}

  return (
    <html lang={defaultLang} suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:," />
      </head>
      <body style={{ fontFamily: "system-ui, -apple-system, sans-serif", margin: 0 }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider defaultLang={defaultLang as "uz" | "en"}>
            <CursorProvider initialCursor={cursor as any}>
              <CustomCursor />
              {children}
              <Toaster richColors position="bottom-right" />
            </CursorProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
