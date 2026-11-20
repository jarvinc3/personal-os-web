import type { AgentInvocationContext } from "@/src/modules/intelligence/types/agent-chat.types"

const SESSION_PREFIX = "personal-os:view-suggestions-hidden:"

export type ViewSuggestionScope = {
  route: string
  view?: string
  sheet?: string
}

type SearchParamsLike = {
  get(name: string): string | null
}

type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/** La vista de sugerencias es ruta más tab o sheet, sin filtros ni entidad. */
export function buildViewSuggestionScope({
  pathname,
  searchParams,
  includeSheet = false,
}: {
  pathname: string
  searchParams: SearchParamsLike
  includeSheet?: boolean
}): ViewSuggestionScope {
  const sheet = searchParams.get("sheet")
  const activeSheet =
    includeSheet && sheet && sheet !== "agent-chat" ? sheet : null
  const tab = searchParams.get("tab")
  return {
    route: pathname || "/",
    ...(activeSheet ? { sheet: activeSheet } : tab ? { view: tab } : {}),
  }
}

export function viewSuggestionScopeFromContext(
  context: AgentInvocationContext
): ViewSuggestionScope {
  if (context.sheet) {
    return { route: context.route, sheet: context.sheet }
  }
  if (context.view) {
    return { route: context.route, view: context.view }
  }
  return { route: context.route }
}

export function viewSuggestionScopeKey(scope: ViewSuggestionScope): string {
  return JSON.stringify([scope.route, scope.view ?? null, scope.sheet ?? null])
}

export function viewSuggestionQueryString(scope: ViewSuggestionScope): string {
  const params = new URLSearchParams({ route: scope.route })
  if (scope.sheet) {
    params.set("sheet", scope.sheet)
  } else if (scope.view) {
    params.set("view", scope.view)
  }
  return params.toString()
}

function resolveSessionStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null
  }
  try {
    return window.sessionStorage
  } catch (error) {
    if (error instanceof DOMException) {
      return null
    }
    throw new Error("No se pudo leer el almacenamiento de la sesión", {
      cause: error,
    })
  }
}

export function isViewSuggestionsHidden(
  scope: ViewSuggestionScope,
  storage: StorageLike | null = resolveSessionStorage()
): boolean {
  return (
    storage?.getItem(`${SESSION_PREFIX}${viewSuggestionScopeKey(scope)}`) ===
    "1"
  )
}

export function hideViewSuggestions(
  scope: ViewSuggestionScope,
  storage: StorageLike | null = resolveSessionStorage()
): void {
  storage?.setItem(`${SESSION_PREFIX}${viewSuggestionScopeKey(scope)}`, "1")
}
