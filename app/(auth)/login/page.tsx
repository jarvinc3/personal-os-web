'use client';

import { useAuthGuard } from '@/src/modules/auth';
import { AuthLandingScreen } from '@/src/modules/auth/components/auth-landing-screen';
import { LoadingView } from '@/src/shared/components/layout/loading-view';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthGuard();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(APP_ROUTES.app.home);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingView variant="screen" />;
  }

  if (isAuthenticated) {
    return <LoadingView variant="screen" />;
  }

  return <AuthLandingScreen />;
}
