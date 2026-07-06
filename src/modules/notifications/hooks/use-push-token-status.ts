'use client';

import { useWebPushPermissions } from '@/src/modules/notifications/hooks/use-web-push-permissions';
import { isWebPushSupported } from '@/src/modules/notifications/lib/web-push-support';
import { useAppStore } from '@/src/shared/store/app-store';

export function usePushTokenStatus() {
  const pushToken = useAppStore((state) => state.pushToken);
  const { permissionStatus, isRequesting, registrationError } = useWebPushPermissions();

  return {
    isSupported: isWebPushSupported(),
    permissionStatus,
    pushToken,
    isRequesting,
    registrationError,
    isRegistered: Boolean(pushToken),
  };
}
