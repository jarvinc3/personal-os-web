export type WebPushPermissionStatus =
  "unsupported" | "default" | "granted" | "denied"

export type PushRegistrationError =
  "vapid-not-configured" | "push-service-unavailable" | "unknown" | null

export type PushDeviceRowState =
  | "unsupported"
  | "active"
  | "vapid-not-configured"
  | "service-unavailable"
  | "retry-registration"
  | "denied"
  | "request"

type DevicePushRowInput = {
  permissionStatus: WebPushPermissionStatus
  pushToken: string | null
  isRequesting: boolean
  registrationError: PushRegistrationError
}

export type DevicePushRow = {
  state: PushDeviceRowState
  value: string
  disabled: boolean
  showChevron: boolean
}

export function resolvePushDeviceRowState({
  permissionStatus,
  pushToken,
  registrationError,
}: Omit<DevicePushRowInput, "isRequesting">): PushDeviceRowState {
  if (permissionStatus === "unsupported") {
    return "unsupported"
  }
  if (permissionStatus === "granted" && pushToken) {
    return "active"
  }
  if (
    permissionStatus === "granted" &&
    registrationError === "vapid-not-configured"
  ) {
    return "vapid-not-configured"
  }
  if (
    permissionStatus === "granted" &&
    registrationError === "push-service-unavailable"
  ) {
    return "service-unavailable"
  }
  if (permissionStatus === "granted") {
    return "retry-registration"
  }
  if (permissionStatus === "denied") {
    return "denied"
  }
  return "request"
}

export function resolveDevicePushRow(input: DevicePushRowInput): DevicePushRow {
  const state = resolvePushDeviceRowState(input)

  switch (state) {
    case "unsupported":
      return {
        state,
        value: "No compatible con este navegador",
        disabled: true,
        showChevron: false,
      }
    case "active":
      return { state, value: "Activo", disabled: true, showChevron: false }
    case "vapid-not-configured":
      return {
        state,
        value: "VAPID no configurado",
        disabled: false,
        showChevron: true,
      }
    case "service-unavailable":
      return {
        state,
        value: "Servicio push no disponible",
        disabled: true,
        showChevron: false,
      }
    case "retry-registration":
      return {
        state,
        value: input.isRequesting ? "Registrando..." : "Reintentar registro",
        disabled: input.isRequesting,
        showChevron: true,
      }
    case "denied":
      return {
        state,
        value: "Permiso denegado",
        disabled: false,
        showChevron: true,
      }
    case "request":
      return {
        state,
        value: input.isRequesting
          ? "Solicitando..."
          : "Activar en el navegador",
        disabled: input.isRequesting,
        showChevron: true,
      }
    default: {
      const unhandled: never = state
      throw new Error(
        `Estado del permiso push no manejado: ${String(unhandled)}`
      )
    }
  }
}
