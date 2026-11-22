"use client"

import { useWebPushPermissions } from "@/src/modules/notifications/hooks/use-web-push-permissions"
import { resolveDevicePushRow } from "@/src/modules/notifications/lib/device-push-row"
import { SETTINGS_REGISTRY } from "@/src/modules/settings"
import { SettingsRow } from "@/src/shared/components/settings/settings-section"
import { appToast } from "@/src/shared/lib/app-toast"
import { useCallback } from "react"

type DevicePushSettingsRowProps = {
  isLast?: boolean
  accentColor?: string
}

export function DevicePushSettingsRow({
  isLast,
  accentColor,
}: DevicePushSettingsRowProps) {
  const {
    permissionStatus,
    pushToken,
    isRequesting,
    registrationError,
    requestPermission,
  } = useWebPushPermissions()

  const handlePushPermissionResult = useCallback(
    (result: Awaited<ReturnType<typeof requestPermission>>) => {
      if (result.ok) {
        appToast.success({
          text1: "Notificaciones activadas",
          text2: "Recibirás alertas push en este navegador.",
        })
        return
      }

      if (result.reason === "denied" || result.reason === "permission-denied") {
        appToast.warning({
          text1: "Permiso no concedido",
          text2: "Actívalo en la configuración del navegador si lo necesitas.",
        })
        return
      }

      if (result.reason === "vapid-not-configured") {
        appToast.error({
          text1: "Push no configurado",
          text2: "Falta NEXT_PUBLIC_VAPID_PUBLIC_KEY en el entorno.",
        })
        return
      }

      if (result.reason === "push-service-unavailable") {
        appToast.warning({
          text1: "Push no disponible",
          text2: "Este navegador no tiene servicio de notificaciones push.",
        })
        return
      }

      if (result.reason === "unsupported") {
        appToast.error({
          text1: "No compatible",
          text2: "Este navegador no admite notificaciones push.",
        })
      }
    },
    []
  )

  const row = resolveDevicePushRow({
    permissionStatus,
    pushToken,
    isRequesting,
    registrationError,
  })

  const handlePress = () => {
    if (row.state === "vapid-not-configured") {
      appToast.error({
        text1: "Push no configurado",
        text2: "Configura las claves VAPID en backend y frontend.",
      })
      return
    }
    if (row.state === "denied") {
      appToast.info({
        text1: "Permiso bloqueado",
        text2:
          "Abre la configuración del sitio en tu navegador y permite notificaciones.",
      })
      return
    }
    if (row.state === "retry-registration" || row.state === "request") {
      void requestPermission().then(handlePushPermissionResult)
    }
  }

  return (
    <SettingsRow
      label="Permisos de notificaciones"
      value={row.value}
      disabled={row.disabled}
      showChevron={row.showChevron}
      onPress={row.showChevron ? handlePress : undefined}
      isLast={isLast}
      accentColor={accentColor}
      {...SETTINGS_REGISTRY.notifications.rows.devicePush}
    />
  )
}
