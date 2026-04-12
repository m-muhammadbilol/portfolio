"use client"

import { useLanguage } from "@/components/providers/LanguageProvider"

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLanguage()

  return (
    <button
      onClick={() => setLang(lang === "uz" ? "en" : "uz")}
      className={`text-xs font-medium px-2 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${className}`}
      aria-label="Toggle language"
    >
      {lang === "uz" ? "EN" : "UZ"}
    </button>
  )
}
