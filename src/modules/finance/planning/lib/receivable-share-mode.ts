import type { FinanceReceivable } from "@/src/modules/finance/shared/types/entities"

/** Query param that keeps the selection mode and the chosen cobros in the URL. */
export const SHARE_MODE_QUERY_KEY = "compartir"

export const SHARE_ALL_LABEL = "Todos de"

type SearchParamsLike = {
  get(name: string): string | null
}

export type ShareMode = {
  /** Mode is on as soon as the param exists, even with nothing picked yet. */
  active: boolean
  selectedIds: string[]
}

function parseIds(raw: string): string[] {
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
}

export function readShareMode(searchParams: SearchParamsLike): ShareMode {
  const raw = searchParams.get(SHARE_MODE_QUERY_KEY)
  if (raw === null) {
    return { active: false, selectedIds: [] }
  }
  return { active: true, selectedIds: parseIds(raw) }
}

export function toggleShareSelection(
  selectedIds: readonly string[],
  id: string
): string[] {
  if (selectedIds.includes(id)) {
    return selectedIds.filter((current) => current !== id)
  }
  return [...selectedIds, id]
}

/** URL of the planning route with the mode written, or null when unchanged. */
export function shareModeUrl({
  pathname,
  query,
  active,
  selectedIds,
}: {
  pathname: string
  query: string
  active: boolean
  selectedIds: readonly string[]
}): string | null {
  const params = new URLSearchParams(query)
  const current = params.get(SHARE_MODE_QUERY_KEY)
  const next = active ? selectedIds.join(",") : null
  if ((current ?? null) === next) {
    return null
  }

  if (next === null) {
    params.delete(SHARE_MODE_QUERY_KEY)
  } else {
    params.set(SHARE_MODE_QUERY_KEY, next)
  }

  const search = params.toString()
  return search ? `${pathname}?${search}` : pathname
}

export function selectedReceivables(
  receivables: readonly FinanceReceivable[],
  selectedIds: readonly string[]
): FinanceReceivable[] {
  return receivables.filter((receivable) => selectedIds.includes(receivable.id))
}

export function shareSelectionTitle(count: number): string {
  return count === 1 ? "1 seleccionado" : `${count} seleccionados`
}

/** Every listed cobro of the debtor that is already part of the selection. */
export function debtorSelectionIds({
  receivables,
  selectedIds,
}: {
  receivables: readonly FinanceReceivable[]
  selectedIds: readonly string[]
}): string[] {
  const selected = selectedReceivables(receivables, selectedIds)
  const debtorName = selected[0]?.debtorName
  if (!debtorName) {
    return []
  }
  return receivables
    .filter((receivable) => receivable.debtorName === debtorName)
    .map((receivable) => receivable.id)
}
