'use client';

import { useNotificationPreferences } from '@/src/modules/notifications/hooks/use-notification-preferences';
import { registerServiceWorker } from '@/src/modules/notifications/lib/register-service-worker';
import { registerWebPushTokenWithApi } from '@/src/modules/notifications/lib/register-web-push-token';
import { getNotificationPermission, isWebPushSupported } from '@/src/modules/notifications/lib/web-push-support';
import { useAppStore } from '@/src/shared/store/app-store';
import { useEffect } from 'react';

export function usePushToken() {
  const isAuthenticated = useAppStore((state) => Boolean(state.session));
  const setPushToken = useAppStore((state) => state.setPushToken);
  const { isPushEnabled } = useNotificationPreferences();

  useEffect(() => {
    if (!isAuthenticated || !isPushEnabled || !isWebPushSupported()) {
      return;
    }

    if (getNotificationPermission() !== 'granted') {
      return;
    }

    void registerServiceWorker().then(() =>
      registerWebPushTokenWithApi().then((result) => {
        if (result.ok) {
          setPushToken(result.token);
        }
      }),
    );
  }, [isAuthenticated, isPushEnabled, setPushToken]);
}
