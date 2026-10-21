"use client"

import {
  deactivatePushTokenIfPresent,
  DevicePushSettingsRow,
} from "@/src/modules/notifications"
import { SettingsSecondaryPage } from "@/src/modules/settings/components/layout/settings-secondary-page"
import { EditQuietHoursSheet } from "@/src/modules/settings/components/sheets/edit-quiet-hours-sheet"
import { SETTINGS_REGISTRY } from "@/src/modules/settings/constants/settings-metadata"
import { usePreferenceToggle } from "@/src/modules/settings/hooks/use-preference-toggle"
import { useProfile } from "@/src/modules/settings/hooks/use-profile"
import { SettingsGate } from "@/src/modules/settings/settings-gate"
import {
  SettingsRow,
  SettingsSection,
} from "@/src/shared/components/layout/settings-section"
import { formatTimeRange } from "@/src/shared/lib/date-format"
import { useSheetParam } from "@/src/shared/hooks/use-sheet-params"

export function NotificationsSettingsScreen() {
  return (
    <SettingsGate>
      <NotificationsSettingsScreenBody />
    </SettingsGate>
  )
}

function NotificationsSettingsScreenBody() {
  const { preferences } = useProfile()
  const togglePreference = usePreferenceToggle()
  const { open: openQuietHoursSheet, setOpen: setOpenQuietHoursSheet } =
    useSheetParam("quiet-hours-sheet")
  const quietHours = preferences.notifications.quietHours

  return (
    <SettingsSecondaryPage title="Notificaciones">
      <SettingsSection title="Canales">
        <SettingsRow
          label="Push"
          description="Avisos en el teléfono."
          switchValue={preferences.notifications.channels.push}
          onSwitchChange={(checked) => {
            if (!checked) {
              void deactivatePushTokenIfPresent()
            }
            togglePreference(
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
          description="Resumen y avisos por correo."
          switchValue={preferences.notifications.channels.email}
          onSwitchChange={(checked) =>
            togglePreference(
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
          description="Avisos dentro de la app."
          switchValue={preferences.notifications.channels.inApp}
          onSwitchChange={(checked) =>
            togglePreference(
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
          isLast
          accentColor={SETTINGS_REGISTRY.notifications.accent}
          {...SETTINGS_REGISTRY.notifications.rows.inApp}
        />
      </SettingsSection>

      <SettingsSection title="Horario silencioso">
        <SettingsRow
          label="Horario silencioso"
          description="Pausa los avisos en el rango elegido."
          switchValue={quietHours.enabled}
          onSwitchChange={(checked) =>
            togglePreference(
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
          isLast={!quietHours.enabled}
        />
        {quietHours.enabled ? (
          <SettingsRow
            label="Rango horario"
            value={formatTimeRange(quietHours.start, quietHours.end)}
            onPress={() => setOpenQuietHoursSheet(true)}
            isLast
            accentColor={SETTINGS_REGISTRY.notifications.accent}
            {...SETTINGS_REGISTRY.notifications.rows.quietHoursSchedule}
          />
        ) : null}
      </SettingsSection>

      <SettingsSection title="Este dispositivo">
        <DevicePushSettingsRow
          isLast
          accentColor={SETTINGS_REGISTRY.notifications.accent}
          {...SETTINGS_REGISTRY.notifications.rows.devicePush}
        />
      </SettingsSection>

      <EditQuietHoursSheet
        open={openQuietHoursSheet}
        onOpenChange={setOpenQuietHoursSheet}
      />
    </SettingsSecondaryPage>
  )
}
