"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { createClient } from "@/lib/supabase/client"
import type { SiteContent, SiteSettings } from "@/types"

const homeSchema = z.object({
  title_uz: z.string(),
  title_en: z.string(),
  subtitle_uz: z.string(),
  subtitle_en: z.string(),
  instagram: z.string(),
  telegram: z.string(),
  github: z.string(),
})

const aboutSchema = z.object({
  bio_uz: z.string(),
  bio_en: z.string(),
  experience_uz: z.string(),
  experience_en: z.string(),
  education_uz: z.string(),
  education_en: z.string(),
  skills: z.string(),
})

type HomeForm = z.infer<typeof homeSchema>
type AboutForm = z.infer<typeof aboutSchema>

interface Props {
  content: Record<string, SiteContent>
  settings: SiteSettings | null
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring ${props.className || ""}`} />
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={props.rows || 3} className={`w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none ${props.className || ""}`} />
}

export function ContentManager({ content, settings }: Props) {
  const [tab, setTab] = useState<"home" | "about">("home")
  const [homeImage, setHomeImage] = useState(settings?.home_image_url || "")
  const supabase = createClient()

  const homeForm = useForm<HomeForm>({
    resolver: zodResolver(homeSchema),
    defaultValues: {
      title_uz: content["home_title"]?.value_uz || "Assalomu alaykum, men Muhammadbilol",
      title_en: content["home_title"]?.value_en || "Hello, I am Muhammadbilol",
      subtitle_uz: content["home_subtitle"]?.value_uz || "Frontend dasturchi",
      subtitle_en: content["home_subtitle"]?.value_en || "Frontend Developer",
      instagram: settings?.social_instagram || "",
      telegram: settings?.social_telegram || "",
      github: settings?.social_github || "",
    },
  })

  const aboutForm = useForm<AboutForm>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      bio_uz: content["about_bio"]?.value_uz || "",
      bio_en: content["about_bio"]?.value_en || "",
      experience_uz: content["about_experience"]?.value_uz || "",
      experience_en: content["about_experience"]?.value_en || "",
      education_uz: content["about_education"]?.value_uz || "",
      education_en: content["about_education"]?.value_en || "",
      skills: content["about_skills"]?.value_uz || "React,Next.js,TypeScript,Tailwind CSS",
    },
  })

  const upsertContent = async (key: string, uz: string, en: string) => {
    const existing = content[key]
    if (existing) {
      await supabase.from("site_content").update({ value_uz: uz, value_en: en, updated_at: new Date().toISOString() }).eq("key", key)
    } else {
      await supabase.from("site_content").insert({ key, value_uz: uz, value_en: en, type: "text" })
    }
  }

  const saveHome = async (data: HomeForm) => {
    try {
      await upsertContent("home_title", data.title_uz, data.title_en)
      await upsertContent("home_subtitle", data.subtitle_uz, data.subtitle_en)
      const settingsId = settings?.id
      if (settingsId) {
        await supabase.from("site_settings").update({
          social_instagram: data.instagram,
          social_telegram: data.telegram,
          social_github: data.github,
          home_image_url: homeImage,
          updated_at: new Date().toISOString(),
        }).eq("id", settingsId)
      }
      toast.success("Home content saved")
    } catch {
      toast.error("Failed to save")
    }
  }

  const saveAbout = async (data: AboutForm) => {
    try {
      await upsertContent("about_bio", data.bio_uz, data.bio_en)
      await upsertContent("about_experience", data.experience_uz, data.experience_en)
      await upsertContent("about_education", data.education_uz, data.education_en)
      await upsertContent("about_skills", data.skills, data.skills)
      toast.success("About content saved")
    } catch {
      toast.error("Failed to save")
    }
  }

  const tabs = [
    { id: "home" as const, label: "Home" },
    { id: "about" as const, label: "About" },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Content</h1>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Home Tab */}
      {tab === "home" && (
        <form onSubmit={homeForm.handleSubmit(saveHome)} className="space-y-6 max-w-2xl">
          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Profile Image</h2>
            <ImageUpload value={homeImage} onChange={setHomeImage} bucket="avatars" path="profile" label="Upload profile image" />
          </div>

          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Uzbek"><Input {...homeForm.register("title_uz")} /></Field>
              <Field label="English"><Input {...homeForm.register("title_en")} /></Field>
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Subtitle</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Uzbek"><Input {...homeForm.register("subtitle_uz")} /></Field>
              <Field label="English"><Input {...homeForm.register("subtitle_en")} /></Field>
            </div>
          </div>

          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Social Links</h2>
            <Field label="Instagram"><Input {...homeForm.register("instagram")} placeholder="https://instagram.com/..." /></Field>
            <Field label="Telegram"><Input {...homeForm.register("telegram")} placeholder="https://t.me/..." /></Field>
            <Field label="GitHub"><Input {...homeForm.register("github")} placeholder="https://github.com/..." /></Field>
          </div>

          <SaveButton loading={homeForm.formState.isSubmitting} />
        </form>
      )}

      {/* About Tab */}
      {tab === "about" && (
        <form onSubmit={aboutForm.handleSubmit(saveAbout)} className="space-y-6 max-w-2xl">
          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bio</h2>
            <Field label="Uzbek"><Textarea {...aboutForm.register("bio_uz")} rows={4} /></Field>
            <Field label="English"><Textarea {...aboutForm.register("bio_en")} rows={4} /></Field>
          </div>

          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Experience</h2>
            <Field label="Uzbek"><Textarea {...aboutForm.register("experience_uz")} /></Field>
            <Field label="English"><Textarea {...aboutForm.register("experience_en")} /></Field>
          </div>

          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Education</h2>
            <Field label="Uzbek"><Textarea {...aboutForm.register("education_uz")} /></Field>
            <Field label="English"><Textarea {...aboutForm.register("education_en")} /></Field>
          </div>

          <div className="space-y-4 p-4 rounded-lg border border-border">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Skills</h2>
            <Field label="Comma separated (same for both languages)">
              <Input {...aboutForm.register("skills")} placeholder="React, Next.js, TypeScript" />
            </Field>
          </div>

          <SaveButton loading={aboutForm.formState.isSubmitting} />
        </form>
      )}
    </div>
  )
}

function SaveButton({ loading }: { loading: boolean }) {
  return (
    <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50">
      {loading && <Loader2 size={13} className="animate-spin" />}
      Save Changes
    </button>
  )
}
