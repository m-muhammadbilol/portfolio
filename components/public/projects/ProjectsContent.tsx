"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowLeft, Search } from "lucide-react"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { LanguageToggle } from "@/components/shared/LanguageToggle"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { ProjectCard } from "./ProjectCard"
import { useLanguage } from "@/components/providers/LanguageProvider"
import { createClient } from "@/lib/supabase/client"
import type { Project } from "@/types"

const techFilters = [
  { id: "javascript", label: "JS" },
  { id: "typescript", label: "TS" },
  { id: "react", label: "REACT" },
] as const

function matchesTechFilter(project: Project, filterId: string) {
  const tags = project.tags?.map((tag) => tag.toLowerCase()) || []

  if (filterId === "javascript") {
    return tags.some((tag) => tag === "js" || tag.includes("javascript"))
  }

  if (filterId === "typescript") {
    return tags.some((tag) => tag === "ts" || tag.includes("typescript"))
  }

  if (filterId === "react") {
    return tags.some((tag) => tag.includes("react") || tag.includes("next"))
  }

  return true
}

export function ProjectsContent({ initialProjects }: { initialProjects: Project[] }) {
  const { lang, t } = useLanguage()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [loading] = useState(false)
  const [search, setSearch] = useState("")
  const [activeTag, setActiveTag] = useState<string>("all")

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel("projects-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, payload => {
        if (payload.eventType === "INSERT") {
          setProjects(prev => [payload.new as Project, ...prev])
        } else if (payload.eventType === "UPDATE") {
          setProjects(prev => prev.map(p => p.id === payload.new.id ? payload.new as Project : p))
        } else if (payload.eventType === "DELETE") {
          setProjects(prev => prev.filter(p => p.id !== payload.old.id))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const filtered = projects
    .filter(p => p.is_published)
    .filter(p => {
      const title = lang === "en" ? p.title_en : p.title_uz
      const desc = lang === "en" ? p.description_en : p.description_uz
      const q = search.toLowerCase()
      return !q || title.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q))
    })
    .filter(p => activeTag === "all" || matchesTechFilter(p, activeTag))
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

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-10">
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

          {techFilters.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag("all")}
                className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${activeTag === "all" ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/30"}`}
              >
                {t.projects.filterAll}
              </button>
              {techFilters.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTag(id)}
                  className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${activeTag === id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground/30"}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-base text-muted-foreground">{t.projects.noProjects}</div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project, i) => (
              <motion.div key={project.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}>
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </main>
  )
}
