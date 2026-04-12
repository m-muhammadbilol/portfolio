"use client"

import { useEffect, useRef, useState } from "react"
import { useCursorContext } from "@/components/providers/CursorProvider"
import type { CursorType } from "@/types"

export function CustomCursor() {
  const { cursorType } = useCursorContext()
  const [pos, setPos] = useState({ x: -100, y: -100 })
  const [trailing, setTrailing] = useState({ x: -100, y: -100 })
  const [clicked, setClicked] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const rafRef = useRef<number>(0)
  const trailingRef = useRef({ x: -100, y: -100 })
  const targetRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(pointer: coarse)").matches)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) {
      document.body.classList.remove("custom-cursor")
      return
    }
    document.body.classList.add("custom-cursor")

    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY }
      setPos({ x: e.clientX, y: e.clientY })
    }
    const onDown = () => setClicked(true)
    const onUp = () => setClicked(false)
    const onEnter = (e: MouseEvent) => {
      const t = e.target as Element
      if (t.closest("a,button,[role=button],input,textarea,select")) setHovering(true)
    }
    const onLeave = (e: MouseEvent) => {
      const t = e.target as Element
      if (t.closest("a,button,[role=button],input,textarea,select")) setHovering(false)
    }

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mousedown", onDown)
    document.addEventListener("mouseup", onUp)
    document.addEventListener("mouseover", onEnter)
    document.addEventListener("mouseout", onLeave)

    // Trailing animation
    const animate = () => {
      trailingRef.current = {
        x: trailingRef.current.x + (targetRef.current.x - trailingRef.current.x) * 0.12,
        y: trailingRef.current.y + (targetRef.current.y - trailingRef.current.y) * 0.12,
      }
      setTrailing({ ...trailingRef.current })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      document.body.classList.remove("custom-cursor")
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mousedown", onDown)
      document.removeEventListener("mouseup", onUp)
      document.removeEventListener("mouseover", onEnter)
      document.removeEventListener("mouseout", onLeave)
      cancelAnimationFrame(rafRef.current)
    }
  }, [isMobile])

  if (isMobile) return null

  return <CursorRenderer type={cursorType} pos={pos} trailing={trailing} clicked={clicked} hovering={hovering} />
}

function CursorRenderer({
  type, pos, trailing, clicked, hovering
}: {
  type: CursorType
  pos: { x: number; y: number }
  trailing: { x: number; y: number }
  clicked: boolean
  hovering: boolean
}) {
  const scale = clicked ? 0.8 : hovering ? 1.4 : 1

  const base = {
    position: "fixed" as const,
    pointerEvents: "none" as const,
    zIndex: 99999,
    transform: "translate(-50%, -50%)",
    willChange: "transform",
  }

  switch (type) {
    case "dot":
      return (
        <div style={{ ...base, left: pos.x, top: pos.y, width: 8, height: 8, borderRadius: "50%", background: "currentColor", scale: `${scale}`, transition: "scale 0.15s ease" }} className="text-foreground" />
      )

    case "dot-ring":
      return (
        <>
          <div style={{ ...base, left: pos.x, top: pos.y, width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} className="text-foreground" />
          <div style={{ ...base, left: trailing.x, top: trailing.y, width: 28, height: 28, borderRadius: "50%", border: "1px solid currentColor", opacity: 0.5, scale: `${scale}`, transition: "scale 0.15s ease" }} className="text-foreground" />
        </>
      )

    case "glow":
      return (
        <div style={{ ...base, left: pos.x, top: pos.y, width: 20, height: 20, borderRadius: "50%", background: "currentColor", opacity: 0.15, boxShadow: "0 0 12px 4px currentColor", scale: `${scale}`, transition: "scale 0.15s ease" }} className="text-foreground">
          <div style={{ position: "absolute", inset: "30%", borderRadius: "50%", background: "currentColor", opacity: 0.8 }} />
        </div>
      )

    case "square":
      return (
        <div style={{ ...base, left: pos.x, top: pos.y, width: 10, height: 10, background: "currentColor", scale: `${scale}`, transition: "scale 0.15s ease, transform 0.1s ease" }} className="text-foreground" />
      )

    case "inverted":
      return (
        <div style={{ ...base, left: pos.x, top: pos.y, width: 24, height: 24, borderRadius: "50%", background: "currentColor", mixBlendMode: "difference", scale: `${scale}`, transition: "scale 0.15s ease" }} />
      )

    case "outlined":
      return (
        <>
          <div style={{ ...base, left: pos.x, top: pos.y, width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} className="text-foreground" />
          <div style={{ ...base, left: trailing.x, top: trailing.y, width: 32, height: 32, borderRadius: "50%", border: "1.5px solid currentColor", scale: `${scale}`, transition: "scale 0.15s ease" }} className="text-foreground" />
        </>
      )

    case "crosshair":
      return (
        <div style={{ ...base, left: pos.x, top: pos.y, width: 20, height: 20, scale: `${scale}`, transition: "scale 0.15s ease" }} className="text-foreground">
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "currentColor", transform: "translateY(-50%)" }} />
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "currentColor", transform: "translateX(-50%)" }} />
          <div style={{ position: "absolute", inset: "40%", borderRadius: "50%", border: "1px solid currentColor" }} />
        </div>
      )

    case "pulse":
      return (
        <div style={{ ...base, left: pos.x, top: pos.y }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "currentColor", position: "relative" }} className="text-foreground">
            <div style={{
              position: "absolute", inset: -6, borderRadius: "50%", border: "1px solid currentColor", opacity: 0.4,
              animation: "pulse-ring 1.5s ease-out infinite"
            }} className="text-foreground" />
          </div>
          <style>{`@keyframes pulse-ring { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(2); opacity: 0; } }`}</style>
        </div>
      )

    case "trailing":
      return (
        <>
          <div style={{ ...base, left: pos.x, top: pos.y, width: 7, height: 7, borderRadius: "50%", background: "currentColor" }} className="text-foreground" />
          <div style={{ ...base, left: trailing.x, top: trailing.y, width: 20, height: 20, borderRadius: "50%", background: "currentColor", opacity: 0.2, scale: `${scale}`, transition: "scale 0.15s ease" }} className="text-foreground" />
        </>
      )

    case "micro-ring":
      return (
        <div style={{ ...base, left: pos.x, top: pos.y, width: 18, height: 18, borderRadius: "50%", border: "1px solid currentColor", scale: `${scale}`, transition: "scale 0.15s ease" }} className="text-foreground">
          <div style={{ position: "absolute", inset: "40%", borderRadius: "50%", background: "currentColor" }} />
        </div>
      )

    default:
      return null
  }
}
