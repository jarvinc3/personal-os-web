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
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/src/shared/components/ui/alert-dialog"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { Trash2Icon, XIcon } from "lucide-react"
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
      onOpenChange={(open) => {
        if (!open && !deleteAfterReauth.isPending) {
          handleCancel()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2Icon aria-hidden="true" />
          </AlertDialogMedia>
          <AlertDialogTitle>
            ¿Eliminar tu cuenta permanentemente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Confirmaste tu identidad con Google. Esta acción borrará todos tus
            datos y no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteAfterReauth.isPending}>
            <XIcon className="size-4 shrink-0" aria-hidden="true" />
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteAfterReauth.isPending}
            onClick={handleConfirm}
          >
            {deleteAfterReauth.isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <Trash2Icon className="size-4 shrink-0" aria-hidden="true" />
            )}
            {deleteAfterReauth.isPending ? "Eliminando..." : "Eliminar cuenta"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
