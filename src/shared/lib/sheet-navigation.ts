export const SHEET_QUERY_KEY = "sheet"
export const SHEET_ID_QUERY_KEY = "sheetId"

/**
 * Second parameter for the picker opened from a sheet: it keeps the parent in
 * place, so Back closes only the picker and the form keeps what was written.
 */
export const SHEET_PICKER_QUERY_KEY = "picker"

type SearchParamsLike = {
  get(name: string): string | null
  toString(): string
}

/** Params that a sheet owns beyond `sheet`/`sheetId`/`picker`, e.g. its context. */
export type SheetExtraParams = Record<string, string | null>

export type SheetNavResult =
  | { action: "noop" }
  | { action: "push"; url: string }
  | { action: "replace"; url: string }
  | { action: "back" }

/**
 * Cómo cierra una hoja abierta con `push`: `back` consume la entrada de
 * historial y Atrás sigue saliendo de la vista; `replace` la reescribe sin
 * consumirla, así que Atrás se queda en la vista con la hoja cerrada.
 */
export type SheetCloseMode = "back" | "replace"

export type SheetSearchSnapshot = {
  sheetKey: string | null
  sheetId: string | null
}

export type SheetParamView = {
  open: boolean
  sheetId: string | null
}

export type OptimisticSheetParam = SheetParamView & {
  from: SheetSearchSnapshot
}

export function readSheetSearch(
  searchParams: SearchParamsLike
): SheetSearchSnapshot {
  return {
    sheetKey: searchParams.get(SHEET_QUERY_KEY),
    sheetId: searchParams.get(SHEET_ID_QUERY_KEY),
  }
}

export function sheetViewForKey(
  snapshot: SheetSearchSnapshot,
  key: string
): SheetParamView {
  const open = snapshot.sheetKey === key
  return { open, sheetId: open ? snapshot.sheetId : null }
}

export function mergeOptimisticSheetParam(
  key: string,
  url: SheetSearchSnapshot,
  optimistic: OptimisticSheetParam | null
): SheetParamView & { dropOptimistic: boolean } {
  const urlView = sheetViewForKey(url, key)
  if (!optimistic) {
    return { ...urlView, dropOptimistic: false }
  }

  const optimisticView: SheetParamView = {
    open: optimistic.open,
    sheetId: optimistic.sheetId,
  }
  const urlMatchesTarget =
    urlView.open === optimisticView.open &&
    (urlView.sheetId ?? null) === (optimisticView.sheetId ?? null)
  if (urlMatchesTarget) {
    return { ...urlView, dropOptimistic: true }
  }

  const urlStillAtFrom =
    url.sheetKey === optimistic.from.sheetKey &&
    (url.sheetId ?? null) === (optimistic.from.sheetId ?? null)
  if (urlStillAtFrom) {
    return { ...optimisticView, dropOptimistic: false }
  }

  return { ...urlView, dropOptimistic: true }
}

function toUrl(pathname: string, params: URLSearchParams) {
  const qs = params.toString()
  return qs ? `${pathname}?${qs}` : pathname
}

function cloneParams(searchParams: SearchParamsLike) {
  return new URLSearchParams(searchParams.toString())
}

function writeSheet(
  params: URLSearchParams,
  key: string,
  id: string | null | undefined
) {
  params.set(SHEET_QUERY_KEY, key)
  // A new sheet never inherits the picker of the previous one.
  params.delete(SHEET_PICKER_QUERY_KEY)
  if (id) {
    params.set(SHEET_ID_QUERY_KEY, id)
  } else {
    params.delete(SHEET_ID_QUERY_KEY)
  }
}

function applyExtraParams(
  params: URLSearchParams,
  extraParams: SheetExtraParams | undefined
): void {
  for (const [key, value] of Object.entries(extraParams ?? {})) {
    if (value === null) {
      params.delete(key)
    } else {
      params.set(key, value)
    }
  }
}

function hasExtraParamChanges(
  params: URLSearchParams,
  extraParams: SheetExtraParams | undefined
): boolean {
  return Object.entries(extraParams ?? {}).some(([key, value]) => {
    return (params.get(key) ?? null) !== value
  })
}

function removeParams(
  params: URLSearchParams,
  keys: readonly string[] | undefined
): void {
  for (const key of keys ?? []) {
    params.delete(key)
  }
}

/** URL de la hoja abierta: su clave, sin los parámetros de la vista, y con los suyos. */
function openedSheetParams(input: {
  searchParams: SearchParamsLike
  key: string
  id?: string | null
  clearOnOpen?: readonly string[]
  extraParams?: SheetExtraParams
}): URLSearchParams {
  const params = cloneParams(input.searchParams)
  writeSheet(params, input.key, input.id)
  removeParams(params, input.clearOnOpen)
  applyExtraParams(params, input.extraParams)
  return params
}

/** Picker opened on top of the active sheet; null when there is none. */
export function readPickerKey(searchParams: SearchParamsLike): string | null {
  return searchParams.get(SHEET_PICKER_QUERY_KEY)
}

/**
 * Opens or closes the picker of a sheet. Opening pushes a history entry so Back
 * closes only the picker; switching from another picker replaces it.
 */
export function resolvePickerNavigation(input: {
  pathname: string
  searchParams: SearchParamsLike
  key: string
  open: boolean
  wasPushed: boolean
}): SheetNavResult {
  const current = input.searchParams.get(SHEET_PICKER_QUERY_KEY)

  if (input.open) {
    if (current === input.key) {
      return { action: "noop" }
    }
    const next = cloneParams(input.searchParams)
    next.set(SHEET_PICKER_QUERY_KEY, input.key)
    const url = toUrl(input.pathname, next)
    if (current === null) {
      return { action: "push", url }
    }
    return { action: "replace", url }
  }

  if (current !== input.key) {
    return { action: "noop" }
  }

  if (input.wasPushed) {
    return { action: "back" }
  }

  const next = cloneParams(input.searchParams)
  next.delete(SHEET_PICKER_QUERY_KEY)
  return { action: "replace", url: toUrl(input.pathname, next) }
}

export function resolveSheetNavigation(input: {
  pathname: string
  searchParams: SearchParamsLike
  key: string
  open: boolean
  id?: string | null
  extraParams?: SheetExtraParams
  clearParams?: readonly string[]
  /** Params de la vista que la hoja no lleva: se descartan al abrirla. */
  clearOnOpen?: readonly string[]
  /** Abre una capa nueva aunque ya haya otra hoja abierta (overlay global). */
  pushOver?: boolean
  wasPushed: boolean
  closeMode?: SheetCloseMode
}): SheetNavResult {
  const currentSheet = input.searchParams.get(SHEET_QUERY_KEY)
  const currentId = input.searchParams.get(SHEET_ID_QUERY_KEY)

  if (input.open) {
    if (currentSheet === input.key) {
      const idChanged =
        input.id !== undefined && (currentId ?? null) !== (input.id ?? null)
      const extrasChanged = hasExtraParamChanges(
        new URLSearchParams(input.searchParams.toString()),
        input.extraParams
      )
      if (!idChanged && !extrasChanged) {
        return { action: "noop" }
      }
      const next = openedSheetParams(input)
      return { action: "replace", url: toUrl(input.pathname, next) }
    }

    const next = openedSheetParams(input)
    const url = toUrl(input.pathname, next)
    if (currentSheet === null || input.pushOver) {
      return { action: "push", url }
    }
    return { action: "replace", url }
  }

  if (currentSheet !== input.key) {
    return { action: "noop" }
  }

  if (input.wasPushed && input.closeMode !== "replace") {
    return { action: "back" }
  }

  const next = cloneParams(input.searchParams)
  next.delete(SHEET_QUERY_KEY)
  next.delete(SHEET_ID_QUERY_KEY)
  next.delete(SHEET_PICKER_QUERY_KEY)
  removeParams(next, input.clearParams)
  return { action: "replace", url: toUrl(input.pathname, next) }
}
