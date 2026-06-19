'use client';

import {
  AuthServiceError,
  supabaseAuthService,
} from '@/src/modules/auth/services/supabase-auth.service';
import { apiDelete } from '@/src/shared/config/api-client';
import { getSupabaseBrowserClient } from '@/src/shared/config/supabase/client';
import { API_ENDPOINTS } from '@/src/shared/constants/api-endpoints';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { appToast } from '@/src/shared/lib/app-toast';
import { useAppStore } from '@/src/shared/store/app-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

type DeleteAccountPayload = {
  email: string;
  password: string;
};

async function deleteAccountCore() {
  await apiDelete<{ success: boolean }>(API_ENDPOINTS.USERS.DELETE_ME);
  await supabaseAuthService.logout().catch(() => undefined);
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearAuthState = useAppStore((state) => state.clearAuthState);

  const mutation = useMutation({
    mutationFn: async ({ email, password }: DeleteAccountPayload) => {
      const { error: reauthError } = await getSupabaseBrowserClient().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (reauthError) {
        throw new AuthServiceError(
          reauthError.message || 'La contraseña no es correcta.',
          reauthError.code,
          reauthError,
        );
      }

      await deleteAccountCore();
    },
    onSuccess: async () => {
      clearAuthState();
      await queryClient.clear();
      appToast.success({
        text1: 'Cuenta eliminada',
        text2: 'Tu cuenta y datos asociados fueron eliminados.',
      });
      router.replace(APP_ROUTES.auth.login);
    },
    onError: (error) => {
      appToast.error({
        text1: 'No se pudo eliminar la cuenta',
        text2: error instanceof AuthServiceError ? error.message : error.message,
      });
    },
  });

  const deleteAfterReauth = useMutation({
    mutationFn: deleteAccountCore,
    onSuccess: async () => {
      clearAuthState();
      await queryClient.clear();
      appToast.success({
        text1: 'Cuenta eliminada',
        text2: 'Tu cuenta y datos asociados fueron eliminados.',
      });
      router.replace(APP_ROUTES.auth.login);
    },
    onError: (error) => {
      appToast.error({
        text1: 'No se pudo eliminar la cuenta',
        text2: error.message,
      });
    },
  });

  return {
    ...mutation,
    deleteAfterReauth,
  };
}

export type { DeleteAccountPayload };
