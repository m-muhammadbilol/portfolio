"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { uz } from "@/i18n/uz"
import { en } from "@/i18n/en"
import type { Language } from "@/types"

type Translations = typeof uz

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "uz",
  setLang: () => {},
  t: uz,
})

export function LanguageProvider({ children, defaultLang = "uz" }: { children: React.ReactNode; defaultLang?: Language }) {
  const [lang, setLangState] = useState<Language>(defaultLang)

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language | null
    if (saved === "uz" || saved === "en") setLangState(saved)
  }, [])

  const setLang = (l: Language) => {
    setLangState(l)
    localStorage.setItem("lang", l)
  }

  const t = lang === "en" ? en : uz

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
