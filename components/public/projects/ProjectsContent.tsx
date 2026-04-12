"use client"

import { useState, useEffect, useCallback } from "react"
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

  const allTags = Array.from(new Set(projects.flatMap(p => p.tags || [])))

  const filtered = projects
    .filter(p => p.is_published)
    .filter(p => {
      const title = lang === "en" ? p.title_en : p.title_uz
      const desc = lang === "en" ? p.description_en : p.description_uz
      const q = search.toLowerCase()
      return !q || title.toLowerCase().includes(q) || desc.toLowerCase().includes(q) || p.tags?.some(t => t.toLowerCase().includes(q))
    })
    .filter(p => activeTag === "all" || p.tags?.includes(activeTag))
    .sort((a, b) => a.sort_order - b.sort_order || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return (
    <main className="min-h-screen px-6 py-16 max-w-4xl mx-auto">
      <div className="fixed top-4 right-4 flex items-center gap-1 z-20">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      {/* Back */}
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} />
          {t.nav.home}
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
        <h1 className="text-2xl font-semibold tracking-tight">{t.projects.title}</h1>

        {/* Search + Filter */}
        <div className="space-y-3">
          <div className="relative max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t.projects.search}
              className="w-full pl-8 pr-3 h-8 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag("all")}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${activeTag === "all" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/30"}`}
              >
                {t.projects.filterAll}
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${activeTag === tag ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground/30"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">{t.projects.noProjects}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
