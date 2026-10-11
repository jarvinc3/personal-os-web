"use client"

import { useAuthGuard } from "@/src/modules/auth"
import { useDeleteAccount } from "@/src/modules/settings/hooks/use-delete-account"
import {
  clearPendingAccountDeletion,
  PENDING_ACCOUNT_DELETION_KEY,
} from "@/src/modules/settings/lib/pending-account-deletion"
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
    <AlertDialog
      open={confirmOpen}
      onOpenChange={(open) => !open && handleCancel()}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Eliminar tu cuenta permanentemente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Confirmaste tu identidad con Google. Esta acción borrará todos tus
            datos y no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row">
          <AlertDialogCancel
            className="flex-1"
            disabled={deleteAfterReauth.isPending}
            onClick={handleCancel}
          >
            <X data-icon="inline-start" />
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            className="flex-1"
            disabled={deleteAfterReauth.isPending}
            onClick={handleConfirm}
          >
            {deleteAfterReauth.isPending ? null : (
              <Trash2 data-icon="inline-start" />
            )}
            {deleteAfterReauth.isPending ? "Eliminando..." : "Eliminar cuenta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
