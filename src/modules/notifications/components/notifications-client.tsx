'use client';

import { useAuthGuard } from '@/src/modules/auth';
import { DevicePushSettingsRow } from '@/src/modules/notifications/components/device-push-settings-row';
import { NotificationRow } from '@/src/modules/notifications/components/notification-row';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/src/modules/notifications/hooks/use-mark-notification-read';
import { useNotificationPreferences } from '@/src/modules/notifications/hooks/use-notification-preferences';
import { useNotifications } from '@/src/modules/notifications/hooks/use-notifications';
import { deactivatePushTokenIfPresent } from '@/src/modules/notifications/lib/deactivate-web-push-token';
import { groupNotificationsByDate } from '@/src/modules/notifications/lib/group-notifications-by-date';
import { EditQuietHoursSheet } from '@/src/modules/settings/components/sheets/edit-quiet-hours-sheet';
import { SETTINGS_REGISTRY } from '@/src/modules/settings/constants/settings-metadata';
import { useProfile } from '@/src/modules/settings/hooks/use-profile';
import { BottomSheet } from '@/src/shared/components/layout/bottom-sheet';
import { LoadingView } from '@/src/shared/components/layout/loading-view';
import {
  SettingsRow,
  SettingsSection,
} from '@/src/shared/components/layout/settings-section';
import { Button } from '@/src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/shared/components/ui/dropdown-menu';
import { Separator } from '@/src/shared/components/ui/separator';
import { Spinner } from '@/src/shared/components/ui/spinner';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { appToast } from '@/src/shared/lib/app-toast';
import { formatTimeRange } from '@/src/shared/lib/date-format';
import { CheckCheckIcon, MoreVerticalIcon, SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

export function NotificationsClient() {
  const { isAuthenticated, isLoading } = useAuthGuard();
  const { isInAppEnabled } = useNotificationPreferences();
  const notificationsQuery = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const { updatePreferences } = useProfile();

  const handlePreferenceToggle = useCallback(
    async (patch: Parameters<typeof updatePreferences>[0], successMessage: string) => {
      try {
        await updatePreferences(patch);
        appToast.success({
          text1: 'Guardado',
          text2: successMessage,
        });
      } catch {
        // Toast handled in useProfile mutation
      }
    },
    [updatePreferences],
  );

  const [prefsOpen, setPrefsOpen] = useState(false);
  const [quietHoursOpen, setQuietHoursOpen] = useState(false);

  const sections = useMemo(
    () => groupNotificationsByDate(notificationsQuery.data?.items ?? []),
    [notificationsQuery.data?.items],
  );

  if (isLoading || !isAuthenticated) {
    return <LoadingView variant="screen" />;
  }

  const headerMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" aria-label="Opciones de notificaciones">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuGroup>
          <DropdownMenuItem
            disabled={markAllMutation.isPending || sections.length === 0}
            onClick={() => void markAllMutation.mutateAsync()}
          >
            <CheckCheckIcon />
            Marcar todas como leídas
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setPrefsOpen(true)}>
            <SettingsIcon />
            Configuración de notificaciones
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (!isInAppEnabled) {
    return (
      <div className="flex flex-col gap-4 p-4 pb-16 mx-auto max-w-2xl md:px-6">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">Notificaciones</h2>
          {headerMenu}
        </div>
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16">
          <p className="text-center text-muted-foreground">
            Las notificaciones in-app están desactivadas en tus preferencias.
          </p>
          <Button variant="outline" onClick={() => setPrefsOpen(true)}>
            Configurar notificaciones
          </Button>
        </div>
        <NotificationPreferencesSheet
          open={prefsOpen}
          onOpenChange={setPrefsOpen}
          quietHoursOpen={quietHoursOpen}
          onQuietHoursOpenChange={setQuietHoursOpen}
          onPreferenceToggle={handlePreferenceToggle}
        />
      </div>
    );
  }

  if (notificationsQuery.isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 pb-16 mx-auto max-w-2xl md:px-6">
        <div className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">Notificaciones</h2>
          {headerMenu}
        </div>
        <LoadingView />
        <NotificationPreferencesSheet
          open={prefsOpen}
          onOpenChange={setPrefsOpen}
          quietHoursOpen={quietHoursOpen}
          onQuietHoursOpenChange={setQuietHoursOpen}
          onPreferenceToggle={handlePreferenceToggle}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-16 mx-auto max-w-2xl md:px-6">
      <div className="flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold">Notificaciones</h2>
        {headerMenu}
      </div>

      {notificationsQuery.isRefetching ? (
        <div className="flex justify-center py-2">
          <Spinner />
        </div>
      ) : null}

      {sections.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No tienes notificaciones por ahora.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {sections.map((section) => (
            <div key={section.key} className="flex flex-col">
              <p className="px-1 pb-2 pt-2 text-sm font-medium text-muted-foreground">
                {section.title}
              </p>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                {section.data.map((item, index) => (
                  <div key={item.id}>
                    <NotificationRow
                      notification={item}
                      onPress={() => {
                        if (!item.isRead) {
                          void markReadMutation.mutateAsync(item.id);
                        }
                      }}
                    />
                    {index < section.data.length - 1 ? <Separator /> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          disabled={notificationsQuery.isRefetching}
          onClick={() => void notificationsQuery.refetch()}
        >
          Actualizar
        </Button>
      </div>

      <NotificationPreferencesSheet
        open={prefsOpen}
        onOpenChange={setPrefsOpen}
        quietHoursOpen={quietHoursOpen}
        onQuietHoursOpenChange={setQuietHoursOpen}
        onPreferenceToggle={handlePreferenceToggle}
      />
    </div>
  );
}

type NotificationPreferencesSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quietHoursOpen: boolean;
  onQuietHoursOpenChange: (open: boolean) => void;
  onPreferenceToggle: (
    patch: Parameters<ReturnType<typeof useProfile>['updatePreferences']>[0],
    successMessage: string,
  ) => Promise<void>;
};

function NotificationPreferencesSheet({
  open,
  onOpenChange,
  quietHoursOpen,
  onQuietHoursOpenChange,
  onPreferenceToggle,
}: NotificationPreferencesSheetProps) {
  const { preferences } = useProfile();
  const quietHours = preferences.notifications.quietHours;

  return (
    <>
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        title="Configuración de notificaciones"
        description="Ajusta canales y horario silencioso."
      >
        <SettingsSection title="Canales" bare>
          <SettingsRow
            label="Push"
            switchValue={preferences.notifications.channels.push}
            onSwitchChange={(checked) => {
              if (!checked) {
                void deactivatePushTokenIfPresent();
              }
              void onPreferenceToggle(
                {
                  notifications: {
                    ...preferences.notifications,
                    channels: {
                      ...preferences.notifications.channels,
                      push: checked,
                    },
                  },
                },
                'Preferencia de push actualizada.',
              );
            }}
            {...SETTINGS_REGISTRY.notifications.rows.push}
          />
          <SettingsRow
            label="Email"
            switchValue={preferences.notifications.channels.email}
            onSwitchChange={(checked) =>
              void onPreferenceToggle(
                {
                  notifications: {
                    ...preferences.notifications,
                    channels: {
                      ...preferences.notifications.channels,
                      email: checked,
                    },
                  },
                },
                'Preferencia de email actualizada.',
              )
            }
            {...SETTINGS_REGISTRY.notifications.rows.email}
          />
          <SettingsRow
            label="In-App"
            switchValue={preferences.notifications.channels.inApp}
            onSwitchChange={(checked) =>
              void onPreferenceToggle(
                {
                  notifications: {
                    ...preferences.notifications,
                    channels: {
                      ...preferences.notifications.channels,
                      inApp: checked,
                    },
                  },
                },
                'Preferencia in-app actualizada.',
              )
            }
            {...SETTINGS_REGISTRY.notifications.rows.inApp}
          />
          <SettingsRow
            label="Horario silencioso"
            switchValue={quietHours.enabled}
            onSwitchChange={(checked) =>
              void onPreferenceToggle(
                {
                  notifications: {
                    ...preferences.notifications,
                    quietHours: { ...quietHours, enabled: checked },
                  },
                },
                'Horario silencioso actualizado.',
              )
            }
            {...SETTINGS_REGISTRY.notifications.rows.quietHoursEnabled}
          />
          <SettingsRow
            label="Rango horario"
            value={formatTimeRange(quietHours.start, quietHours.end)}
            onPress={() => onQuietHoursOpenChange(true)}
            disabled={!quietHours.enabled}
            {...SETTINGS_REGISTRY.notifications.rows.quietHoursSchedule}
          />
          <DevicePushSettingsRow isLast />
        </SettingsSection>

        <Button variant="outline" className="w-full" asChild>
          <Link href={APP_ROUTES.app.settings}>Ir a Ajustes completos</Link>
        </Button>
      </BottomSheet>

      <EditQuietHoursSheet
        open={quietHoursOpen}
        onOpenChange={onQuietHoursOpenChange}
      />
    </>
  );
}
