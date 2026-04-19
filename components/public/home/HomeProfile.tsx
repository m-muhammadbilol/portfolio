"use client"

import Image from "next/image"
import Link from "next/link"
import {
  AtSign,
  Briefcase,
  Camera,
  Download,
  GitBranch,
  Globe,
  Play,
  Send,
  ThumbsUp,
} from "lucide-react"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { LanguageToggle } from "@/components/shared/LanguageToggle"
import { useLanguage } from "@/components/providers/LanguageProvider"
import type { Resume, SiteContent, SiteSettings } from "@/types"

interface Props {
  content: Record<string, SiteContent>
  settings: SiteSettings | null
  resume: Resume | null
}

const ICONS: Record<string, React.ElementType> = {
  github: GitBranch,
  telegram: Send,
  instagram: Camera,
  youtube: Play,
  facebook: ThumbsUp,
  twitter: AtSign,
  linkedin: Briefcase,
  website: Globe,
}

function SocialButton({ icon, href, label }: { icon: string; href: string; label: string }) {
  const Icon = ICONS[icon] || Globe

  return (
    <div className="relative group/tip">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <Icon size={16} />
      </a>
      <span
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 transition-opacity duration-150 group-hover/tip:opacity-100"
      >
        {label}
      </span>
    </div>
  )
}

export function HomeProfile({ content, settings, resume }: Props) {
  const { lang, t } = useLanguage()

  const title =
    lang === "en"
      ? content["home_title"]?.value_en || t.home.defaultTitle
      : content["home_title"]?.value_uz || t.home.defaultTitle

  const subtitle =
    lang === "en"
      ? content["home_subtitle"]?.value_en || t.home.defaultSubtitle
      : content["home_subtitle"]?.value_uz || t.home.defaultSubtitle

  const imageUrl = settings?.home_image_url || ""

  const socials = [
    { key: "github", href: settings?.social_github, label: "GitHub" },
    { key: "telegram", href: settings?.social_telegram, label: "Telegram" },
    { key: "instagram", href: settings?.social_instagram, label: "Instagram" },
    { key: "youtube", href: settings?.social_youtube, label: "YouTube" },
    { key: "facebook", href: settings?.social_facebook, label: "Facebook" },
    { key: "twitter", href: settings?.social_twitter, label: "Twitter" },
    { key: "linkedin", href: settings?.social_linkedin, label: "LinkedIn" },
  ].filter((social): social is { key: string; href: string; label: string } => Boolean(social.href?.trim()))

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="fixed right-4 top-4 z-20 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.05s_forwards]">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt="Profile"
                width={96}
                height={96}
                className="h-full w-full object-cover"
                priority
              />
            ) : (
              <span className="text-xs text-muted-foreground">Rasm yo&apos;q</span>
            )}
          </div>
        </div>

        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.12s_forwards]">
          <h1 className="text-xl font-semibold leading-snug tracking-tight">{title}</h1>
        </div>

        <div className="opacity-0 animate-[slide-up_0.5s_ease_0.19s_forwards]">
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="mt-1 flex items-center gap-4 opacity-0 animate-[slide-up_0.5s_ease_0.26s_forwards]">
          <Link
            href="/about"
            className="text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
          >
            {t.nav.about}
          </Link>
          <span className="text-border">·</span>
          <Link
            href="/projects"
            className="text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
          >
            {t.nav.projects}
          </Link>
        </div>

        {socials.length > 0 && (
          <div className="mt-1 flex flex-wrap items-center justify-center gap-1 opacity-0 animate-[slide-up_0.5s_ease_0.33s_forwards]">
            {socials.map((social) => (
              <SocialButton key={social.key} icon={social.key} href={social.href} label={social.label} />
            ))}
          </div>
        )}

        {resume && (
          <div className="mt-2 opacity-0 animate-[slide-up_0.5s_ease_0.4s_forwards]">
            <a
              href={resume.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download={resume.file_name}
              className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
            >
              <Download size={14} />
              {lang === "en" ? "Download Resume" : "Resume yuklab olish"}
            </a>
          </div>
        )}
      </div>
    </main>
  )
}
