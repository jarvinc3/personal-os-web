import { Suspense } from 'react';

import { NotificationsClient } from '@/src/modules/notifications/components/notifications-client';
import { LoadingView } from '@/src/shared/components/layout/loading-view';

export default function NotificationsPage() {
  return (
    <Suspense fallback={<LoadingView variant="screen" />}>
      <NotificationsClient />
    </Suspense>
  );
}
