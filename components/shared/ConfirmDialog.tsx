"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
}

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = "Confirm", cancelLabel = "Cancel" }: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const handleConfirm = async () => {
    setLoading(true)
    try { await onConfirm() } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-sm mx-4 shadow-lg">
        <h3 className="mb-2 text-lg font-medium">{title}</h3>
        <p className="mb-6 text-base text-muted-foreground">{description}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2.5 text-base transition-colors hover:bg-accent"
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 rounded-md bg-destructive px-4 py-2.5 text-base text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
            disabled={loading}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
