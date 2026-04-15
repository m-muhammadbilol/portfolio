"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { motion } from "framer-motion"

const schema = z.object({
  username: z.string().min(1, "Required"),
  password: z.string().min(1, "Required"),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState("")

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError("")
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || "Invalid credentials")
        return
      }
      toast.success("Welcome back")
      router.push("/admin")
      router.refresh()
    } catch {
      setError("Something went wrong")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        <div className="mb-9 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-2 text-base text-muted-foreground">Sign in to manage your portfolio</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Username
            </label>
            <input
              {...register("username")}
              autoComplete="username"
              className="h-11 w-full rounded-md border border-border bg-background px-4 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="muhammadbilol"
            />
            {errors.username && (
              <p className="mt-1.5 text-sm text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              Password
            </label>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
              className="h-11 w-full rounded-md border border-border bg-background px-4 text-base focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.password && (
              <p className="mt-1.5 text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-foreground text-base font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </main>
  )
}
