"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { LanguageToggle } from "@/components/shared/LanguageToggle"
import { ProjectCard } from "./ProjectCard"
import { useLanguage } from "@/components/providers/LanguageProvider"
import type { Project } from "@/types"

const categories = ["Web", "App", "Ads", "Design"]

export function ProjectsContent({ initialProjects }: { initialProjects: Project[] }) {
  const { lang, t } = useLanguage()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  const filtered = initialProjects
    .filter(p => p.is_published)
    .filter(p => {
      const title = lang === "en" ? p.title_en : p.title_uz
      const desc = lang === "en" ? p.description_en : p.description_uz
      const q = search.toLowerCase()
      return !q || title.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q))
    })
    .filter(p => activeCategory === "all" || (p.category || "").toLowerCase() === activeCategory.toLowerCase())
    .sort((a, b) => a.sort_order - b.sort_order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-20 sm:py-24">
      <div className="fixed top-4 right-4 z-20 flex items-center gap-1">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Back */}
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={14} />
          {t.nav.home}
        </Link>
      </div>

      <div className="space-y-10">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{t.projects.title}</h1>

        {/* Search + Filter */}
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.projects.search}
              className="h-11 w-full rounded-md border border-border bg-background pl-11 pr-4 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${activeCategory === "all" ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/30"}`}
              >
                {t.projects.filterAll}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${activeCategory === category ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/30"}`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-base text-muted-foreground">{t.projects.noProjects}</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <div key={project.id} className="h-full">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
