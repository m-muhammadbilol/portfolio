"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { LanguageToggle } from "@/components/shared/LanguageToggle"
import { useLanguage } from "@/components/providers/LanguageProvider"
import type { SiteContent } from "@/types"

interface Props {
  content: Record<string, SiteContent>
}

export function AboutContent({ content }: Props) {
  const { lang, t } = useLanguage()

  const bio = lang === "en"
    ? (content["about_bio"]?.value_en || t.about.defaultBio)
    : (content["about_bio"]?.value_uz || t.about.defaultBio)

  const experience = lang === "en"
    ? (content["about_experience"]?.value_en || t.about.defaultExperience)
    : (content["about_experience"]?.value_uz || t.about.defaultExperience)

  const education = lang === "en"
    ? (content["about_education"]?.value_en || t.about.defaultEducation)
    : (content["about_education"]?.value_uz || t.about.defaultEducation)

  const skillsRaw = content["about_skills"]?.value_uz || "React,Next.js,TypeScript,Tailwind CSS,JavaScript,HTML,CSS"
  const skills = skillsRaw.split(",").map((s) => s.trim()).filter(Boolean)

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-6 py-20 sm:py-24">
      <div className="fixed top-4 right-4 z-20 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div
        className="mb-10 opacity-0 animate-[fade-in_0.4s_ease_0.05s_forwards]"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={14} />
          {t.nav.home}
        </Link>
      </div>

      <div className="space-y-12">
        <div className="opacity-0 animate-[slide-up_0.4s_ease_0.1s_forwards]">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.about.title}</h1>
        </div>

        <div className="opacity-0 animate-[slide-up_0.4s_ease_0.15s_forwards]">
          <p className="text-base leading-8 text-muted-foreground sm:text-lg">{bio}</p>
        </div>

        <div className="opacity-0 animate-[slide-up_0.4s_ease_0.2s_forwards] space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{t.about.skills}</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-border px-4 py-1.5 text-sm text-foreground/80 transition-colors hover:border-foreground/30"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="opacity-0 animate-[slide-up_0.4s_ease_0.25s_forwards] space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{t.about.experience}</h2>
          <p className="text-base leading-8 text-foreground/80 sm:text-lg">{experience}</p>
        </div>

        <div className="opacity-0 animate-[slide-up_0.4s_ease_0.3s_forwards] space-y-2">
          <h2 className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">{t.about.education}</h2>
          <p className="text-base leading-8 text-foreground/80 sm:text-lg">{education}</p>
        </div>
      </div>
    </main>
  )
}
