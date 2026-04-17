"use client"

import Image from "next/image"
import { ExternalLink, GitBranch } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import type { Project } from "@/types"

export function ProjectCard({ project }: { project: Project }) {
  const { lang, t } = useLanguage()

  const title = lang === "en" ? project.title_en : project.title_uz
  const description = lang === "en" ? project.description_en : project.description_uz
  const primaryHref = project.live_link?.trim() || ""
  const githubHref = project.github_link?.trim() || ""

  return (
    <div className="group overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:border-foreground/20 hover:shadow-sm">
      {/* Image */}
      <div className="aspect-video bg-muted overflow-hidden">
        {primaryHref ? (
          <a
            href={primaryHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${title} live preview`}
            className="block h-full w-full cursor-pointer"
          >
            {project.image_url ? (
              <Image
                src={project.image_url}
                alt={title}
                width={640}
                height={360}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-sm text-muted-foreground">{t.common.image}</span>
              </div>
            )}
          </a>
        ) : project.image_url ? (
          <Image
            src={project.image_url}
            alt={title}
            width={640}
            height={360}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-sm text-muted-foreground">{t.common.image}</span>
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        {/* Title */}
        <h3 className="line-clamp-2 text-lg font-medium leading-snug sm:text-xl">{title}</h3>

        {/* Description */}
        {description && (
          <p className="line-clamp-3 text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
        )}

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.tags.slice(0, 4).map(tag => (
              <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground sm:text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-4 pt-1">
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
