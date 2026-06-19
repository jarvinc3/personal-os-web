import { PROFILE_QUERY_KEY } from '@/src/modules/auth/lib/hydrate-auth-user';
import { queryClient } from '@/src/shared/config/query-client';
import { getSupabaseBrowserClient } from '@/src/shared/config/supabase/client';
import { useAppStore } from '@/src/shared/store/app-store';
import { toast } from 'sonner';

type RevokeAuthSessionOptions = {
  message?: string;
  title?: string;
};

export async function revokeAuthSession(options?: RevokeAuthSessionOptions) {
  useAppStore.getState().clearAuthState();
  void queryClient.removeQueries({ queryKey: PROFILE_QUERY_KEY });
  await getSupabaseBrowserClient().auth.signOut().catch(() => undefined);

  toast.error(options?.title ?? 'No se pudo completar el inicio de sesión', {
    description:
      options?.message ??
      'El servidor no está disponible o tu cuenta no está lista. Intenta más tarde.',
  });
}
