"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { useWipeUserData } from "@/src/modules/settings/hooks/use-wipe-user-data"
import {
  clearPendingDataWipe,
  readPendingDataWipe,
} from "@/src/modules/settings/lib/pending-data-wipe"
import { WIPE_LAYER_LABELS } from "@/src/modules/settings/lib/wipe-layers"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { Trash2Icon } from "lucide-react"
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
    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={(open) => !open && handleCancel()}
      tone="danger"
      icon={Trash2Icon}
      title="¿Vaciar los datos seleccionados?"
      description="Confirmaste tu identidad con Google. Esto no se puede deshacer. Se vaciarán:"
      confirmLabel="Vaciar datos"
      confirmIcon={Trash2Icon}
      pending={wipeAfterReauth.isPending}
      pendingLabel="Vaciando..."
      onConfirm={handleConfirm}
    >
      <ul className="flex flex-col gap-2">
        {pendingWipe?.layers.map((layer) => (
          <li key={layer} className="text-sm text-muted-foreground">
            • {WIPE_LAYER_LABELS[layer]}
          </li>
        ))}
      </ul>
    </ConfirmDialog>
  )
}
