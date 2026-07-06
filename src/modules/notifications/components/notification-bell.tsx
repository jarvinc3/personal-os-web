'use client';

import { useNotificationPreferences } from '@/src/modules/notifications/hooks/use-notification-preferences';
import { useUnreadNotificationCount } from '@/src/modules/notifications/hooks/use-unread-notification-count';
import { Button } from '@/src/shared/components/ui/button';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { cn } from '@/src/shared/lib/utils';
import { BellIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function NotificationBell() {
  const router = useRouter();
  const { isInAppEnabled } = useNotificationPreferences();
  const unreadQuery = useUnreadNotificationCount();
  const unreadCount = isInAppEnabled ? (unreadQuery.data?.count ?? 0) : 0;

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative shrink-0"
      onClick={() => router.push(APP_ROUTES.app.notifications)}
      aria-label="Centro de notificaciones"
    >
      <BellIcon />
      {unreadCount > 0 ? (
        <span
          className={cn(
            'absolute -top-1 -right-1 flex min-w-4 h-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white',
          )}
        >
          {unreadCount > 9 ? '9+' : String(unreadCount)}
        </span>
      ) : null}
    </Button>
  );
}
