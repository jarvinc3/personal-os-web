"use client"

import {
  readShareMode,
  shareModeUrl,
  toggleShareSelection,
} from "@/src/modules/finance/planning/lib/receivable-share-mode"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

type ShareModeTarget = {
  active: boolean
  selectedIds: string[]
}

/**
 * Selection mode of the cobros tab, kept in the query so a reload and the share
 * sheet that opens by URL still find the same cobros.
 */
export function useReceivableShareMode() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const query = String(searchParams)
  const { active, selectedIds } = readShareMode(searchParams)

  const apply = useCallback(
    (target: ShareModeTarget) => {
      const url = shareModeUrl({ pathname, query, ...target })
      if (!url) {
        return
      }
      router.replace(url, { scroll: false })
    },
    [pathname, query, router]
  )

  return {
    active,
    selectedIds,
    start: useCallback(() => apply({ active: true, selectedIds: [] }), [apply]),
    selectOnly: useCallback(
      (id: string) => apply({ active: true, selectedIds: [id] }),
      [apply]
    ),
    toggle: useCallback(
      (id: string) =>
        apply({
          active: true,
          selectedIds: toggleShareSelection(selectedIds, id),
        }),
      [apply, selectedIds]
    ),
    selectMany: useCallback(
      (ids: readonly string[]) =>
        apply({ active: true, selectedIds: [...ids] }),
      [apply]
    ),
    exit: useCallback(() => apply({ active: false, selectedIds: [] }), [apply]),
  }
}
