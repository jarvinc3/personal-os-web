'use client';

import { registerWebPushTokenWithApi } from '@/src/modules/notifications/lib/register-web-push-token';
import {
  getNotificationPermission,
  isWebPushSupported,
} from '@/src/modules/notifications/lib/web-push-support';
import { useAppStore } from '@/src/shared/store/app-store';
import { useCallback, useEffect, useState } from 'react';

export type WebPushPermissionStatus =
  | 'unsupported'
  | 'default'
  | 'granted'
  | 'denied';

export type RequestWebPushPermissionResult =
  | { ok: true; token: string }
  | {
    ok: false;
    reason:
    | 'unsupported'
    | 'denied'
    | 'permission-denied'
    | 'vapid-not-configured'
    | 'service-worker-unavailable'
    | 'unknown';
  };

export function useWebPushPermissions() {
  const pushToken = useAppStore((state) => state.pushToken);
  const setPushToken = useAppStore((state) => state.setPushToken);
  const [permissionStatus, setPermissionStatus] =
    useState<WebPushPermissionStatus>('default');
  const [isRequesting, setIsRequesting] = useState(false);
  const [registrationError, setRegistrationError] = useState<
    'vapid-not-configured' | 'unknown' | null
  >(null);

  const refreshStatus = useCallback(() => {
    if (!isWebPushSupported()) {
      setPermissionStatus('unsupported');
      return;
    }

    const permission = getNotificationPermission();
    if (permission === 'granted') {
      setPermissionStatus('granted');
      return;
    }
    if (permission === 'denied') {
      setPermissionStatus('denied');
      return;
    }
    setPermissionStatus('default');
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus, pushToken]);

  const requestPermission = useCallback(async (): Promise<RequestWebPushPermissionResult> => {
    if (!isWebPushSupported()) {
      return { ok: false, reason: 'unsupported' };
    }

    setIsRequesting(true);
    setRegistrationError(null);

    try {
      const permission = await Notification.requestPermission();
      refreshStatus();

      if (permission !== 'granted') {
        return { ok: false, reason: 'denied' };
      }

      const result = await registerWebPushTokenWithApi();
      if (result.ok) {
        setPushToken(result.token);
        return { ok: true, token: result.token };
      }

      if (result.reason === 'vapid-not-configured') {
        setRegistrationError('vapid-not-configured');
      } else if (result.reason === 'unknown') {
        setRegistrationError('unknown');
      }

      return { ok: false, reason: result.reason };
    } finally {
      setIsRequesting(false);
    }
  }, [refreshStatus, setPushToken]);

  return {
    permissionStatus,
    pushToken,
    isRequesting,
    registrationError,
    refreshStatus,
    requestPermission,
  };
}
