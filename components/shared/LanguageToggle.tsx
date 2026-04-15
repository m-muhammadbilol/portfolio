"use client"

import { useLanguage } from "@/components/providers/LanguageProvider"

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage()

  return (
    <button
      onClick={() => setLang(lang === "uz" ? "en" : "uz")}
      className={`h-9 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground ${className}`}
      aria-label="Toggle language"
    >
      {lang === "uz" ? "EN" : "UZ"}
    </button>
  )
}
