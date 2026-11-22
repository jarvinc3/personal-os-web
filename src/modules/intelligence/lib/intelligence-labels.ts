export type EmailSocketStatus = "connecting" | "connected" | "disconnected"

const EMAIL_SOCKET_TEXTS = {
  connected: "Canal en vivo",
  connecting: "Conectando canal",
  disconnected: "Canal sin conexión",
} satisfies Record<EmailSocketStatus, string>

/** Texto visible de la insignia del canal en vivo. */
export function emailSocketStatusText(status: EmailSocketStatus): string {
  return EMAIL_SOCKET_TEXTS[status]
}

/** Etiqueta accesible que aclara que el canal no mide la salud de Gmail. */
export function emailSocketStatusLabel(status: EmailSocketStatus): string {
  switch (status) {
    case "connected":
      return "Canal de actualizaciones en vivo. No indica la salud de Gmail."
    case "connecting":
      return "Conectando el canal de actualizaciones. No indica la salud de Gmail."
    case "disconnected":
      return "Canal de actualizaciones sin conexión. No indica la salud de Gmail."
    default: {
      const unhandled: never = status
      throw new Error(`Estado del canal no manejado: ${String(unhandled)}`)
    }
  }
}
