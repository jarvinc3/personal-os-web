export const INSTITUTION_VIEW_STORAGE_KEY = "finance.products.institution.view"

export type InstitutionView = "stacked" | "carousel"

const DEFAULT_INSTITUTION_VIEW: InstitutionView = "stacked"

export function isInstitutionView(
  value: string | null
): value is InstitutionView {
  return value === "stacked" || value === "carousel"
}

/** `null` while rendering on the server, where there is no `localStorage`. */
function browserStorage(): Pick<Storage, "getItem" | "setItem"> | null {
  if (typeof window === "undefined") {
    return null
  }
  return window.localStorage
}

export function readInstitutionView(
  storage: Pick<Storage, "getItem"> | null = browserStorage()
): InstitutionView {
  if (!storage) {
    return DEFAULT_INSTITUTION_VIEW
  }
  const stored = storage.getItem(INSTITUTION_VIEW_STORAGE_KEY)
  return isInstitutionView(stored) ? stored : DEFAULT_INSTITUTION_VIEW
}

export function writeInstitutionView(
  view: InstitutionView,
  storage: Pick<Storage, "setItem"> | null = browserStorage()
): void {
  if (!storage) {
    return
  }
  storage.setItem(INSTITUTION_VIEW_STORAGE_KEY, view)
}
