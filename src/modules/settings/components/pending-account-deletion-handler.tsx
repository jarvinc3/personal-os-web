"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { useDeleteAccount } from "@/src/modules/settings/hooks/use-delete-account"
import {
  clearPendingAccountDeletion,
  PENDING_ACCOUNT_DELETION_KEY,
} from "@/src/modules/settings/lib/pending-account-deletion"
import { ConfirmDialog } from "@/src/shared/components/feedback/confirm-dialog"
import { Trash2Icon } from "lucide-react"
import { useState } from "react"

function readPendingAccountDeletion(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  return sessionStorage.getItem(PENDING_ACCOUNT_DELETION_KEY) === "1"
}

export function PendingAccountDeletionHandler() {
  const { isAuthenticated } = useAuthGuard()
  const { deleteAfterReauth } = useDeleteAccount()
  const [dismissed, setDismissed] = useState(false)

  const confirmOpen =
    isAuthenticated && readPendingAccountDeletion() && !dismissed

  const handleCancel = () => {
    clearPendingAccountDeletion()
    setDismissed(true)
  }

  const handleConfirm = () => {
    clearPendingAccountDeletion()
    deleteAfterReauth.mutate(undefined, {
      onSettled: () => setDismissed(true),
    })
  }

  return (
    <ConfirmDialog
      open={confirmOpen}
      onOpenChange={(open) => !open && handleCancel()}
      tone="danger"
      icon={Trash2Icon}
      wide
      title="¿Eliminar tu cuenta permanentemente?"
      description="Confirmaste tu identidad con Google. Esta acción borrará todos tus datos y no se puede deshacer."
      confirmLabel="Eliminar cuenta"
      confirmIcon={Trash2Icon}
      pending={deleteAfterReauth.isPending}
      pendingLabel="Eliminando..."
      onConfirm={handleConfirm}
    />
  )
}
