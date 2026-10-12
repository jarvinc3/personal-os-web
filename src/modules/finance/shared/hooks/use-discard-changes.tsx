"use client"

import { useCallback, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"

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
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Descartar los cambios?</AlertDialogTitle>
          <AlertDialogDescription>
            Lo que escribiste no se guardó. Si cierras ahora, se pierde.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              setConfirmOpen(false)
              onOpenChange(false)
            }}
          >
            Descartar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { requestOpenChange, discardChangesDialog }
}
