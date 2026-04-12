"use client"

import Image from "next/image"
import { ExternalLink, GitBranch } from "lucide-react"
import { useLanguage } from "@/components/providers/LanguageProvider"
import type { Project } from "@/types"

export function ProjectCard({ project }: { project: Project }) {
  const { lang, t } = useLanguage()

  const title = lang === "en" ? project.title_en : project.title_uz
  const description = lang === "en" ? project.description_en : project.description_uz

  return (
    <div className="group rounded-lg border border-border bg-card overflow-hidden hover:border-foreground/20 transition-all duration-200 hover:shadow-sm">
      {/* Image */}
      <div className="aspect-video bg-muted overflow-hidden">
        {project.image_url ? (
          <Image
            src={project.image_url}
            alt={title}
            width={640}
            height={360}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-muted-foreground">{t.common.image}</span>
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-sm font-medium leading-snug line-clamp-1">{title}</h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{description}</p>
        )}

        {/* Tags */}
        {project.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.slice(0, 4).map(tag => (
              <span key={tag} className="px-2 py-0.5 text-[10px] rounded-full border border-border text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-3 pt-1">
          {project.live_link && (
            <a
              href={project.live_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-foreground hover:text-muted-foreground transition-colors"
            >
              <ExternalLink size={11} />
              {t.projects.liveLink}
            </a>
          )}
          {project.github_link && (
            <a
              href={project.github_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitBranch size={11} />
              {t.projects.githubLink}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
