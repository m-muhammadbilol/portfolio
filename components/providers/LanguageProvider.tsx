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
  lang: "en",
  setLang: () => {},
  t: en,
})

export function LanguageProvider({ children, defaultLang = "en" }: { children: React.ReactNode; defaultLang?: Language }) {
  const [lang, setLangState] = useState<Language>(defaultLang)

  useEffect(() => {
    const previousDefault = localStorage.getItem("lang-default")
    if (previousDefault !== defaultLang) {
      localStorage.setItem("lang-default", defaultLang)
      localStorage.setItem("lang", defaultLang)
      return
    }

    const saved = localStorage.getItem("lang") as Language | null
    if (saved !== "uz" && saved !== "en") return

    const frame = window.requestAnimationFrame(() => {
      setLangState(saved)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [defaultLang])

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
