"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

type GalleryTapContextValue = {
  notifyTap: () => void
}

const GalleryTapContext = createContext<GalleryTapContextValue | null>(null)

/**
 * PROVISIONAL (#272): taps inside the gallery never navigate; they only show
 * "Toque simulado". Delete with the gallery in #290.
 */
export function GalleryTapProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (!notice) {
      return
    }
    const timeout = setTimeout(() => setNotice(null), 2400)
    return () => clearTimeout(timeout)
  }, [notice])

  return (
    <GalleryTapContext.Provider
      value={{ notifyTap: () => setNotice("Toque simulado") }}
    >
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4"
      >
        {notice ? (
          <span className="rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg">
            {notice}
          </span>
        ) : null}
      </div>
    </GalleryTapContext.Provider>
  )
}

export function useGalleryTap(): GalleryTapContextValue {
  const value = useContext(GalleryTapContext)
  if (!value) {
    throw new Error("useGalleryTap must be used inside GalleryTapProvider")
  }
  return value
}
