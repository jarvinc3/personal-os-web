"use client"

import { Trash2Icon } from "lucide-react"
import { useCallback, useState } from "react"

import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"

type UseDiscardChangesParams = {
  isDirty: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Guards a sheet close so an edit in progress is not lost by a backdrop tap,
 * the Escape key or Cancelar. A successful save calls `onOpenChange` directly.
 */
export function useDiscardChanges({
  isDirty,
  onOpenChange,
}: UseDiscardChangesParams) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  const requestOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && isDirty) {
        setConfirmOpen(true)
        return
      }
      onOpenChange(nextOpen)
    },
    [isDirty, onOpenChange]
  )

  const discardChangesDialog = (
    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={setConfirmOpen}
      tone="danger"
      icon={Trash2Icon}
      title="¿Descartar los cambios?"
      description="Lo que escribiste no se guardó. Si cierras ahora, se pierde."
      confirmLabel="Descartar"
      confirmIcon={Trash2Icon}
      onConfirm={() => {
        setConfirmOpen(false)
        onOpenChange(false)
      }}
    />
  )

  return { requestOpenChange, discardChangesDialog }
}
