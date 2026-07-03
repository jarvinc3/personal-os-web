'use client';

import { useAuth } from '@/src/modules/auth';
import { useDeleteAccount } from '@/src/modules/settings/hooks/use-delete-account';
import {
  fetchCurrentAuthIdentities,
  hasEmailPasswordProvider,
  isGoogleOnlyAccount,
} from '@/src/modules/settings/lib/auth-providers';
import { setPendingAccountDeletion } from '@/src/modules/settings/lib/pending-account-deletion';
import type { SettingsSheetProps } from '@/src/modules/settings/types/sheet.types';
import { BottomSheet } from '@/src/shared/components/layout/bottom-sheet';
import { FormSection, FormTextField } from '@/src/shared/components/layout/form-blocks';
import { Alert, AlertDescription, AlertTitle } from '@/src/shared/components/ui/alert';
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
import { Button } from '@/src/shared/components/ui/button';
import { Spinner } from '@/src/shared/components/ui/spinner';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { AlertTriangle, KeyRound } from 'lucide-react';
import { useCallback, useState } from 'react';

const DELETED_DATA_ITEMS = [
  'Perfil, preferencias y configuración de módulos',
  'Datos financieros, transacciones y presupuestos',
  'Historial del agente IA y sesiones',
  'Tokens OAuth de Gmail y fuentes conectadas',
  'Tokens push y alertas',
];

type DeleteAccountSheetProps = SettingsSheetProps & {
  email: string;
};

export function DeleteAccountSheet({ open, onOpenChange, email }: DeleteAccountSheetProps) {
  const deleteAccountMutation = useDeleteAccount();
  const { loginWithGoogleMutation } = useAuth();

  const [password, setPassword] = useState('');
  const [alertOpen, setAlertOpen] = useState(false);
  const [canDeleteInApp, setCanDeleteInApp] = useState<boolean | null>(null);
  const [isGoogleOnly, setIsGoogleOnly] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  const loadAuthProviders = useCallback(async () => {
    setIsLoadingProviders(true);
    try {
      const { identities } = await fetchCurrentAuthIdentities();
      if (!identities?.length) {
        setCanDeleteInApp(Boolean(email));
        setIsGoogleOnly(false);
        return;
      }
      setCanDeleteInApp(hasEmailPasswordProvider(identities));
      setIsGoogleOnly(isGoogleOnlyAccount(identities));
    } finally {
      setIsLoadingProviders(false);
    }
  }, [email]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setPassword('');
      setAlertOpen(false);
      void loadAuthProviders();
    }
    onOpenChange(nextOpen);
  };

  const handleContinue = () => {
    if (!password.trim()) return;
    onOpenChange(false);
    setAlertOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteAccountMutation.mutate(
      { email, password },
      { onSettled: () => setAlertOpen(false) },
    );
  };

  const handleGoogleReauth = () => {
    setPendingAccountDeletion();
    onOpenChange(false);
    loginWithGoogleMutation.mutate({ next: APP_ROUTES.app.settings });
  };

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={handleOpenChange}
        title="Eliminar cuenta"
        description="Esta acción es permanente e irreversible."
        actions={{
          delete: canDeleteInApp && (
            <Button
              variant="destructive"
              className="flex-1"
              disabled={!password.trim() || deleteAccountMutation.isPending}
              onClick={handleContinue}
            >
              {deleteAccountMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
              Continuar
            </Button>
          ),
          submit: isGoogleOnly && (
            <Button
              variant="destructive"
              className="flex-1"
              disabled={loginWithGoogleMutation.isPending}
              onClick={handleGoogleReauth}
            >
              {loginWithGoogleMutation.isPending ? <Spinner data-icon="inline-start" /> : null}
              {loginWithGoogleMutation.isPending ? 'Confirmando con Google...' : 'Confirmar con Google'}
            </Button>
          )
        }}
      >
        <FormSection title="Se eliminará" icon={AlertTriangle}>
          <ul className="flex flex-col gap-2">
            {DELETED_DATA_ITEMS.map((item) => (
              <li key={item} className="text-sm leading-relaxed text-muted-foreground">
                • {item}
              </li>
            ))}
          </ul>
        </FormSection>

        {isLoadingProviders ? (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        ) : null}

        {!isLoadingProviders && canDeleteInApp === false && isGoogleOnly ? (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle />
            <AlertTitle>Cuenta vinculada con Google</AlertTitle>
            <AlertDescription>
              Confirma tu identidad con Google para eliminar la cuenta. Serás redirigido a Google
              y, al volver, podrás confirmar la eliminación definitiva.
            </AlertDescription>
          </Alert>
        ) : null}

        {!isLoadingProviders && canDeleteInApp ? (
          <FormSection title="Confirma tu contraseña" icon={KeyRound}>
            <FormTextField
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="Tu contraseña actual"
              value={password}
              onChange={setPassword}
              disabled={deleteAccountMutation.isPending}
            />
            <div className="rounded-2xl bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground">Cuenta</p>
              <p className="mt-1 text-sm text-muted-foreground">{email}</p>
            </div>
          </FormSection>
        ) : null}
      </BottomSheet>

      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tu cuenta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrarán todos los datos asociados a {email}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteAccountMutation.isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteAccountMutation.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteAccountMutation.isPending ? 'Eliminando...' : 'Eliminar cuenta'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
