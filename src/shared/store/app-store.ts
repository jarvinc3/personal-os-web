import type { AuthSession, AuthUser } from '@/src/modules/auth/types/auth.types';
import { create } from 'zustand';

type AppState = {
  bootstrapped: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  setBootstrapped: (value: boolean) => void;
  setAuthState: (payload: { session: AuthSession | null; user: AuthUser | null }) => void;
  updateAuthUser: (user: AuthUser) => void;
  clearAuthState: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  bootstrapped: false,
  session: null,
  user: null,
  setBootstrapped: (value) => set({ bootstrapped: value }),
  setAuthState: ({ session, user }) => set({ session, user }),
  updateAuthUser: (user) => set({ user }),
  clearAuthState: () => set({ session: null, user: null }),
}));
