/**
 * Claves de las hojas de Ajustes. Viven en un solo sitio para que varias
 * pantallas del mismo módulo compartan la URL y para que Privacidad y Finanzas
 * usen la misma en el vaciado.
 */
export const SETTINGS_SHEET_KEYS = {
  account: "account-sheet",
  theme: "theme-sheet",
  style: "style-sheet",
  primaryColor: "primary-color-sheet",
  quietHours: "quiet-hours-sheet",
  timeZone: "time-zone-sheet",
  locale: "locale-sheet",
  weekStart: "week-start-sheet",
  deleteAccount: "delete-account-sheet",
  wipeData: "wipe-data-sheet",
  wipeBalanceInstitution: "wipe-balance-institution-sheet",
} as const
