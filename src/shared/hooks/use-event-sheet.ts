"use client"

import { useCallback, useEffect, useState } from "react"

import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"

type EventSheet = {
  open: boolean
  /** Opens the sheet and remembers that this render knows its content. */
  openSheet: () => void
  closeSheet: () => void
  /** For the `onOpenChange` of a `Drawer`. */
  onOpenChange: (open: boolean) => void
}

/**
 * Sheet whose content lives in memory (a parsed capture, a chosen target): it
 * still writes its key to the URL so Back closes it, and after a reload it
 * closes itself and leaves the URL clean instead of showing an empty sheet.
 */
export function useEventSheet(key: string): EventSheet {
  const { open, setOpen } = useSheetParam(key)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (open && !armed) {
      setOpen(false)
    }
  }, [open, armed, setOpen])

  const openSheet = useCallback(() => {
    setArmed(true)
    setOpen(true)
  }, [setOpen])

  const closeSheet = useCallback(() => {
    setArmed(false)
    setOpen(false)
  }, [setOpen])

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        openSheet()
        return
      }
      closeSheet()
    },
    [openSheet, closeSheet]
  )

  return { open, openSheet, closeSheet, onOpenChange }
}
