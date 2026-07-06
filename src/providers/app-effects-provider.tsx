'use client';

import { useAiSocket } from '@/src/modules/ai/hooks/use-ai-socket';
import { useNotificationsSocket } from '@/src/modules/notifications/hooks/use-notifications-socket';
import { usePushToken } from '@/src/modules/notifications/hooks/use-push-token';

function AppEffects() {
  useNotificationsSocket();
  useAiSocket();
  usePushToken();
  return null;
}

export function AppEffectsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppEffects />
      {children}
    </>
  );
}
