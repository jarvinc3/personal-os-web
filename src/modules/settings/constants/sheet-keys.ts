/**
 * Claves de las hojas de Ajustes que comparten varias pantallas o módulos.
 * Viven en un solo sitio para que Privacidad y Finanzas usen la misma URL.
 */
export const SETTINGS_SHEET_KEYS = {
  deleteAccount: "delete-account-sheet",
  wipeData: "wipe-data-sheet",
  wipeBalanceInstitution: "wipe-balance-institution-sheet",
} as const
