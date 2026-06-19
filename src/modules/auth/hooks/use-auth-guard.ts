'use client';

import { useAppStore } from '@/src/shared/store/app-store';
import { useMemo } from 'react';

export function useAuthGuard() {
  const bootstrapped = useAppStore((state) => state.bootstrapped);
  const user = useAppStore((state) => state.user);

  return useMemo(
    () => ({
      isLoading: !bootstrapped,
      isAuthenticated: Boolean(user?.profile),
      user,
    }),
    [bootstrapped, user],
  );
}
