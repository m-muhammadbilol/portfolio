"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import { useCursorContext } from "@/components/providers/CursorProvider"
import type { SiteSettings, CursorType } from "@/types"

const cursors: { id: CursorType; label: string }[] = [
  { id: "dot", label: "Dot" },
  { id: "dot-ring", label: "Dot + Ring" },
  { id: "glow", label: "Glow" },
  { id: "square", label: "Square" },
  { id: "inverted", label: "Inverted Circle" },
  { id: "outlined", label: "Outlined Circle" },
  { id: "crosshair", label: "Crosshair" },
  { id: "pulse", label: "Pulse" },
  { id: "trailing", label: "Trailing" },
  { id: "micro-ring", label: "Micro Ring" },
]

const usernameSchema = z.object({
  newUsername: z.string().min(3, "Min 3 characters"),
  currentPassword: z.string().min(1, "Required"),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(6, "Min 6 characters"),
  confirmPassword: z.string().min(1, "Required"),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords don't match", path: ["confirmPassword"] })

export function SettingsManager({ settings }: { settings: SiteSettings | null }) {
  const { setCursorType, cursorType } = useCursorContext()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()
  const [savingCursor, setSavingCursor] = useState(false)

  const unameForm = useForm({ resolver: zodResolver(usernameSchema), defaultValues: { newUsername: "", currentPassword: "" } })
  const passForm = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } })

  const saveCursor = async (cursor: CursorType) => {
    setCursorType(cursor)
    setSavingCursor(true)
    try {
      if (settings?.id) {
        await supabase.from("site_settings").update({ active_cursor: cursor, updated_at: new Date().toISOString() }).eq("id", settings.id)
      }
      toast.success("Cursor updated")
    } finally {
      setSavingCursor(false)
    }
  }

  const changeUsername = async (data: { newUsername: string; currentPassword: string }) => {
    const res = await fetch("/api/admin/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "username", ...data }),
    })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error || "Failed"); return }
    toast.success("Username updated")
    unameForm.reset()
  }

  const changePassword = async (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const res = await fetch("/api/admin/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "password", currentPassword: data.currentPassword, newPassword: data.newPassword }),
    })
    const json = await res.json()
    if (!res.ok) { toast.error(json.error || "Failed"); return }
    toast.success("Password updated")
    passForm.reset()
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-lg font-semibold">Settings</h1>

      {/* Theme */}
      <Section title="Theme">
        <div className="flex gap-2">
          {["light", "dark", "system"].map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`px-3 py-1.5 text-xs rounded-md border capitalize transition-colors ${theme === t ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      {/* Cursor */}
      <Section title="Cursor Style" extra={savingCursor ? <Loader2 size={12} className="animate-spin text-muted-foreground" /> : null}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {cursors.map(c => (
            <button
              key={c.id}
              onClick={() => saveCursor(c.id)}
              className={`px-3 py-2 text-xs rounded-md border text-left transition-colors ${cursorType === c.id ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Change Username */}
      <Section title="Change Username">
        <form onSubmit={unameForm.handleSubmit(changeUsername)} className="space-y-3">
          <FormField label="New username" error={unameForm.formState.errors.newUsername?.message}>
            <input {...unameForm.register("newUsername")} className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
          <FormField label="Current password" error={unameForm.formState.errors.currentPassword?.message}>
            <input {...unameForm.register("currentPassword")} type="password" className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
          <SubmitBtn loading={unameForm.formState.isSubmitting} label="Update username" />
        </form>
      </Section>

      {/* Change Password */}
      <Section title="Change Password">
        <form onSubmit={passForm.handleSubmit(changePassword)} className="space-y-3">
          <FormField label="Current password" error={passForm.formState.errors.currentPassword?.message}>
            <input {...passForm.register("currentPassword")} type="password" className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
          <FormField label="New password" error={passForm.formState.errors.newPassword?.message}>
            <input {...passForm.register("newPassword")} type="password" className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
          <FormField label="Confirm password" error={passForm.formState.errors.confirmPassword?.message}>
            <input {...passForm.register("confirmPassword")} type="password" className="w-full h-9 px-3 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-ring" />
          </FormField>
          <SubmitBtn loading={passForm.formState.isSubmitting} label="Update password" />
        </form>
      </Section>
    </div>
  )
}

function Section({ title, children, extra }: { title: string; children: React.ReactNode; extra?: React.ReactNode }) {
  return (
    <div className="space-y-4 p-5 rounded-lg border border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{title}</h2>
        {extra}
      </div>
      {children}
    </div>
  )
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50">
      {loading && <Loader2 size={12} className="animate-spin" />}
      {label}
    </button>
  )
}
