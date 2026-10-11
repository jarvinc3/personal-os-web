export type WakeLockFailureKind =
  "unsupported" | "permission" | "not_visible" | "released" | "unknown"

export function classifyWakeLockError(error: unknown): WakeLockFailureKind {
  if (!error || typeof error !== "object") {
    return "unknown"
  }

  const name =
    "name" in error && typeof error.name === "string" ? error.name : ""
  const message =
    "message" in error && typeof error.message === "string"
      ? error.message.toLowerCase()
      : ""

  if (name === "NotSupportedError" || message.includes("not supported")) {
    return "unsupported"
  }

  if (
    message.includes("not visible") ||
    message.includes("document is hidden") ||
    message.includes("visibility")
  ) {
    return "not_visible"
  }

  if (name === "NotAllowedError" || message.includes("permission")) {
    return "permission"
  }

  return "unknown"
}

export function wakeLockFailureMessage(kind: WakeLockFailureKind): {
  title: string
  description: string
} {
  switch (kind) {
    case "unsupported":
      return {
        title: "No disponible",
        description: "Este navegador no admite Wake Lock API.",
      }
    case "permission":
      return {
        title: "Permiso denegado",
        description:
          "El navegador rechazó el permiso para mantener la pantalla despierta.",
      }
    case "not_visible":
      return {
        title: "Ventana no visible",
        description:
          "El bloqueo solo se puede pedir con esta pestaña visible. Vuelve a ella e inténtalo de nuevo.",
      }
    case "released":
      return {
        title: "Bloqueo liberado",
        description:
          "El sistema liberó el bloqueo de pantalla. Lo reintentamos al volver a esta ventana.",
      }
    default:
      return {
        title: "Error",
        description: "No se pudo activar el bloqueo de pantalla.",
      }
  }
}
