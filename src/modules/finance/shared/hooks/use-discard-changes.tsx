"use client"

import { Trash2Icon, XIcon } from "lucide-react"
import { useCallback, useState } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
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
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>¿Descartar los cambios?</AlertDialogTitle>
          <AlertDialogDescription>
            Lo que escribiste no se guardó. Si cierras ahora, se pierde.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => {
              setConfirmOpen(false)
              onOpenChange(false)
            }}
          >
            <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
            Descartar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  return { requestOpenChange, discardChangesDialog }
}
