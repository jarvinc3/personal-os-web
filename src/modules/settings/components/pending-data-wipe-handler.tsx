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
import { Trash2, X } from "lucide-react"
import { useState } from "react"

export function PendingDataWipeHandler() {
  const { isAuthenticated } = useAuthGuard()
  const { wipeAfterReauth } = useWipeUserData()
  const [dismissed, setDismissed] = useState(false)
  const [pendingWipe] = useState(() => readPendingDataWipe())

  const confirmOpen = isAuthenticated && pendingWipe !== null && !dismissed

  const handleCancel = () => {
    clearPendingDataWipe()
    setDismissed(true)
  }

  const handleConfirm = () => {
    if (!pendingWipe) {
      return
    }
    clearPendingDataWipe()
    wipeAfterReauth.mutate(pendingWipe, {
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
          {pendingWipe?.layers.map((layer) => (
            <li key={layer} className="text-sm text-muted-foreground">
              • {WIPE_LAYER_LABELS[layer]}
            </li>
          ))}
        </ul>
        <AlertDialogFooter className="flex-row">
          <AlertDialogCancel
            className="flex-1"
            disabled={wipeAfterReauth.isPending}
            onClick={handleCancel}
          >
            <X data-icon="inline-start" />
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="flex-1"
            disabled={wipeAfterReauth.isPending}
            onClick={handleConfirm}
          >
            <Trash2 data-icon="inline-start" />
            {wipeAfterReauth.isPending ? "Vaciando..." : "Vaciar datos"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
