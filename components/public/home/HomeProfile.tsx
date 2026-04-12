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
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative">
      {/* Top controls */}
      <div className="fixed top-4 right-4 flex items-center gap-1 z-20">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center text-center max-w-sm w-full gap-5">
        {/* Profile image */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.05s_forwards]">
          <div className="w-24 h-24 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Profile"
                width={96}
                height={96}
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <span className="text-xs text-muted-foreground">{t.home.noImage}</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.12s_forwards]">
          <h1 className="text-xl font-semibold tracking-tight leading-snug">{title}</h1>
        </div>

        {/* Subtitle */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.19s_forwards]">
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        {/* Nav links */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.26s_forwards] flex items-center gap-4 mt-1">
          <Link
            href="/about"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-foreground"
          >
            {t.nav.about}
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/projects"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-foreground"
          >
            {t.nav.projects}
          </Link>
        </div>

        {/* Social icons */}
        {socials.length > 0 && (
          <div className="opacity-0 animate-[slide-up_0.5s_ease_0.33s_forwards] flex items-center gap-3 mt-1">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
