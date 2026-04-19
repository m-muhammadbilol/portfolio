"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/shared/ImageUpload"
import { createClient } from "@supabase/supabase-js"
import type { SiteContent, SiteSettings } from "@/types"

interface Props {
  content: Record<string, SiteContent>
  settings: SiteSettings | null
}

const TABS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
] as const

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring" />
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} rows={props.rows || 3} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
}

export function ContentManager({ content, settings }: Props) {
  const [tab, setTab] = useState<"home" | "about">("home")
  const [saving, setSaving] = useState(false)
  const [homeImage, setHomeImage] = useState(settings?.home_image_url || "")

  const [homeForm, setHomeForm] = useState({
    title_uz: content["home_title"]?.value_uz || "Assalomu alaykum, men Muhammadbilol",
    title_en: content["home_title"]?.value_en || "Hello, I am Muhammadbilol",
    subtitle_uz: content["home_subtitle"]?.value_uz || "Frontend dasturchi",
    subtitle_en: content["home_subtitle"]?.value_en || "Frontend Developer",
    github: settings?.social_github || "",
    telegram: settings?.social_telegram || "",
    instagram: settings?.social_instagram || "",
    youtube: settings?.social_youtube || "",
    facebook: settings?.social_facebook || "",
    twitter: settings?.social_twitter || "",
    linkedin: settings?.social_linkedin || "",
  })

  const [aboutForm, setAboutForm] = useState({
    bio_uz: content["about_bio"]?.value_uz || "",
    bio_en: content["about_bio"]?.value_en || "",
    experience_uz: content["about_experience"]?.value_uz || "",
    experience_en: content["about_experience"]?.value_en || "",
    education_uz: content["about_education"]?.value_uz || "",
    education_en: content["about_education"]?.value_en || "",
    skills: content["about_skills"]?.value_uz || "React,Next.js,TypeScript,Tailwind CSS",
  })

  function getClient() {
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  const upsertContent = async (key: string, uz: string, en: string) => {
    const supabase = getClient()
    const existing = content[key]
    if (existing) {
      await supabase.from("site_content").update({ value_uz: uz, value_en: en, updated_at: new Date().toISOString() }).eq("key", key)
    } else {
      await supabase.from("site_content").insert({ key, value_uz: uz, value_en: en, type: "text" })
    }
  }

  const saveHome = async () => {
    setSaving(true)
    try {
      await upsertContent("home_title", homeForm.title_uz, homeForm.title_en)
      await upsertContent("home_subtitle", homeForm.subtitle_uz, homeForm.subtitle_en)
      const supabase = getClient()
      if (settings?.id) {
        await supabase.from("site_settings").update({
          social_github: homeForm.github,
          social_telegram: homeForm.telegram,
          social_instagram: homeForm.instagram,
          social_youtube: homeForm.youtube,
          social_facebook: homeForm.facebook,
          social_twitter: homeForm.twitter,
          social_linkedin: homeForm.linkedin,
          home_image_url: homeImage,
          updated_at: new Date().toISOString(),
        }).eq("id", settings.id)
      }
      toast.success("Saqlandi!")
    } catch {
      toast.error("Xato yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  const saveAbout = async () => {
    setSaving(true)
    try {
      await upsertContent("about_bio", aboutForm.bio_uz, aboutForm.bio_en)
      await upsertContent("about_experience", aboutForm.experience_uz, aboutForm.experience_en)
      await upsertContent("about_education", aboutForm.education_uz, aboutForm.education_en)
      await upsertContent("about_skills", aboutForm.skills, aboutForm.skills)
      toast.success("Saqlandi!")
    } catch {
      toast.error("Xato yuz berdi")
    } finally {
      setSaving(false)
    }
  }

  const setH = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setHomeForm(p => ({ ...p, [k]: e.target.value }))

  const setA = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setAboutForm(p => ({ ...p, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Kontent</h1>

      <div className="flex border-b border-border">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "home" && (
        <div className="space-y-5 max-w-2xl">
          {/* Image */}
          <div className="p-4 rounded-lg border border-border space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Profil rasmi</h2>
            <ImageUpload value={homeImage} onChange={setHomeImage} bucket="avatars" path="profile" label="Rasm yuklash" />
          </div>

          {/* Title */}
          <div className="p-4 rounded-lg border border-border space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sarlavha</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="O'zbek"><Input value={homeForm.title_uz} onChange={setH("title_uz")} /></Field>
              <Field label="Ingliz"><Input value={homeForm.title_en} onChange={setH("title_en")} /></Field>
            </div>
          </div>

          {/* Subtitle */}
          <div className="p-4 rounded-lg border border-border space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Taglavha</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="O'zbek"><Input value={homeForm.subtitle_uz} onChange={setH("subtitle_uz")} /></Field>
              <Field label="Ingliz"><Input value={homeForm.subtitle_en} onChange={setH("subtitle_en")} /></Field>
            </div>
          </div>

          {/* Social links */}
          <div className="p-4 rounded-lg border border-border space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ijtimoiy tarmoqlar</h2>
            <div className="grid grid-cols-2 gap-3">
              <Field label="GitHub"><Input value={homeForm.github} onChange={setH("github")} placeholder="https://github.com/..." /></Field>
              <Field label="Telegram"><Input value={homeForm.telegram} onChange={setH("telegram")} placeholder="https://t.me/..." /></Field>
              <Field label="Instagram"><Input value={homeForm.instagram} onChange={setH("instagram")} placeholder="https://instagram.com/..." /></Field>
              <Field label="YouTube"><Input value={homeForm.youtube} onChange={setH("youtube")} placeholder="https://youtube.com/..." /></Field>
              <Field label="Facebook"><Input value={homeForm.facebook} onChange={setH("facebook")} placeholder="https://facebook.com/..." /></Field>
              <Field label="Twitter / X"><Input value={homeForm.twitter} onChange={setH("twitter")} placeholder="https://twitter.com/..." /></Field>
              <Field label="LinkedIn"><Input value={homeForm.linkedin} onChange={setH("linkedin")} placeholder="https://linkedin.com/in/..." /></Field>
            </div>
          </div>

          <button onClick={saveHome} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50">
            {saving && <Loader2 size={13} className="animate-spin" />}
            Saqlash
          </button>
        </div>
      )}

      {tab === "about" && (
        <div className="space-y-5 max-w-2xl">
          <div className="p-4 rounded-lg border border-border space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Bio</h2>
            <Field label="O'zbek"><Textarea value={aboutForm.bio_uz} onChange={setA("bio_uz")} rows={4} /></Field>
            <Field label="Ingliz"><Textarea value={aboutForm.bio_en} onChange={setA("bio_en")} rows={4} /></Field>
          </div>
          <div className="p-4 rounded-lg border border-border space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tajriba</h2>
            <Field label="O'zbek"><Textarea value={aboutForm.experience_uz} onChange={setA("experience_uz")} /></Field>
            <Field label="Ingliz"><Textarea value={aboutForm.experience_en} onChange={setA("experience_en")} /></Field>
          </div>
          <div className="p-4 rounded-lg border border-border space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ta&apos;lim</h2>
            <Field label="O'zbek"><Textarea value={aboutForm.education_uz} onChange={setA("education_uz")} /></Field>
            <Field label="Ingliz"><Textarea value={aboutForm.education_en} onChange={setA("education_en")} /></Field>
          </div>
          <div className="p-4 rounded-lg border border-border space-y-3">
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ko&apos;nikmalar (vergul bilan)</h2>
            <Field label="Bir xil ikki tilda"><Input value={aboutForm.skills} onChange={setA("skills")} placeholder="React, Next.js, TypeScript" /></Field>
          </div>
          <button onClick={saveAbout} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50">
            {saving && <Loader2 size={13} className="animate-spin" />}
            Saqlash
          </button>
        </div>
      )}
    </div>
  )
}
