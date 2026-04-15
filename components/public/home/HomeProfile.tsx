"use client"

import Image from "next/image"
import Link from "next/link"
import { Send, Globe, GitBranch } from "lucide-react"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { LanguageToggle } from "@/components/shared/LanguageToggle"
import { useLanguage } from "@/components/providers/LanguageProvider"
import type { SiteContent, SiteSettings } from "@/types"

interface Props {
  content: Record<string, SiteContent>
  settings: SiteSettings | null
}

export function HomeProfile({ content, settings }: Props) {
  const { lang, t } = useLanguage()

  const title = lang === "en"
    ? (content["home_title"]?.value_en || t.home.defaultTitle)
    : (content["home_title"]?.value_uz || t.home.defaultTitle)
  const subtitle = lang === "en"
    ? (content["home_subtitle"]?.value_en || t.home.defaultSubtitle)
    : (content["home_subtitle"]?.value_uz || t.home.defaultSubtitle)
  const imageUrl = settings?.home_image_url || ""

  const socials = [
    { icon: Globe, href: settings?.social_instagram, label: "Instagram" },
    { icon: Send, href: settings?.social_telegram, label: "Telegram" },
    { icon: GitBranch, href: settings?.social_github, label: "GitHub" },
  ].filter((s) => s.href)

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20 sm:py-24">
      {/* Top controls */}
      <div className="fixed top-4 right-4 z-20 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        {/* Profile image */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.05s_forwards]">
          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-border bg-muted sm:h-32 sm:w-32">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Profile"
                width={128}
                height={128}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <span className="text-sm text-muted-foreground">{t.home.noImage}</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.12s_forwards]">
          <h1 className="text-3xl font-semibold tracking-tight leading-snug sm:text-4xl">{title}</h1>
        </div>

        {/* Subtitle */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.19s_forwards]">
          <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">{subtitle}</p>
        </div>

        {/* Nav links */}
        <div className="mt-1 flex items-center gap-4 opacity-0 animate-[slide-up_0.5s_ease_0.26s_forwards] sm:gap-5">
          <Link
            href="/about"
            className="text-base text-muted-foreground underline underline-offset-4 decoration-border transition-colors hover:text-foreground hover:decoration-foreground sm:text-lg"
          >
            {t.nav.about}
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/projects"
            className="text-base text-muted-foreground underline underline-offset-4 decoration-border transition-colors hover:text-foreground hover:decoration-foreground sm:text-lg"
          >
            {t.nav.projects}
          </Link>
        </div>

        {/* Social icons */}
        {socials.length > 0 && (
          <div className="mt-1 flex items-center gap-3 opacity-0 animate-[slide-up_0.5s_ease_0.33s_forwards]">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
