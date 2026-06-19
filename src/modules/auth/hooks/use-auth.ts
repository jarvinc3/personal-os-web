'use client';

import {
  BackendProfileUnavailableError,
  hydrateAuthUser,
  PROFILE_QUERY_KEY,
} from '@/src/modules/auth/lib/hydrate-auth-user';
import { revokeAuthSession } from '@/src/modules/auth/lib/revoke-auth-session';
import {
  AuthServiceError,
  REGISTER_PENDING_VERIFICATION,
  supabaseAuthService,
} from '@/src/modules/auth/services/supabase-auth.service';
import type { LoginPayload, RegisterPayload } from '@/src/modules/auth/types/auth.types';
import { APP_ROUTES, authVerifyEmailHref } from '@/src/shared/constants/app-routes';
import { useAppStore } from '@/src/shared/store/app-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const clearAuthState = useAppStore((state) => state.clearAuthState);

  const applySessionWithProfile = async (
    payload: Awaited<ReturnType<typeof supabaseAuthService.login>>,
  ) => {
    try {
      const hydrated = await hydrateAuthUser(payload.user);
      useAppStore.getState().setAuthState({ session: payload.session, user: hydrated });
      queryClient.setQueryData(PROFILE_QUERY_KEY, hydrated.profile);
      return hydrated;
    } catch (error) {
      await revokeAuthSession({
        message:
          error instanceof BackendProfileUnavailableError
            ? error.message
            : 'No se pudo verificar tu cuenta con el servidor.',
      });
      throw error;
    }
  };

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => supabaseAuthService.login(payload),
    onSuccess: async (payload) => {
      await applySessionWithProfile(payload);
      toast.success('Sesión iniciada', { description: 'Bienvenido de nuevo' });
      router.push(APP_ROUTES.app.home);
    },
    onError: (error) => {
      if (error instanceof BackendProfileUnavailableError) {
        return;
      }
      toast.error('No se pudo iniciar sesión', { description: error.message });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (payload: RegisterPayload) => supabaseAuthService.register(payload),
    onSuccess: async (payload) => {
      await applySessionWithProfile(payload);
      router.push(APP_ROUTES.app.home);
    },
    onError: (error, variables) => {
      if (error instanceof BackendProfileUnavailableError) {
        return;
      }
      if (error instanceof AuthServiceError && error.code === REGISTER_PENDING_VERIFICATION) {
        router.push(authVerifyEmailHref(variables.email));
        return;
      }

      toast.error('No se pudo crear la cuenta', { description: error.message });
    },
  });

  const loginWithGoogleMutation = useMutation({
    mutationFn: (options?: { next?: string }) =>
      supabaseAuthService.loginWithGoogle?.(options) ?? Promise.resolve(),
    onError: (error) => {
      toast.error('No se pudo iniciar el flujo con Google', { description: error.message });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => supabaseAuthService.logout(),
    onSuccess: async () => {
      clearAuthState();
      toast.success('Sesión cerrada');
      await queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY });
      router.push(APP_ROUTES.auth.login);
    },
    onError: (error) => {
      toast.error('No se pudo cerrar sesión', { description: error.message });
    },
  });

  return {
    loginMutation,
    registerMutation,
    loginWithGoogleMutation,
    logoutMutation,
  };
}
