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
  id: string | null | undefined,
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
