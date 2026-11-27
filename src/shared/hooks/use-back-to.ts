"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

/**
 * Vuelve a la pantalla anterior. Si la ruta se abrió directo por URL no hay
 * historial propio y navega al padre.
 */
export function useBackTo(fallbackHref: string): () => void {
  const router = useRouter()

  return useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(fallbackHref)
  }, [fallbackHref, router])
}
