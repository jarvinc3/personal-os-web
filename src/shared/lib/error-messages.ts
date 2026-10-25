/**
 * Mensajes de error que se repiten en varias pantallas. Un fallo tiene un solo
 * texto, venga de Finanzas, de Notificaciones o de Ajustes.
 */
export const ERROR_MESSAGES = {
  /** El guardado falló sin dato que corregir. */
  server: "No se pudo guardar. Intenta de nuevo.",
  /** El guardado falló por datos inválidos. */
  request: "No se pudo guardar. Revisa los datos e intenta de nuevo.",
  /** Una acción que no es un guardado. */
  action: "No se pudo completar la acción. Intenta de nuevo.",
  /** El servidor no contestó. */
  connection: "El servidor no respondió. Intenta de nuevo.",
  /** Título del estado de error al cargar una sección. */
  load: "No se pudieron cargar los datos",
  /** Texto corto cuando el fallo de carga no trae detalle. */
  loadHint: "Revisa tu conexión e inténtalo de nuevo.",
} as const
