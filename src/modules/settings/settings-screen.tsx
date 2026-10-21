"use client"

import { useAuth, useAuthGuard } from "@/src/modules/auth"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import { DevicePushSettingsRow } from "@/src/modules/notifications"
import { deactivatePushTokenIfPresent } from "@/src/modules/notifications"
import { ModuleSettingsRows } from "@/src/modules/settings/components/profile-ui"
import { DeleteAccountSheet } from "@/src/modules/settings/components/sheets/delete-account-sheet"
import { EditAccountSheet } from "@/src/modules/settings/components/sheets/edit-account-sheet"
import { EditTimeZoneSheet } from "@/src/modules/settings/components/sheets/edit-time-zone-sheet"
import { EditAIProviderSheet } from "@/src/modules/settings/components/sheets/edit-ai-provider-sheet"
import { EditAISheet } from "@/src/modules/settings/components/sheets/edit-ai-sheet"
import { EditQuietHoursSheet } from "@/src/modules/settings/components/sheets/edit-quiet-hours-sheet"
import { EditThemeSheet } from "@/src/modules/settings/components/sheets/edit-theme-sheet"
import {
  getAiToneLabel,
  getThemeOptionLabel,
  SETTINGS_REGISTRY,
} from "@/src/modules/settings/constants/settings-metadata"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { getSettingValue } from "@/src/modules/settings/lib/settings-value"
import type { ThemeValue } from "@/src/modules/settings/types/profile.types"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/shared/components/ui/avatar"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { usePendingNavigation } from "@/src/shared/components/ui/navigation-pending"
import {
  APP_ROUTES,
  settingsModuleHref,
} from "@/src/shared/constants/app-routes"
import { landingUrl } from "@/src/shared/constants/landing.mjs"
import { MODULE_SLUGS_ORDER } from "@/src/shared/constants/module-registry"
import { MODULE_SHEET_PARAM_KEYS } from "@/src/modules/settings/constants/module-sheet-keys"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"
import { appToast } from "@/src/shared/lib/app-toast"
import { formatTimeRange } from "@/src/shared/lib/date-format"
import { Edit, LogOut } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect } from "react"
import { Badge } from "@/src/shared/components/ui/badge"

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "1.0.0"
const APP_ENV =
  process.env.NODE_ENV === "development"
    ? "development"
    : (process.env.NEXT_PUBLIC_ENV ?? "preview")

function openLandingPage() {
  window.open(landingUrl(), "_blank", "noopener,noreferrer")
}

export function SettingsScreen() {
  return (
    <SettingsGate>
      <SettingsScreenBody />
    </SettingsGate>
  )
}

function SettingsScreenBody() {
  const router = useRouter()
  const { navigate: navigateToWipeData, isPending: isWipeDataPending } =
    usePendingNavigation()
  const { user } = useAuthGuard()
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
  const { open: openTimeZoneSheet, setOpen: setOpenTimeZoneSheet } =
    useSheetParam("time-zone-sheet")
  const searchParams = useSearchParams()

  const profile = profileQuery.data
  const displayName = profile?.fullName ?? user?.fullName ?? "Usuario"
  const displayEmail = profile?.email ?? user?.email ?? ""
  const themeValue = getSettingValue<ThemeValue>(preferences.theme)
  const quietHours = preferences.notifications.quietHours

  useEffect(() => {
    const sheet = searchParams.get("sheet")
    if (!sheet) {
      return
    }
    const slug = MODULE_SLUGS_ORDER.find(
      (item) => MODULE_SHEET_PARAM_KEYS[item] === sheet
    )
    if (!slug) {
      return
    }
    router.replace(settingsModuleHref(slug))
  }, [router, searchParams])

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

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 pb-10 md:px-6">
      <div className="flex flex-col items-center gap-4 py-4">
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
        <div className="flex flex-col items-center gap-1">
          <p className="text-2xl font-semibold">{displayName}</p>
          <p className="text-xs text-muted-foreground">{displayEmail}</p>
        </div>
      </div>

      <SettingsSection title="Cuenta">
        <SettingsRow
          label="Perfil"
          value={displayName}
          onPress={() => setOpenAccountSheet(true)}
          isLast={false}
          accentColor={SETTINGS_REGISTRY.account.accent}
          {...SETTINGS_REGISTRY.account.rows.fullName}
        />
        <SettingsRow
          label="Zona horaria"
          value={profile?.timezone ?? "Sin definir"}
          onPress={() => setOpenTimeZoneSheet(true)}
          isLast
          accentColor={SETTINGS_REGISTRY.account.accent}
          {...SETTINGS_REGISTRY.account.rows.timeZone}
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

      <ModuleSettingsRows />

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
              { ai: { proactiveInsights: checked } },
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
              { ai: { confirmBeforeActions: checked } },
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
                  channels: {
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
                  channels: {
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
                  channels: {
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
                  quietHours: { enabled: checked },
                },
              },
              "Horario silencioso actualizado."
            )
          }
          accentColor={SETTINGS_REGISTRY.notifications.accent}
          {...SETTINGS_REGISTRY.notifications.rows.quietHoursEnabled}
        />

        {quietHours.enabled ? (
          <SettingsRow
            label="Rango horario"
            value={formatTimeRange(quietHours.start, quietHours.end)}
            onPress={() => setOpenQuietHoursSheet(true)}
            accentColor={SETTINGS_REGISTRY.notifications.accent}
            {...SETTINGS_REGISTRY.notifications.rows.quietHoursSchedule}
          />
        ) : null}

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
              { privacy: { analyticsEnabled: checked } },
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
          link
          onPress={openLandingPage}
          accentColor={SETTINGS_REGISTRY.marketing.accent}
          {...SETTINGS_REGISTRY.marketing.rows.landingPage}
        />
      </SettingsSection>

      <SettingsSection title="Zona de Peligro">
        <SettingsRow
          label="Vaciar datos"
          destructive
          onPress={() => navigateToWipeData(APP_ROUTES.app.settingsWipeData)}
          disabled={isWipeDataPending}
          trailing={
            isWipeDataPending ? <Spinner className="size-4" /> : undefined
          }
          accentColor={SETTINGS_REGISTRY.danger.accent}
          {...SETTINGS_REGISTRY.danger.rows.wipeData}
        />

        <SettingsRow
          label="Borrar cuenta"
          destructive
          onPress={() => setOpenDeleteAccountSheet(true)}
          isLast
          accentColor={SETTINGS_REGISTRY.danger.accent}
          {...SETTINGS_REGISTRY.danger.rows.deleteAccount}
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

      <div className="flex flex-col items-center justify-center gap-1 pb-6">
        <p className="text-xs text-muted-foreground">
          Entorno{" "}
          <span className="font-mono font-bold capitalize">{APP_ENV}</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Versión <span className="font-mono font-bold">{APP_VERSION}</span>
        </p>
        <Badge variant="info">Beta</Badge>
      </div>

      <>
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
        <EditTimeZoneSheet
          open={openTimeZoneSheet}
          onOpenChange={setOpenTimeZoneSheet}
        />
        <EditAISheet open={openAISheet} onOpenChange={setOpenAISheet} />
        <EditAIProviderSheet
          open={openAIProviderSheet}
          onOpenChange={setOpenAIProviderSheet}
        />
        <EditQuietHoursSheet
          open={openQuietHoursSheet}
          onOpenChange={setOpenQuietHoursSheet}
        />
      </>
    </div>
  )
}
