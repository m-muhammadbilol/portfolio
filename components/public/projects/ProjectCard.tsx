"use client"

import { useEffect, useRef, useState } from "react"
import type { MouseEvent, TouchEvent } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, ExternalLink, GitBranch } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import type { Project } from "@/types"

export function ProjectCard({ project }: { project: Project }) {
  const { lang, t } = useLanguage()

  const title = lang === "en" ? project.title_en : project.title_uz
  const description = lang === "en" ? project.description_en : project.description_uz
  const images = project.image_urls?.length ? project.image_urls : project.image_url ? [project.image_url] : []
  const [activeImage, setActiveImage] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const suppressClick = useRef(false)
  const category = project.category || "Web"
  const primaryHref = project.category === "Ads"
    ? project.category_details?.campaign_url?.trim() || project.live_link?.trim() || ""
    : project.category === "Design"
      ? project.category_details?.preview_url?.trim() || project.live_link?.trim() || ""
      : project.live_link?.trim() || ""
  const githubHref = category === "Web" || category === "App" ? project.github_link?.trim() || "" : ""
  const categoryBadge = ({
    Web: "bg-blue-600/90 text-white",
    App: "bg-violet-600/90 text-white",
    Ads: "bg-amber-500/95 text-black",
    Design: "bg-pink-600/90 text-white",
  } as Record<string, string>)[category] || "bg-background/90 text-foreground"

  useEffect(() => {
    if (images.length < 2) return
    const timer = window.setTimeout(() => setActiveImage((index) => (index + 1) % images.length), 6000)
    return () => window.clearTimeout(timer)
  }, [activeImage, images.length])

  const changeImage = (direction: -1 | 1) => {
    setActiveImage((index) => (index + direction + images.length) % images.length)
  }

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    const delta = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(delta) < 45 || images.length < 2) return
    changeImage(delta < 0 ? 1 : -1)
    suppressClick.current = true
    window.setTimeout(() => { suppressClick.current = false }, 350)
  }

  const preventClickAfterSwipe = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!suppressClick.current) return
    event.preventDefault()
    event.stopPropagation()
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
      {/* Image */}
      <div
        className="relative aspect-video overflow-hidden bg-muted touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {images.length ? (
          <>
            {primaryHref ? (
              <a href={primaryHref} target="_blank" rel="noopener noreferrer" aria-label={`${title} live preview`} onClick={preventClickAfterSwipe} className="block h-full w-full cursor-pointer">
                <Image src={images[activeImage] || images[0]} alt={`${title} image ${activeImage + 1}`} width={640} height={360} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
              </a>
            ) : (
              <Image src={images[activeImage] || images[0]} alt={`${title} image ${activeImage + 1}`} width={640} height={360} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" quality={75} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
            )}
            {images.length > 1 && (
              <>
                <button type="button" aria-label="Previous project image" onClick={() => changeImage(-1)} className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75">
                  <ChevronLeft size={18} />
                </button>
                <button type="button" aria-label="Next project image" onClick={() => changeImage(1)} className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition hover:bg-black/75">
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/45 px-2 py-1">
                  {images.map((_, index) => (
                    <button key={index} type="button" aria-label={`Show project image ${index + 1}`} onClick={() => setActiveImage(index)} className={`h-1.5 rounded-full transition-all ${activeImage === index ? "w-4 bg-white" : "w-1.5 bg-white/60"}`} />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-muted-foreground">{t.common.image}</span>
          </div>
        )}
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm backdrop-blur ${categoryBadge}`}>
          {category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Title */}
        <h3 className="line-clamp-2 text-lg font-medium leading-snug sm:text-xl">{title}</h3>

        {/* Description */}
        <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted-foreground sm:text-base">{description || t.projects.noDescription}</p>

        {/* Tags */}
        {(project.tags?.length > 0 || project.category_details?.platform || project.category_details?.tool || project.category_details?.format) && (
          <div className="flex flex-wrap gap-2">
            {project.tags?.slice(0, 4).map(tag => (
              <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground sm:text-sm">
                {tag}
              </span>
            ))}
            {[project.category_details?.platform, project.category_details?.tool, project.category_details?.format]
              .filter((value): value is string => Boolean(value?.trim()))
              .map((value) => (
                <span key={value} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground sm:text-sm">
                  {value}
                </span>
              ))}
          </div>
        )}

        {/* Links */}
        <div className="mt-auto flex items-center gap-4 pt-1">
          {primaryHref && (
            <a
              href={primaryHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-foreground transition-colors hover:text-muted-foreground"
            >
              <ExternalLink size={13} />
              {t.projects.liveLink}
            </a>
          )}
          {githubHref && (
            <a
              href={githubHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <GitBranch size={13} />
              {t.projects.githubLink}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
