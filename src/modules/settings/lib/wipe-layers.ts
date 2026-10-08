export const WIPE_LAYERS = {
  FINANCE_LEDGER: "finance.ledger",
  FINANCE_PLANNING: "finance.planning",
  FINANCE_CATEGORIES: "finance.categories",
  FINANCE_CATALOG: "finance.catalog",
  FINANCE_EMAIL_CONNECTIONS: "finance.emailConnections",
  AI_SESSIONS: "ai.sessions",
  NOTIFICATIONS: "notifications",
  SETTINGS_DEFAULTS: "settings.defaults",
} as const

export type WipeLayerId = (typeof WIPE_LAYERS)[keyof typeof WIPE_LAYERS]

export const WIPE_LAYER_ORDER: readonly WipeLayerId[] = [
  WIPE_LAYERS.FINANCE_LEDGER,
  WIPE_LAYERS.FINANCE_PLANNING,
  WIPE_LAYERS.FINANCE_CATEGORIES,
  WIPE_LAYERS.FINANCE_CATALOG,
  WIPE_LAYERS.FINANCE_EMAIL_CONNECTIONS,
  WIPE_LAYERS.AI_SESSIONS,
  WIPE_LAYERS.NOTIFICATIONS,
  WIPE_LAYERS.SETTINGS_DEFAULTS,
]

/** Mirrors the server rules: catalog needs the ledger, categories need planning. */
export const WIPE_LAYER_DEPENDENCIES: Record<WipeLayerId, WipeLayerId[]> = {
  [WIPE_LAYERS.FINANCE_LEDGER]: [],
  [WIPE_LAYERS.FINANCE_PLANNING]: [],
  [WIPE_LAYERS.FINANCE_CATEGORIES]: [WIPE_LAYERS.FINANCE_PLANNING],
  [WIPE_LAYERS.FINANCE_CATALOG]: [WIPE_LAYERS.FINANCE_LEDGER],
  [WIPE_LAYERS.FINANCE_EMAIL_CONNECTIONS]: [],
  [WIPE_LAYERS.AI_SESSIONS]: [],
  [WIPE_LAYERS.NOTIFICATIONS]: [],
  [WIPE_LAYERS.SETTINGS_DEFAULTS]: [],
}

export const WIPE_LAYER_LABELS: Record<WipeLayerId, string> = {
  [WIPE_LAYERS.FINANCE_LEDGER]: "Movimientos y saldos",
  [WIPE_LAYERS.FINANCE_PLANNING]: "Presupuestos, metas y préstamos",
  [WIPE_LAYERS.FINANCE_CATEGORIES]: "Categorías propias",
  [WIPE_LAYERS.FINANCE_CATALOG]: "Instituciones, cuentas y tarjetas",
  [WIPE_LAYERS.FINANCE_EMAIL_CONNECTIONS]: "Conexiones de Gmail",
  [WIPE_LAYERS.AI_SESSIONS]: "Historial del asistente IA",
  [WIPE_LAYERS.NOTIFICATIONS]: "Notificaciones y tokens push",
  [WIPE_LAYERS.SETTINGS_DEFAULTS]: "Configuración por defecto",
}

export const WIPE_LAYER_DESCRIPTIONS: Record<WipeLayerId, string> = {
  [WIPE_LAYERS.FINANCE_LEDGER]:
    "Borra todos los movimientos y pone saldos y presupuestos en cero. Conserva cuentas y tarjetas.",
  [WIPE_LAYERS.FINANCE_PLANNING]:
    "Borra presupuestos, metas de ahorro, préstamos y cobros.",
  [WIPE_LAYERS.FINANCE_CATEGORIES]:
    "Borra las categorías que creaste. Las del sistema se conservan.",
  [WIPE_LAYERS.FINANCE_CATALOG]:
    "Borra instituciones, cuentas y tarjetas. Arrastra sus movimientos, préstamos y bancos vigilados.",
  [WIPE_LAYERS.FINANCE_EMAIL_CONNECTIONS]:
    "Borra el buzón de Gmail conectado y sus tokens de acceso.",
  [WIPE_LAYERS.AI_SESSIONS]:
    "Borra las conversaciones y acciones del asistente IA.",
  [WIPE_LAYERS.NOTIFICATIONS]:
    "Borra el historial de notificaciones y los tokens push.",
  [WIPE_LAYERS.SETTINGS_DEFAULTS]:
    "Vuelve preferencias y configuración de módulos a sus valores por defecto.",
}

export type WipeLayerGroup = {
  title: string
  layers: WipeLayerId[]
}

export const WIPE_LAYER_GROUPS: WipeLayerGroup[] = [
  {
    title: "Finanzas",
    layers: [
      WIPE_LAYERS.FINANCE_LEDGER,
      WIPE_LAYERS.FINANCE_PLANNING,
      WIPE_LAYERS.FINANCE_CATEGORIES,
      WIPE_LAYERS.FINANCE_CATALOG,
      WIPE_LAYERS.FINANCE_EMAIL_CONNECTIONS,
    ],
  },
  { title: "Asistente IA", layers: [WIPE_LAYERS.AI_SESSIONS] },
  { title: "Notificaciones", layers: [WIPE_LAYERS.NOTIFICATIONS] },
  { title: "Configuración", layers: [WIPE_LAYERS.SETTINGS_DEFAULTS] },
]

export function isWipeLayerId(value: string): value is WipeLayerId {
  return (WIPE_LAYER_ORDER as readonly string[]).includes(value)
}

export function sortWipeLayers(layers: readonly WipeLayerId[]): WipeLayerId[] {
  const selected = new Set(layers)
  return WIPE_LAYER_ORDER.filter((layer) => selected.has(layer))
}

export function expandWipeLayerSelection(
  selected: readonly WipeLayerId[]
): WipeLayerId[] {
  const expanded = new Set<WipeLayerId>(selected)
  for (const layer of selected) {
    for (const dependency of WIPE_LAYER_DEPENDENCIES[layer]) {
      expanded.add(dependency)
    }
  }
  return sortWipeLayers([...expanded])
}

export function applyWipeLayerToggle(
  selected: readonly WipeLayerId[],
  layer: WipeLayerId,
  checked: boolean
): WipeLayerId[] {
  const next = new Set<WipeLayerId>(selected)
  if (checked) {
    next.add(layer)
    for (const dependency of WIPE_LAYER_DEPENDENCIES[layer]) {
      next.add(dependency)
    }
    return sortWipeLayers([...next])
  }
  next.delete(layer)
  for (const [dependent, dependencies] of Object.entries(
    WIPE_LAYER_DEPENDENCIES
  )) {
    if (dependencies.includes(layer)) {
      next.delete(dependent as WipeLayerId)
    }
  }
  return sortWipeLayers([...next])
}
