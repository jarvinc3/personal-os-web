"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

/** Leaves a help subview: previous screen when there is history, otherwise the help index. */
export function useHelpBack(fallbackHref: string): () => void {
  const router = useRouter()

  return useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(fallbackHref)
  }, [fallbackHref, router])
}
