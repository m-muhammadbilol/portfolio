"use client"

import React, { createContext, useContext, useState } from "react"
import type { CursorType } from "@/types"

interface CursorContextType {
  cursorType: CursorType
  setCursorType: (c: CursorType) => void
}

const CursorContext = createContext<CursorContextType>({
  cursorType: "dot",
  setCursorType: () => {},
})

export function CursorProvider({ children, initialCursor = "dot" }: { children: React.ReactNode; initialCursor?: CursorType }) {
  const [cursorType, setCursorType] = useState<CursorType>(initialCursor)

  return (
    <CursorContext.Provider value={{ cursorType, setCursorType }}>
      {children}
    </CursorContext.Provider>
  )
}

export function useCursorContext() {
  return useContext(CursorContext)
}
