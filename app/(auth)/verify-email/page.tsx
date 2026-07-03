import { LoadingView } from '@/src/shared/components/layout/loading-view';
import { Suspense } from 'react';
import VerifyEmailPage from './verify-email-client';

export default function VerifyEmailRoute() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <VerifyEmailPage />
    </Suspense>
  );
}
