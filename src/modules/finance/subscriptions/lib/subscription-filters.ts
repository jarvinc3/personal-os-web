import type {
  FinanceSubscriptionListQuery,
  FinanceSubscriptionStatus,
} from "@/src/modules/finance/shared/types/entities"
import { splitLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"

export const SUBSCRIPTION_SORTS = ["NEXT_DATE", "AMOUNT", "NAME"] as const
export type SubscriptionSort = (typeof SUBSCRIPTION_SORTS)[number]

export const SUBSCRIPTION_FREQUENCIES = ["MONTHLY", "YEARLY", "OTHER"] as const
export type SubscriptionFrequency = (typeof SUBSCRIPTION_FREQUENCIES)[number]

export const SUBSCRIPTION_SORT_LABEL: Record<SubscriptionSort, string> = {
  NEXT_DATE: "Próximo cobro",
  AMOUNT: "Monto",
  NAME: "Nombre",
}

export const SUBSCRIPTION_FREQUENCY_LABEL: Record<
  SubscriptionFrequency,
  string
> = {
  MONTHLY: "Mensual",
  YEARLY: "Anual",
  OTHER: "Otra",
}

export type SubscriptionFilters = {
  status: "ALL" | FinanceSubscriptionStatus
  frequency: "ALL" | SubscriptionFrequency
  categoryIds: string[]
  /** Encoded ledger target (`card:<id>` / `account:<id>`) of the payment method. */
  method: string | null
  q: string
  sort: SubscriptionSort
}

export const EMPTY_SUBSCRIPTION_FILTERS: SubscriptionFilters = {
  status: "ALL",
  frequency: "ALL",
  categoryIds: [],
  method: null,
  q: "",
  sort: "NEXT_DATE",
}

const STATUS_CHIP_LABEL: Record<FinanceSubscriptionStatus, string> = {
  ACTIVE: "Activas",
  PAUSED: "Pausadas",
  CANCELLED: "Canceladas",
}

export type SubscriptionFilterChip = {
  key: "status" | "frequency" | "method" | "category"
  label: string
  /** Category id when the chip dismisses a single category. */
  categoryId?: string
}

/**
 * Chips of the filters that are on, in the order the header shows them. The
 * search box is not a chip: it has its own control in the sheet.
 */
export function subscriptionFilterChips(input: {
  filters: SubscriptionFilters
  methodLabel: string | null
  categoryLabels: Record<string, string>
}): SubscriptionFilterChip[] {
  const chips: SubscriptionFilterChip[] = []
  if (input.filters.status !== "ALL") {
    chips.push({
      key: "status",
      label: STATUS_CHIP_LABEL[input.filters.status],
    })
  }
  if (input.filters.frequency !== "ALL") {
    chips.push({
      key: "frequency",
      label: SUBSCRIPTION_FREQUENCY_LABEL[input.filters.frequency],
    })
  }
  if (input.filters.method) {
    chips.push({
      key: "method",
      label: input.methodLabel ?? "Método de pago",
    })
  }
  for (const categoryId of input.filters.categoryIds) {
    chips.push({
      key: "category",
      label: input.categoryLabels[categoryId] ?? "Categoría",
      categoryId,
    })
  }
  return chips
}

/** Number of active filters, shown on the filter icon. */
export function activeSubscriptionFilterCount(
  filters: SubscriptionFilters
): number {
  return (
    (filters.status === "ALL" ? 0 : 1) +
    (filters.frequency === "ALL" ? 0 : 1) +
    (filters.method ? 1 : 0) +
    filters.categoryIds.length
  )
}

export function clearSubscriptionFilter(
  filters: SubscriptionFilters,
  chip: SubscriptionFilterChip
): SubscriptionFilters {
  if (chip.key === "status") {
    return { ...filters, status: "ALL" }
  }
  if (chip.key === "frequency") {
    return { ...filters, frequency: "ALL" }
  }
  if (chip.key === "method") {
    return { ...filters, method: null }
  }
  return {
    ...filters,
    categoryIds: filters.categoryIds.filter((id) => id !== chip.categoryId),
  }
}

/** Chip and row label of the chosen payment method. */
export function subscriptionMethodLabel(input: {
  method: string | null
  accounts: readonly { id: string; name: string }[]
  cards: readonly { id: string; name: string; lastFour: string | null }[]
}): string | null {
  const target = input.method ? splitLedgerTarget(input.method) : {}
  if (target.cardId) {
    const card = input.cards.find((item) => item.id === target.cardId)
    if (!card) {
      return null
    }
    return card.lastFour ? `${card.name} ••${card.lastFour}` : card.name
  }
  if (target.accountId) {
    const account = input.accounts.find((item) => item.id === target.accountId)
    return account?.name ?? null
  }
  return null
}

/** Query the list sends to the API. Ordering and grouping are the back's job. */
export function subscriptionListQuery(
  filters: SubscriptionFilters
): FinanceSubscriptionListQuery {
  const method = filters.method ? splitLedgerTarget(filters.method) : {}
  const search = filters.q.trim()
  return {
    status: filters.status === "ALL" ? undefined : filters.status,
    frequency: filters.frequency === "ALL" ? undefined : filters.frequency,
    sort: filters.sort,
    categoryIds:
      filters.categoryIds.length > 0
        ? filters.categoryIds.join(",")
        : undefined,
    cardId: method.cardId,
    accountId: method.accountId,
    q: search || undefined,
  }
}

const STATUS_VALUES: readonly string[] = ["ACTIVE", "PAUSED", "CANCELLED"]
const SORT_VALUES: readonly string[] = SUBSCRIPTION_SORTS
const FREQUENCY_VALUES: readonly string[] = SUBSCRIPTION_FREQUENCIES
const FILTER_PARAM_KEYS = [
  "estado",
  "frecuencia",
  "categorias",
  "metodo",
  "q",
  "orden",
] as const

function asValue<T extends string>(
  value: string | null,
  allowed: readonly string[]
): T | null {
  return value && allowed.includes(value) ? (value as T) : null
}

/** Filters serialised as query string, so a reload keeps the view. */
export function subscriptionFiltersToSearchParams(
  filters: SubscriptionFilters
): string {
  const params = new URLSearchParams()
  if (filters.status !== "ALL") {
    params.set("estado", filters.status)
  }
  if (filters.frequency !== "ALL") {
    params.set("frecuencia", filters.frequency)
  }
  if (filters.categoryIds.length > 0) {
    params.set("categorias", filters.categoryIds.join(","))
  }
  if (filters.method) {
    params.set("metodo", filters.method)
  }
  if (filters.q.trim()) {
    params.set("q", filters.q.trim())
  }
  if (filters.sort !== EMPTY_SUBSCRIPTION_FILTERS.sort) {
    params.set("orden", filters.sort)
  }
  return params.toString()
}

/**
 * Query string with only the filter params replaced. Anything else on the URL
 * (the open sheet, the detail tab) survives the change.
 */
export function withSubscriptionFilters(
  base: string,
  filters: SubscriptionFilters
): string {
  const params = new URLSearchParams(base)
  for (const key of FILTER_PARAM_KEYS) {
    params.delete(key)
  }
  const encoded = new URLSearchParams(
    subscriptionFiltersToSearchParams(filters)
  )
  encoded.forEach((value, key) => params.set(key, value))
  return params.toString()
}

export function subscriptionFiltersFromSearchParams(params: {
  get(name: string): string | null
}): SubscriptionFilters {
  const categories = (params.get("categorias") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
  return {
    status:
      asValue<FinanceSubscriptionStatus>(params.get("estado"), STATUS_VALUES) ??
      "ALL",
    frequency:
      asValue<SubscriptionFrequency>(
        params.get("frecuencia"),
        FREQUENCY_VALUES
      ) ?? "ALL",
    categoryIds: categories,
    method: params.get("metodo") || null,
    q: params.get("q") ?? "",
    sort:
      asValue<SubscriptionSort>(params.get("orden"), SORT_VALUES) ??
      "NEXT_DATE",
  }
}
