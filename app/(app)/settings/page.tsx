'use client';

import { useAuth, useAuthGuard } from '@/src/modules/auth';
import { ModuleSettingsRows } from '@/src/modules/settings/components/profile-ui';
import { DeleteAccountSheet } from '@/src/modules/settings/components/sheets/delete-account-sheet';
import { EditAccountSheet } from '@/src/modules/settings/components/sheets/edit-account-sheet';
import { EditAgendaSheet } from '@/src/modules/settings/components/sheets/edit-agenda-sheet';
import { EditAIProviderSheet } from '@/src/modules/settings/components/sheets/edit-ai-provider-sheet';
import { EditAISheet } from '@/src/modules/settings/components/sheets/edit-ai-sheet';
import { EditFinanceSheet } from '@/src/modules/settings/components/sheets/edit-finance-sheet';
import { EditHealthSheet } from '@/src/modules/settings/components/sheets/edit-health-sheet';
import { EditProjectsSheet } from '@/src/modules/settings/components/sheets/edit-projects-sheet';
import { EditQuietHoursSheet } from '@/src/modules/settings/components/sheets/edit-quiet-hours-sheet';
import { EditSubscriptionsSheet } from '@/src/modules/settings/components/sheets/edit-subscriptions-sheet';
import { EditThemeSheet } from '@/src/modules/settings/components/sheets/edit-theme-sheet';
import {
  ACCOUNT_ROW_ICONS,
  AI_DEFAULT_PROVIDER_LABEL,
  AI_ROW_ICONS,
  AI_TONE_LABELS,
  APPEARANCE_ROW_ICONS,
  DANGER_ROW_ICONS,
  NOTIFICATION_ROW_ICONS,
  PRIVACY_ROW_ICONS,
  QUIET_HOURS_ROW_ICONS,
  THEME_OPTION_LABELS,
} from '@/src/modules/settings/constants/settings-metadata';
import { useProfile } from '@/src/modules/settings/hooks/use-profile';
import { getSettingValue } from '@/src/modules/settings/lib/settings-value';
import type { ModuleSlug } from '@/src/modules/settings/types/module-config.types';
import type { ThemeValue } from '@/src/modules/settings/types/profile.types';
import { LoadingView } from '@/src/shared/components/layout/loading-view';
import { SettingsRow } from '@/src/shared/components/layout/settings-row';
import { SettingsSection } from '@/src/shared/components/layout/settings-section';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/shared/components/ui/avatar';
import { Button } from '@/src/shared/components/ui/button';
import { Spinner } from '@/src/shared/components/ui/spinner';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { appToast } from '@/src/shared/lib/app-toast';
import { formatTimeRange } from '@/src/shared/lib/date-format';
import { LogOut, RefreshCw } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '1.3.2';
const APP_ENV = process.env.NODE_ENV === 'development' ? 'development' : (process.env.NEXT_PUBLIC_ENV ?? 'preview');

type SheetKey =
  | 'account'
  | 'deleteAccount'
  | 'theme'
  | 'ai'
  | 'aiProvider'
  | 'quietHours'
  | ModuleSlug;

export default function SettingsPage() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { isAuthenticated, isLoading, user } = useAuthGuard();
  const { logoutMutation } = useAuth();
  const { profileQuery, preferences, updatePreferences } = useProfile();
  const [openSheet, setOpenSheet] = useState<SheetKey | null>(null);

  const profile = profileQuery.data;
  const displayName = profile?.fullName ?? user?.fullName ?? 'Usuario';
  const displayEmail = profile?.email ?? user?.email ?? '';
  const appliedThemeRef = useRef<string | null>(null);
  const themeValue = getSettingValue<ThemeValue>(preferences.theme);
  const quietHours = preferences.notifications.quietHours;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login);
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!themeValue || appliedThemeRef.current === themeValue) return;
    appliedThemeRef.current = themeValue;
    setTheme(themeValue === 'system' ? 'system' : themeValue);
  }, [themeValue, setTheme]);

  const handlePreferenceToggle = useCallback(
    async (patch: Parameters<typeof updatePreferences>[0], successMessage: string) => {
      try {
        await updatePreferences(patch);
        appToast.success({ text1: 'Guardado', text2: successMessage });
      } catch {
        // Error toast handled in useProfile mutation
      }
    },
    [updatePreferences],
  );

  const setSheetOpen = (key: SheetKey) => (open: boolean) => {
    setOpenSheet(open ? key : null);
  };

  if (isLoading || !isAuthenticated || !user) {
    return <LoadingView variant="screen" />;
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 pb-10">
      <div className="flex flex-col items-center gap-2 pt-4">
        <div className="relative">
          <Avatar className="size-[72px] border border-border bg-muted">
            {profile?.avatarUrl ? <AvatarImage src={profile.avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="text-xl font-semibold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="absolute -right-1 -top-1 size-8 rounded-full"
            disabled={profileQuery.isFetching}
            onClick={() => void profileQuery.refetch()}
            aria-label="Actualizar perfil"
          >
            {profileQuery.isFetching ? (
              <Spinner className="size-3.5" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
          </Button>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-2xl font-semibold">{displayName}</p>
          <p className="text-sm text-muted-foreground">{displayEmail}</p>
        </div>
      </div>

      <SettingsSection title="Cuenta">
        <SettingsRow
          label="Perfil"
          value={displayName}
          onPress={() => setOpenSheet('account')}
          isLast
          {...ACCOUNT_ROW_ICONS.fullName}
        />
      </SettingsSection>

      <SettingsSection title="Apariencia">
        <SettingsRow
          label="Tema"
          value={THEME_OPTION_LABELS[themeValue]}
          onPress={() => setOpenSheet('theme')}
          isLast
          {...APPEARANCE_ROW_ICONS.theme}
        />
      </SettingsSection>

      <SettingsSection title="Módulos" bare>
        <ModuleSettingsRows onOpenModule={(slug) => setOpenSheet(slug)} />
      </SettingsSection>

      <SettingsSection title="Inteligencia artificial">
        <SettingsRow
          label="Tono de respuesta"
          value={AI_TONE_LABELS[preferences.ai.tone]}
          onPress={() => setOpenSheet('ai')}
          {...AI_ROW_ICONS.tone}
        />
        <SettingsRow
          label="Proveedor por defecto"
          value={preferences.ai.defaultProvider ?? AI_DEFAULT_PROVIDER_LABEL}
          onPress={() => setOpenSheet('aiProvider')}
          {...AI_ROW_ICONS.defaultProvider}
        />
        <SettingsRow
          label="Insights proactivos"
          switchValue={preferences.ai.proactiveInsights}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              { ai: { ...preferences.ai, proactiveInsights: checked } },
              'Insights proactivos actualizados.',
            )
          }
          {...AI_ROW_ICONS.proactiveInsights}
        />
        <SettingsRow
          label="Confirmar antes de actuar"
          switchValue={preferences.ai.confirmBeforeActions}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              { ai: { ...preferences.ai, confirmBeforeActions: checked } },
              'Confirmación antes de actuar actualizada.',
            )
          }
          isLast
          {...AI_ROW_ICONS.confirmBeforeActions}
        />
      </SettingsSection>

      <SettingsSection title="Notificaciones">
        <SettingsRow
          label="Push"
          switchValue={preferences.notifications.channels.push}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              {
                notifications: {
                  ...preferences.notifications,
                  channels: { ...preferences.notifications.channels, push: checked },
                },
              },
              'Preferencia de push actualizada.',
            )
          }
          {...NOTIFICATION_ROW_ICONS.push}
        />
        <SettingsRow
          label="Email"
          switchValue={preferences.notifications.channels.email}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              {
                notifications: {
                  ...preferences.notifications,
                  channels: { ...preferences.notifications.channels, email: checked },
                },
              },
              'Preferencia de email actualizada.',
            )
          }
          {...NOTIFICATION_ROW_ICONS.email}
        />
        <SettingsRow
          label="In-App"
          switchValue={preferences.notifications.channels.inApp}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              {
                notifications: {
                  ...preferences.notifications,
                  channels: { ...preferences.notifications.channels, inApp: checked },
                },
              },
              'Preferencia in-app actualizada.',
            )
          }
          {...NOTIFICATION_ROW_ICONS.inApp}
        />
        <SettingsRow
          label="Horario silencioso"
          switchValue={quietHours.enabled}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              {
                notifications: {
                  ...preferences.notifications,
                  quietHours: { ...quietHours, enabled: checked },
                },
              },
              'Horario silencioso actualizado.',
            )
          }
          {...QUIET_HOURS_ROW_ICONS.enabled}
        />
        <SettingsRow
          label="Rango horario"
          value={formatTimeRange(quietHours.start, quietHours.end)}
          onPress={() => setOpenSheet('quietHours')}
          disabled={!quietHours.enabled}
          {...QUIET_HOURS_ROW_ICONS.schedule}
        />
        <SettingsRow
          label="Permisos de notificaciones"
          value="No disponible en web"
          disabled
          showChevron={false}
          isLast
          {...NOTIFICATION_ROW_ICONS.devicePush}
        />
      </SettingsSection>

      <SettingsSection title="Privacidad">
        <SettingsRow
          label="Analíticas"
          switchValue={preferences.privacy.analyticsEnabled}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              { privacy: { ...preferences.privacy, analyticsEnabled: checked } },
              'Preferencia de analíticas actualizada.',
            )
          }
          {...PRIVACY_ROW_ICONS.analytics}
        />
        <SettingsRow
          label="Reportes de fallos"
          switchValue={preferences.privacy.crashReportsEnabled}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              { privacy: { ...preferences.privacy, crashReportsEnabled: checked } },
              'Preferencia de reportes actualizada.',
            )
          }
          isLast
          {...PRIVACY_ROW_ICONS.crashReports}
        />
      </SettingsSection>

      <SettingsSection title="Zona de peligro">
        <SettingsRow
          label="Eliminar cuenta"
          destructive
          onPress={() => setOpenSheet('deleteAccount')}
          showChevron
          isLast
          {...DANGER_ROW_ICONS.deleteAccount}
        />
      </SettingsSection>

      <SettingsSection title="Sesión">
        <SettingsRow
          label="Cerrar sesión"
          destructive
          onPress={() => logoutMutation.mutate()}
          showChevron={false}
          trailing={<LogOut className="size-4 text-destructive" />}
          isLast
        />
      </SettingsSection>

      <div className="flex flex-col items-center justify-center gap-1 pb-4">
        <p className="text-xs text-muted-foreground">Entorno {APP_ENV}</p>
        <p className="text-xs text-muted-foreground">Versión {APP_VERSION}</p>
      </div>

      <EditAccountSheet
        open={openSheet === 'account'}
        onOpenChange={setSheetOpen('account')}
        email={displayEmail}
      />
      <DeleteAccountSheet
        open={openSheet === 'deleteAccount'}
        onOpenChange={setSheetOpen('deleteAccount')}
        email={displayEmail}
      />
      <EditThemeSheet open={openSheet === 'theme'} onOpenChange={setSheetOpen('theme')} />
      <EditAISheet open={openSheet === 'ai'} onOpenChange={setSheetOpen('ai')} />
      <EditAIProviderSheet open={openSheet === 'aiProvider'} onOpenChange={setSheetOpen('aiProvider')} />
      <EditQuietHoursSheet open={openSheet === 'quietHours'} onOpenChange={setSheetOpen('quietHours')} />
      <EditFinanceSheet open={openSheet === 'finance'} onOpenChange={setSheetOpen('finance')} />
      <EditAgendaSheet open={openSheet === 'agenda'} onOpenChange={setSheetOpen('agenda')} />
      <EditProjectsSheet open={openSheet === 'projects'} onOpenChange={setSheetOpen('projects')} />
      <EditSubscriptionsSheet
        open={openSheet === 'subscriptions'}
        onOpenChange={setSheetOpen('subscriptions')}
      />
      <EditHealthSheet open={openSheet === 'health'} onOpenChange={setSheetOpen('health')} />
    </div>
  );
}
