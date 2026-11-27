"use client"

import { useWebPushPermissions } from "@/src/modules/notifications/hooks/use-web-push-permissions"
import { resolveDevicePushRow } from "@/src/modules/notifications/lib/device-push-row"
import { SETTINGS_REGISTRY } from "@/src/modules/settings"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/src/shared/components/ui/item"
import { appToast } from "@/src/shared/lib/app-toast"
import { cn } from "@/src/shared/lib/utils"
import { ChevronRightIcon } from "lucide-react"
import { useCallback } from "react"

type DevicePushSettingsRowProps = {
  accentColor?: string
}

const NOTIFICATIONS = SETTINGS_REGISTRY.notifications
const DevicePushIcon = NOTIFICATIONS.rows.devicePush.icon

export function DevicePushSettingsRow({
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

  const accent = accentColor ?? NOTIFICATIONS.accent

  return (
    <Item
      variant="plain"
      className={cn("min-h-[52px] px-3 py-3", row.disabled && "opacity-50")}
      aria-disabled={row.disabled || undefined}
      render={
        row.showChevron && !row.disabled ? (
          <button type="button" onClick={handlePress} />
        ) : undefined
      }
    >
      <ItemMedia
        className="size-9 rounded-md"
        style={{ backgroundColor: `${accent}20` }}
      >
        <DevicePushIcon className="size-4.5" style={{ color: accent }} />
      </ItemMedia>
      <ItemContent className="gap-0.5">
        <div className="flex flex-col gap-0.5 md:flex-row md:items-center md:justify-between md:gap-3">
          <ItemTitle className="text-sm font-normal md:text-base">
            Permisos de notificaciones
          </ItemTitle>
          <ItemDescription className="max-w-[90%] truncate text-xs md:text-right">
            {row.value}
          </ItemDescription>
        </div>
      </ItemContent>
      {row.showChevron ? (
        <ItemActions>
          <ChevronRightIcon className="size-4.5 text-muted-foreground" />
        </ItemActions>
      ) : null}
    </Item>
  )
}
