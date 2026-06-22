'use client';

import { useAuthBootstrap } from '@/src/modules/auth/hooks/use-auth-bootstrap';
import type { ReactNode } from 'react';

export function AuthBootstrapProvider({ children }: { children: ReactNode }) {
  useAuthBootstrap();
  return children;
}
