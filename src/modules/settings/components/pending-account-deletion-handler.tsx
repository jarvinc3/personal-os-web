'use client';

import { useAuthGuard } from '@/src/modules/auth';
import { useDeleteAccount } from '@/src/modules/settings/hooks/use-delete-account';
import {
  clearPendingAccountDeletion,
  PENDING_ACCOUNT_DELETION_KEY,
} from '@/src/modules/settings/lib/pending-account-deletion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/shared/components/ui/alert-dialog';
import { useState } from 'react';

function readPendingAccountDeletion(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(PENDING_ACCOUNT_DELETION_KEY) === '1';
}

export function PendingAccountDeletionHandler() {
  const { isAuthenticated } = useAuthGuard();
  const { deleteAfterReauth } = useDeleteAccount();
  const [dismissed, setDismissed] = useState(false);

  const confirmOpen = isAuthenticated && readPendingAccountDeletion() && !dismissed;

  const handleCancel = () => {
    clearPendingAccountDeletion();
    setDismissed(true);
  };

  const handleConfirm = () => {
    clearPendingAccountDeletion();
    deleteAfterReauth.mutate(undefined, {
      onSettled: () => setDismissed(true),
    });
  };

  return (
    <AlertDialog open={confirmOpen} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar tu cuenta permanentemente?</AlertDialogTitle>
          <AlertDialogDescription>
            Confirmaste tu identidad con Google. Esta acción borrará todos tus datos y no se puede
            deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteAfterReauth.isPending} onClick={handleCancel}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction disabled={deleteAfterReauth.isPending} onClick={handleConfirm}>
            {deleteAfterReauth.isPending ? 'Eliminando...' : 'Eliminar cuenta'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
