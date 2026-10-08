"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { useWipeUserData } from "@/src/modules/settings/hooks/use-wipe-user-data"
import {
  clearPendingDataWipe,
  readPendingDataWipe,
} from "@/src/modules/settings/lib/pending-data-wipe"
import { WIPE_LAYER_LABELS } from "@/src/modules/settings/lib/wipe-layers"
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
import { useState } from "react"

export function PendingDataWipeHandler() {
  const { isAuthenticated } = useAuthGuard()
  const { wipeAfterReauth } = useWipeUserData()
  const [dismissed, setDismissed] = useState(false)
  const [pendingLayers] = useState(() => readPendingDataWipe())

  const confirmOpen = isAuthenticated && pendingLayers !== null && !dismissed

  const handleCancel = () => {
    clearPendingDataWipe()
    setDismissed(true)
  }

  const handleConfirm = () => {
    if (!pendingLayers) {
      return
    }
    clearPendingDataWipe()
    wipeAfterReauth.mutate(pendingLayers, {
      onSettled: () => setDismissed(true),
    })
  }

  return (
    <AlertDialog
      open={confirmOpen}
      onOpenChange={(open) => !open && handleCancel()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Vaciar los datos seleccionados?</AlertDialogTitle>
          <AlertDialogDescription>
            Confirmaste tu identidad con Google. Esto no se puede deshacer. Se
            vaciarán:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ul className="flex flex-col gap-2">
          {pendingLayers?.map((layer) => (
            <li key={layer} className="text-sm text-muted-foreground">
              • {WIPE_LAYER_LABELS[layer]}
            </li>
          ))}
        </ul>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={wipeAfterReauth.isPending}
            onClick={handleCancel}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={wipeAfterReauth.isPending}
            onClick={handleConfirm}
          >
            {wipeAfterReauth.isPending ? "Vaciando..." : "Vaciar datos"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
