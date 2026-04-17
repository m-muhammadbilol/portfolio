"use client"

import Image from "next/image"
import Link from "next/link"
import { Send, Globe, GitBranch, Camera, Play, ThumbsUp, AtSign, Briefcase } from "lucide-react"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { LanguageToggle } from "@/components/shared/LanguageToggle"
import { useLanguage } from "@/components/providers/LanguageProvider"
import type { SiteContent, SiteSettings } from "@/types"

interface Props {
  content: Record<string, SiteContent>
  settings: SiteSettings | null
}

const ICON_MAP: Record<string, React.ElementType> = {
  github: GitBranch,
  telegram: Send,
  instagram: Camera,
  youtube: Play,
  facebook: ThumbsUp,
  twitter: AtSign,
  linkedin: Briefcase,
  website: Globe,
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
    { key: "github", href: settings?.social_github, label: "GitHub" },
    { key: "telegram", href: settings?.social_telegram, label: "Telegram" },
    { key: "instagram", href: settings?.social_instagram, label: "Instagram" },
    { key: "youtube", href: settings?.social_youtube, label: "YouTube" },
    { key: "facebook", href: settings?.social_facebook, label: "Facebook" },
    { key: "twitter", href: settings?.social_twitter, label: "Twitter" },
    { key: "linkedin", href: settings?.social_linkedin, label: "LinkedIn" },
  ].filter(s => s.href && s.href.trim() !== "")

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 relative">
      <div className="fixed top-4 right-4 flex items-center gap-1 z-20">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="flex flex-col items-center text-center max-w-md w-full gap-6">
        {/* Profile image */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.05s_forwards]">
          <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
            {imageUrl ? (
              <Image src={imageUrl} alt="Profile" width={144} height={144} className="w-full h-full object-cover" priority />
            ) : (
              <span className="text-xs text-muted-foreground">Rasm yo&apos;q</span>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.12s_forwards]">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight leading-snug">{title}</h1>
        </div>

        {/* Subtitle */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.19s_forwards]">
          <p className="text-lg sm:text-xl text-muted-foreground">{subtitle}</p>
        </div>

        {/* Nav links */}
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.26s_forwards] flex items-center gap-5 mt-2">
          <Link href="/about" className="text-lg text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-foreground">
            {t.nav.about}
          </Link>
          <span className="text-border">·</span>
          <Link href="/projects" className="text-lg text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4 decoration-border hover:decoration-foreground">
            {t.nav.projects}
          </Link>
        </div>

        {/* Social icons with tooltip */}
        {socials.length > 0 && (
          <div className="opacity-0 animate-[slide-up_0.5s_ease_0.33s_forwards] flex items-center flex-wrap justify-center gap-2 mt-2">
            {socials.map(({ key, href, label }) => {
              const Icon = ICON_MAP[key] || Globe
              return (
                <div key={key} className="relative group/tip">
                  <a
                    href={href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-11 h-11 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Icon size={19} />
                  </a>
                  {/* Tooltip */}
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 text-xs bg-foreground text-background rounded-md whitespace-nowrap opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
                    {label}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-foreground" />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
