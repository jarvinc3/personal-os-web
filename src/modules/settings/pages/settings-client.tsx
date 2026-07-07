"use client"

import { useAuth, useAuthGuard } from "@/src/modules/auth";
import { DevicePushSettingsRow } from "@/src/modules/notifications/components/device-push-settings-row";
import { deactivatePushTokenIfPresent } from "@/src/modules/notifications/lib/deactivate-web-push-token";
import { ModuleSettingsRows } from "@/src/modules/settings/components/profile-ui";
import { DeleteAccountSheet } from "@/src/modules/settings/components/sheets/delete-account-sheet";
import { EditAccountSheet } from "@/src/modules/settings/components/sheets/edit-account-sheet";
import { EditAgendaSheet } from "@/src/modules/settings/components/sheets/edit-agenda-sheet";
import { EditAIProviderSheet } from "@/src/modules/settings/components/sheets/edit-ai-provider-sheet";
import { EditAISheet } from "@/src/modules/settings/components/sheets/edit-ai-sheet";
import { EditFinanceSheet } from "@/src/modules/settings/components/sheets/edit-finance-sheet";
import { EditHealthSheet } from "@/src/modules/settings/components/sheets/edit-health-sheet";
import { EditProjectsSheet } from "@/src/modules/settings/components/sheets/edit-projects-sheet";
import { EditQuietHoursSheet } from "@/src/modules/settings/components/sheets/edit-quiet-hours-sheet";
import { EditSubscriptionsSheet } from "@/src/modules/settings/components/sheets/edit-subscriptions-sheet";
import { EditThemeSheet } from "@/src/modules/settings/components/sheets/edit-theme-sheet";
import {
  getAiToneLabel,
  getThemeOptionLabel,
  SETTINGS_REGISTRY,
} from "@/src/modules/settings/constants/settings-metadata";
import { useModuleSheetNav } from "@/src/modules/settings/hooks/use-module-sheet-nav";
import { useProfile } from "@/src/modules/settings/hooks/use-profile";
import { getSettingValue } from "@/src/modules/settings/lib/settings-value";
import type { ThemeValue } from "@/src/modules/settings/types/profile.types";
import { LoadingView } from "@/src/shared/components/layout/loading-view";
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar";
import { Button } from "@/src/shared/components/ui/button";
import { Spinner } from "@/src/shared/components/ui/spinner";
import { APP_ROUTES } from "@/src/shared/constants/app-routes";
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params";
import { appToast } from "@/src/shared/lib/app-toast";
import { formatTimeRange } from "@/src/shared/lib/date-format";
import { Edit, LogOut, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0"
const APP_ENV =
  process.env.NODE_ENV === "development"
    ? "development"
    : (process.env.NEXT_PUBLIC_ENV ?? "preview")

export default function SettingsPage() {
  const router = useRouter()
  const { setTheme } = useTheme()
  const { isAuthenticated, isLoading, user } = useAuthGuard()
  const { logoutMutation } = useAuth()
  const { profileQuery, preferences, updatePreferences } = useProfile()

  const { open: openAccountSheet, setOpen: setOpenAccountSheet } =
    useSheetParam("account-sheet")
  const { open: openDeleteAccountSheet, setOpen: setOpenDeleteAccountSheet } =
    useSheetParam("delete-account-sheet")
  const { open: openThemeSheet, setOpen: setOpenThemeSheet } =
    useSheetParam("theme-sheet")
  const { open: openAISheet, setOpen: setOpenAISheet } =
    useSheetParam("ai-sheet")
  const { open: openAIProviderSheet, setOpen: setOpenAIProviderSheet } =
    useSheetParam("ai-provider-sheet")
  const { open: openQuietHoursSheet, setOpen: setOpenQuietHoursSheet } =
    useSheetParam("quiet-hours-sheet")
  const { openModule, isOpen, setModuleOpen } = useModuleSheetNav()

  const profile = profileQuery.data
  const displayName = profile?.fullName ?? user?.fullName ?? "Usuario"
  const displayEmail = profile?.email ?? user?.email ?? ""
  const appliedThemeRef = useRef<string | null>(null)
  const themeValue = getSettingValue<ThemeValue>(preferences.theme)
  const quietHours = preferences.notifications.quietHours

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(APP_ROUTES.auth.login)
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!themeValue || appliedThemeRef.current === themeValue) return
    appliedThemeRef.current = themeValue
    setTheme(themeValue === "system" ? "system" : themeValue)
  }, [themeValue, setTheme])

  const handlePreferenceToggle = useCallback(
    async (
      patch: Parameters<typeof updatePreferences>[0],
      successMessage: string
    ) => {
      try {
        await updatePreferences(patch)
        appToast.success({ text1: "Guardado", text2: successMessage })
      } catch {
        // Error toast handled in useProfile mutation
      }
    },
    [updatePreferences]
  )

  if (isLoading || !isAuthenticated || !user) {
    return <LoadingView variant="screen" />
  }

  return (
    <div className="flex flex-col gap-6 p-4 pb-10 mx-auto w-full max-w-2xl md:px-6">
      <div className="flex gap-2 items-center py-4">
        <div className="relative" onClick={() => setOpenAccountSheet(true)}>
          <Avatar className="size-20 md:size-24">
            {profile?.avatarUrl ? (
              <AvatarImage src={profile.avatarUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-base font-semibold">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            type="button"
            variant="secondary"
            className="absolute top-0 right-0 bg-muted"
            aria-label="Editar perfil"
            disabled={profileQuery.isFetching}
          >
            <Edit className="size-3.5 text-foreground" />
          </Button>
        </div>
        <div className="flex justify-between w-full">
          <div className="flex-1">
            <p className="text-xl font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{displayEmail}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
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
      </div>

      <SettingsSection title="Cuenta">
        <SettingsRow
          label="Perfil"
          value={displayName}
          onPress={() => setOpenAccountSheet(true)}
          isLast
          accentColor={SETTINGS_REGISTRY.account.accent}
          {...SETTINGS_REGISTRY.account.rows.fullName}
        />
      </SettingsSection>

      <SettingsSection title="Apariencia">
        <SettingsRow
          label="Tema"
          value={getThemeOptionLabel(themeValue)}
          onPress={() => setOpenThemeSheet(true)}
          isLast
          accentColor={SETTINGS_REGISTRY.appearance.accent}
          {...SETTINGS_REGISTRY.appearance.rows.theme}
        />
      </SettingsSection>

      <SettingsSection title="Módulos" bare>
        <ModuleSettingsRows onOpenModule={openModule} />
      </SettingsSection>

      <SettingsSection title="Inteligencia artificial">
        <SettingsRow
          label="Tono de respuesta"
          value={getAiToneLabel(preferences.ai.tone)}
          onPress={() => setOpenAISheet(true)}
          accentColor={SETTINGS_REGISTRY.ai.accent}
          {...SETTINGS_REGISTRY.ai.rows.tone}
        />
        <SettingsRow
          label="Proveedor por defecto"
          value={
            preferences.ai.defaultProvider ??
            SETTINGS_REGISTRY.ai.defaultProviderLabel
          }
          onPress={() => setOpenAIProviderSheet(true)}
          accentColor={SETTINGS_REGISTRY.ai.accent}
          {...SETTINGS_REGISTRY.ai.rows.defaultProvider}
        />
        <SettingsRow
          label="Insights proactivos"
          switchValue={preferences.ai.proactiveInsights}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              { ai: { ...preferences.ai, proactiveInsights: checked } },
              "Insights proactivos actualizados."
            )
          }
          accentColor={SETTINGS_REGISTRY.ai.accent}
          {...SETTINGS_REGISTRY.ai.rows.proactiveInsights}
        />
        <SettingsRow
          label="Confirmar antes de actuar"
          switchValue={preferences.ai.confirmBeforeActions}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              { ai: { ...preferences.ai, confirmBeforeActions: checked } },
              "Confirmación antes de actuar actualizada."
            )
          }
          isLast
          accentColor={SETTINGS_REGISTRY.ai.accent}
          {...SETTINGS_REGISTRY.ai.rows.confirmBeforeActions}
        />
      </SettingsSection>

      <SettingsSection title="Notificaciones">
        <SettingsRow
          label="Push"
          switchValue={preferences.notifications.channels.push}
          onSwitchChange={(checked) => {
            if (!checked) {
              void deactivatePushTokenIfPresent()
            }
            void handlePreferenceToggle(
              {
                notifications: {
                  ...preferences.notifications,
                  channels: {
                    ...preferences.notifications.channels,
                    push: checked,
                  },
                },
              },
              "Preferencia de push actualizada."
            )
          }}
          accentColor={SETTINGS_REGISTRY.notifications.accent}
          {...SETTINGS_REGISTRY.notifications.rows.push}
        />
        <SettingsRow
          label="Email"
          switchValue={preferences.notifications.channels.email}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              {
                notifications: {
                  ...preferences.notifications,
                  channels: {
                    ...preferences.notifications.channels,
                    email: checked,
                  },
                },
              },
              "Preferencia de email actualizada."
            )
          }
          accentColor={SETTINGS_REGISTRY.notifications.accent}
          {...SETTINGS_REGISTRY.notifications.rows.email}
        />
        <SettingsRow
          label="In-App"
          switchValue={preferences.notifications.channels.inApp}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              {
                notifications: {
                  ...preferences.notifications,
                  channels: {
                    ...preferences.notifications.channels,
                    inApp: checked,
                  },
                },
              },
              "Preferencia in-app actualizada."
            )
          }
          accentColor={SETTINGS_REGISTRY.notifications.accent}
          {...SETTINGS_REGISTRY.notifications.rows.inApp}
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
              "Horario silencioso actualizado."
            )
          }
          accentColor={SETTINGS_REGISTRY.notifications.accent}
          {...SETTINGS_REGISTRY.notifications.rows.quietHoursEnabled}
        />
        <SettingsRow
          label="Rango horario"
          value={formatTimeRange(quietHours.start, quietHours.end)}
          onPress={() => setOpenQuietHoursSheet(true)}
          disabled={!quietHours.enabled}
          accentColor={SETTINGS_REGISTRY.notifications.accent}
          {...SETTINGS_REGISTRY.notifications.rows.quietHoursSchedule}
        />
        <DevicePushSettingsRow
          isLast
          accentColor={SETTINGS_REGISTRY.notifications.accent}
          {...SETTINGS_REGISTRY.notifications.rows.devicePush}
        />
      </SettingsSection>

      <SettingsSection title="Privacidad">
        <SettingsRow
          label="Analíticas"
          switchValue={preferences.privacy.analyticsEnabled}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              {
                privacy: { ...preferences.privacy, analyticsEnabled: checked },
              },
              "Preferencia de analíticas actualizada."
            )
          }
          accentColor={SETTINGS_REGISTRY.privacy.accent}
          {...SETTINGS_REGISTRY.privacy.rows.analytics}
        />
        <SettingsRow
          label="Reportes de fallos"
          switchValue={preferences.privacy.crashReportsEnabled}
          onSwitchChange={(checked) =>
            void handlePreferenceToggle(
              {
                privacy: {
                  ...preferences.privacy,
                  crashReportsEnabled: checked,
                },
              },
              "Preferencia de reportes actualizada."
            )
          }
          isLast
          accentColor={SETTINGS_REGISTRY.privacy.accent}
          {...SETTINGS_REGISTRY.privacy.rows.crashReports}
        />
      </SettingsSection>

      <SettingsSection title="Información">
        <SettingsRow
          label="Landing page"
          value="Activada"
          onPress={() => {
            router.push(APP_ROUTES.marketing.landing)
          }}
          accentColor={SETTINGS_REGISTRY.marketing.accent}
          {...SETTINGS_REGISTRY.marketing.rows.landingPage}
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

      <div className="flex flex-col gap-1 justify-center items-center pb-4">
        <p className="text-xs text-muted-foreground">Entorno {APP_ENV}</p>
        <p className="text-xs text-muted-foreground">Versión {APP_VERSION}</p>
      </div>

      <EditAccountSheet
        open={openAccountSheet}
        onOpenChange={setOpenAccountSheet}
        email={displayEmail}
      />
      <DeleteAccountSheet
        open={openDeleteAccountSheet}
        onOpenChange={setOpenDeleteAccountSheet}
        email={displayEmail}
      />
      <EditThemeSheet
        open={openThemeSheet}
        onOpenChange={setOpenThemeSheet}
      />
      <EditAISheet
        open={openAISheet}
        onOpenChange={setOpenAISheet}
      />
      <EditAIProviderSheet
        open={openAIProviderSheet}
        onOpenChange={setOpenAIProviderSheet}
      />
      <EditQuietHoursSheet
        open={openQuietHoursSheet}
        onOpenChange={setOpenQuietHoursSheet}
      />
      <EditFinanceSheet
        open={isOpen("finance")}
        onOpenChange={(open) => setModuleOpen("finance", open)}
      />
      <EditAgendaSheet
        open={isOpen("agenda")}
        onOpenChange={(open) => setModuleOpen("agenda", open)}
      />
      <EditProjectsSheet
        open={isOpen("projects")}
        onOpenChange={(open) => setModuleOpen("projects", open)}
      />
      <EditSubscriptionsSheet
        open={isOpen("subscriptions")}
        onOpenChange={(open) => setModuleOpen("subscriptions", open)}
      />
      <EditHealthSheet
        open={isOpen("health")}
        onOpenChange={(open) => setModuleOpen("health", open)}
      />
    </div>
  )
}
