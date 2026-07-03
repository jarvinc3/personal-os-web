import { ApiError, apiGet } from '@/src/config/api-client';
import type { AuthUser } from '@/src/modules/auth/types/auth.types';
import type { UserProfile } from '@/src/modules/settings/types/profile.types';
import { API_ENDPOINTS } from '@/src/shared/constants/api-endpoints';

export const PROFILE_QUERY_KEY = ['profile', 'me'] as const;

export class BackendProfileUnavailableError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'BackendProfileUnavailableError';
  }
}

function isValidUserProfile(profile: UserProfile | null | undefined): profile is UserProfile {
  return Boolean(profile?.id && profile.email);
}

export async function fetchUserProfileRequired(): Promise<UserProfile> {
  try {
    const profile = await apiGet<UserProfile>(API_ENDPOINTS.USERS.GET_ME);

    if (!isValidUserProfile(profile)) {
      throw new BackendProfileUnavailableError(
        'El servidor no devolvió un perfil de usuario válido.',
      );
    }

    return profile;
  } catch (error) {
    if (error instanceof BackendProfileUnavailableError) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (error.status === 404) {
        throw new BackendProfileUnavailableError(
          'Tu cuenta no está registrada en el sistema. Contacta soporte.',
          error,
        );
      }

      if (error.status >= 500) {
        throw new BackendProfileUnavailableError(
          'El servidor no está disponible. Intenta más tarde.',
          error,
        );
      }

      throw new BackendProfileUnavailableError(
        error.message || 'No se pudo verificar tu cuenta con el servidor.',
        error,
      );
    }

    throw new BackendProfileUnavailableError(
      'No se pudo conectar con el servidor. Comprueba que el servidor esté en marcha.',
      error,
    );
  }
}

export function mergeAuthUserWithProfile(user: AuthUser, profile: UserProfile): AuthUser {
  return {
    ...user,
    profile,
    email: profile.email ?? user.email,
    fullName: profile.fullName ?? user.fullName,
    avatarUrl: profile.avatarUrl ?? user.avatarUrl ?? undefined,
  };
}

export async function hydrateAuthUser(user: AuthUser): Promise<AuthUser> {
  const profile = await fetchUserProfileRequired();
  return mergeAuthUserWithProfile(user, profile);
}
