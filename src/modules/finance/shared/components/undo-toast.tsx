"use client"

import { Undo2Icon } from "lucide-react"

import { appToast } from "@/src/shared/lib/app-toast"

/** Success toast with a "Deshacer" action that runs the restore call. */
export function showUndoToast(text1: string, onUndo: () => void) {
  appToast.success({
    text1,
    duration: 8000,
    action: {
      label: (
        <>
          <Undo2Icon className="size-4 shrink-0" />
          Deshacer
        </>
      ),
      onClick: onUndo,
    },
  })
}
