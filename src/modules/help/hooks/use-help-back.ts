"use client"

import { useBackTo } from "@/src/shared/hooks/use-back-to"

/** Leaves a help subview: previous screen when there is history, otherwise the help index. */
export function useHelpBack(fallbackHref: string): () => void {
  return useBackTo(fallbackHref)
}
