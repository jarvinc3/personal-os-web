export const SHEET_QUERY_KEY = "sheet"
export const SHEET_ID_QUERY_KEY = "sheetId"

type SearchParamsLike = {
  get(name: string): string | null
  toString(): string
}

export type SheetNavResult =
  | { action: "noop" }
  | { action: "push"; url: string }
  | { action: "replace"; url: string }
  | { action: "back" }

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
  if (id) {
    params.set(SHEET_ID_QUERY_KEY, id)
  } else {
    params.delete(SHEET_ID_QUERY_KEY)
  }
}

export function resolveSheetNavigation(input: {
  pathname: string
  searchParams: SearchParamsLike
  key: string
  open: boolean
  id?: string | null
  wasPushed: boolean
}): SheetNavResult {
  const currentSheet = input.searchParams.get(SHEET_QUERY_KEY)
  const currentId = input.searchParams.get(SHEET_ID_QUERY_KEY)

  if (input.open) {
    if (currentSheet === input.key) {
      if (input.id === undefined) {
        return { action: "noop" }
      }
      if ((currentId ?? null) === (input.id ?? null)) {
        return { action: "noop" }
      }
      const next = cloneParams(input.searchParams)
      writeSheet(next, input.key, input.id)
      return { action: "replace", url: toUrl(input.pathname, next) }
    }

    const next = cloneParams(input.searchParams)
    writeSheet(next, input.key, input.id)
    const url = toUrl(input.pathname, next)
    if (currentSheet === null) {
      return { action: "push", url }
    }
    return { action: "replace", url }
  }

  if (currentSheet !== input.key) {
    return { action: "noop" }
  }

  if (input.wasPushed) {
    return { action: "back" }
  }

  const next = cloneParams(input.searchParams)
  next.delete(SHEET_QUERY_KEY)
  next.delete(SHEET_ID_QUERY_KEY)
  return { action: "replace", url: toUrl(input.pathname, next) }
}
