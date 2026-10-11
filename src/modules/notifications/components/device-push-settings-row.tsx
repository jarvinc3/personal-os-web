"use client"

import { useWebPushPermissions } from "@/src/modules/notifications/hooks/use-web-push-permissions"
import { SETTINGS_REGISTRY } from "@/src/modules/settings"
import { SettingsRow } from "@/src/shared/components/layout/settings-section"
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

  const pushDeviceRow = (() => {
    if (permissionStatus === "unsupported") {
      return {
        value: "No compatible con este navegador",
        disabled: true,
        showChevron: false,
        onPress: undefined,
      }
    }
    if (permissionStatus === "granted" && pushToken) {
      return {
        value: "Activo",
        disabled: true,
        showChevron: false,
        onPress: undefined,
      }
    }
    if (
      permissionStatus === "granted" &&
      registrationError === "vapid-not-configured"
    ) {
      return {
        value: "VAPID no configurado",
        disabled: false,
        showChevron: true,
        onPress: () => {
          appToast.error({
            text1: "Push no configurado",
            text2: "Configura las claves VAPID en backend y frontend.",
          })
        },
      }
    }
    if (
      permissionStatus === "granted" &&
      registrationError === "push-service-unavailable"
    ) {
      return {
        value: "Servicio push no disponible",
        disabled: true,
        showChevron: false,
        onPress: undefined,
      }
    }
    if (permissionStatus === "granted" && !pushToken) {
      return {
        value: isRequesting ? "Registrando..." : "Reintentar registro",
        disabled: isRequesting,
        showChevron: true,
        onPress: () => {
          void requestPermission().then(handlePushPermissionResult)
        },
      }
    }
    if (permissionStatus === "denied") {
      return {
        value: "Permiso denegado",
        disabled: false,
        showChevron: true,
        onPress: () => {
          appToast.info({
            text1: "Permiso bloqueado",
            text2:
              "Abre la configuración del sitio en tu navegador y permite notificaciones.",
          })
        },
      }
    }
    return {
      value: isRequesting ? "Solicitando..." : "Activar en el navegador",
      disabled: isRequesting,
      showChevron: true,
      onPress: () => {
        void requestPermission().then(handlePushPermissionResult)
      },
    }
  })()

  return (
    <SettingsRow
      label="Permisos de notificaciones"
      value={pushDeviceRow.value}
      disabled={pushDeviceRow.disabled}
      showChevron={pushDeviceRow.showChevron}
      onPress={pushDeviceRow.onPress}
      isLast={isLast}
      accentColor={accentColor}
      {...SETTINGS_REGISTRY.notifications.rows.devicePush}
    />
  )
}
