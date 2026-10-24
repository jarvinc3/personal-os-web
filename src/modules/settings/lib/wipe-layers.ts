export const WIPE_LAYERS = {
  FINANCE_LEDGER: "finance.ledger",
  FINANCE_BALANCES: "finance.balances",
  FINANCE_PLANNING: "finance.planning",
  FINANCE_CATEGORIES: "finance.categories",
  FINANCE_CATALOG: "finance.catalog",
  NOTIFICATIONS: "notifications",
  SETTINGS_DEFAULTS: "settings.defaults",
} as const

export type WipeLayerId = (typeof WIPE_LAYERS)[keyof typeof WIPE_LAYERS]

export const WIPE_LAYER_ORDER: readonly WipeLayerId[] = [
  WIPE_LAYERS.FINANCE_LEDGER,
  WIPE_LAYERS.FINANCE_BALANCES,
  WIPE_LAYERS.FINANCE_PLANNING,
  WIPE_LAYERS.FINANCE_CATEGORIES,
  WIPE_LAYERS.FINANCE_CATALOG,
  WIPE_LAYERS.NOTIFICATIONS,
  WIPE_LAYERS.SETTINGS_DEFAULTS,
]

/** Mirrors the server rules: catalog needs the ledger, categories need planning. */
export const WIPE_LAYER_DEPENDENCIES: Record<WipeLayerId, WipeLayerId[]> = {
  [WIPE_LAYERS.FINANCE_LEDGER]: [],
  [WIPE_LAYERS.FINANCE_BALANCES]: [],
  [WIPE_LAYERS.FINANCE_PLANNING]: [],
  [WIPE_LAYERS.FINANCE_CATEGORIES]: [WIPE_LAYERS.FINANCE_PLANNING],
  [WIPE_LAYERS.FINANCE_CATALOG]: [WIPE_LAYERS.FINANCE_LEDGER],
  [WIPE_LAYERS.NOTIFICATIONS]: [],
  [WIPE_LAYERS.SETTINGS_DEFAULTS]: [],
}

export const WIPE_LAYER_LABELS: Record<WipeLayerId, string> = {
  [WIPE_LAYERS.FINANCE_LEDGER]: "Movimientos y saldos",
  [WIPE_LAYERS.FINANCE_BALANCES]: "Saldos en cero",
  [WIPE_LAYERS.FINANCE_PLANNING]: "Presupuestos, metas y préstamos",
  [WIPE_LAYERS.FINANCE_CATEGORIES]: "Categorías propias",
  [WIPE_LAYERS.FINANCE_CATALOG]: "Instituciones, cuentas y tarjetas",
  [WIPE_LAYERS.NOTIFICATIONS]: "Notificaciones y tokens push",
  [WIPE_LAYERS.SETTINGS_DEFAULTS]: "Configuración por defecto",
}

export const WIPE_LAYER_DESCRIPTIONS: Record<WipeLayerId, string> = {
  [WIPE_LAYERS.FINANCE_LEDGER]:
    "Borra todos los movimientos, pone las cuentas en cero y devuelve el disponible de las tarjetas de crédito a su límite. Conserva cuentas y tarjetas.",
  [WIPE_LAYERS.FINANCE_BALANCES]:
    "Pone en cero las cuentas y restaura el disponible de las tarjetas de crédito a su límite. No borra movimientos, cuentas ni tarjetas, y el historial deja de cuadrar con el saldo.",
  [WIPE_LAYERS.FINANCE_PLANNING]:
    "Borra presupuestos, metas de ahorro, préstamos y cobros.",
  [WIPE_LAYERS.FINANCE_CATEGORIES]:
    "Borra las categorías que creaste. Las del sistema se conservan.",
  [WIPE_LAYERS.FINANCE_CATALOG]:
    "Borra instituciones, cuentas y tarjetas. Arrastra sus movimientos, préstamos y bancos vigilados.",
  [WIPE_LAYERS.NOTIFICATIONS]:
    "Borra el historial de notificaciones y los tokens push.",
  [WIPE_LAYERS.SETTINGS_DEFAULTS]:
    "Vuelve preferencias y configuración de apps a sus valores por defecto.",
}

export type WipeLayerGroup = {
  title: string
  layers: WipeLayerId[]
}

/** Layers that belong to Finanzas; a module wipe sends only these. */
export const FINANCE_WIPE_LAYERS: readonly WipeLayerId[] = [
  WIPE_LAYERS.FINANCE_LEDGER,
  WIPE_LAYERS.FINANCE_BALANCES,
  WIPE_LAYERS.FINANCE_PLANNING,
  WIPE_LAYERS.FINANCE_CATEGORIES,
  WIPE_LAYERS.FINANCE_CATALOG,
]

export const WIPE_LAYER_GROUPS: WipeLayerGroup[] = [
  {
    title: "Finanzas",
    layers: [...FINANCE_WIPE_LAYERS],
  },
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

/** Checkbox state of a group whose layers can be all, none or in between. */
export function wipeGroupChecked(
  layers: readonly WipeLayerId[],
  selected: readonly WipeLayerId[]
): boolean | "indeterminate" {
  const count = layers.filter((layer) => selected.includes(layer)).length
  if (count === 0) {
    return false
  }
  if (count === layers.length) {
    return true
  }
  return "indeterminate"
}

/** Applies one group checkbox change over every layer of the group. */
export function toggleWipeGroupLayers(
  current: readonly WipeLayerId[],
  layers: readonly WipeLayerId[],
  checked: boolean
): WipeLayerId[] {
  const order = checked ? layers : [...layers].reverse()
  return order.reduce<WipeLayerId[]>(
    (next, layer) => applyWipeLayerToggle(next, layer, checked),
    [...current]
  )
}
