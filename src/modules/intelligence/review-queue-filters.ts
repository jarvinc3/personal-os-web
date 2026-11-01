import { formatDayMonthYear } from "@/src/shared/lib/date-format"
import { parseDate } from "@/src/shared/types/wheels.type"

import type { AiReviewStatus } from "./types/intelligence.types"

export const REVIEW_QUEUE_TABS = ["pending", "reviewed"] as const
export type ReviewQueueTab = (typeof REVIEW_QUEUE_TABS)[number]

export const REVIEW_QUEUE_STATUS_FILTERS = [
  "ALL",
  "CONFIRMED",
  "CORRECTED",
  "REJECTED",
] as const
export type ReviewQueueStatusFilter =
  (typeof REVIEW_QUEUE_STATUS_FILTERS)[number]

export const REVIEW_QUEUE_ORDER_FILTERS = ["OLDEST", "NEWEST"] as const
export type ReviewQueueOrderFilter = (typeof REVIEW_QUEUE_ORDER_FILTERS)[number]

export const REVIEW_QUEUE_PARTITION_FILTERS = [
  "ALL",
  "TRAIN",
  "VALIDATION",
  "HOLDOUT",
] as const
export type ReviewQueuePartitionFilter =
  (typeof REVIEW_QUEUE_PARTITION_FILTERS)[number]

export type ReviewQueueFilters = {
  /** Pestaña: pendientes o ya verificados. */
  tab: ReviewQueueTab
  status: ReviewQueueStatusFilter
  order: ReviewQueueOrderFilter
  partition: ReviewQueuePartitionFilter
  subject: string
  sender: string
  /** Día `YYYY-MM-DD`, completo en la zona del perfil. */
  dateFrom: string
  dateTo: string
}

/** Parámetros del contrato de `GET /intelligence/review-queue` (back #219). */
export type ReviewQueueApiQuery = {
  partition?: Exclude<ReviewQueuePartitionFilter, "ALL">
  status?: AiReviewStatus[]
  fromAddress?: string
  subject?: string
  dateFrom?: string
  dateTo?: string
  order?: ReviewQueueOrderFilter
}

export type ActiveReviewFilter =
  | { kind: "subject"; value: string }
  | { kind: "sender"; value: string }
  | { kind: "dateFrom"; value: string }
  | { kind: "dateTo"; value: string }
  | { kind: "order"; value: "NEWEST" }
  | { kind: "partition"; value: Exclude<ReviewQueuePartitionFilter, "ALL"> }
  | { kind: "status"; value: Exclude<ReviewQueueStatusFilter, "ALL"> }

export const REVIEW_QUEUE_FILTER_KEYS = {
  tab: "queue",
  status: "status",
  order: "order",
  partition: "partition",
  subject: "q",
  sender: "sender",
  dateFrom: "from",
  dateTo: "to",
} as const

export const REVIEW_QUEUE_FILTER_DEFAULTS: ReviewQueueFilters = {
  tab: "pending",
  status: "ALL",
  order: "OLDEST",
  partition: "ALL",
  subject: "",
  sender: "",
  dateFrom: "",
  dateTo: "",
}

const REVIEWED_STATUSES: readonly AiReviewStatus[] = [
  "CONFIRMED",
  "CORRECTED",
  "REJECTED",
]

// Límites del DTO del backend (#219): un valor más largo se recorta antes de
// viajar para no provocar un 400 desde la URL.
const SUBJECT_MAX_LENGTH = 200
const SENDER_MAX_LENGTH = 320

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function isReviewQueueTab(
  value: string | undefined
): value is ReviewQueueTab {
  return REVIEW_QUEUE_TABS.some((tab) => tab === value)
}

export function isReviewQueueStatusFilter(
  value: string | undefined
): value is ReviewQueueStatusFilter {
  return REVIEW_QUEUE_STATUS_FILTERS.some((status) => status === value)
}

export function isReviewQueuePartitionFilter(
  value: string | undefined
): value is ReviewQueuePartitionFilter {
  return REVIEW_QUEUE_PARTITION_FILTERS.some((option) => option === value)
}

export function readReviewQueueFilters(search: {
  get(name: string): string | null
}): ReviewQueueFilters {
  const dateFrom = readDay(search.get(REVIEW_QUEUE_FILTER_KEYS.dateFrom))
  const dateTo = readDay(search.get(REVIEW_QUEUE_FILTER_KEYS.dateTo))
  const orderedDays = orderDays(dateFrom, dateTo)
  return {
    tab: readChoice(
      search.get(REVIEW_QUEUE_FILTER_KEYS.tab),
      isReviewQueueTab,
      REVIEW_QUEUE_FILTER_DEFAULTS.tab
    ),
    status: readChoice(
      search.get(REVIEW_QUEUE_FILTER_KEYS.status),
      isReviewQueueStatusFilter,
      REVIEW_QUEUE_FILTER_DEFAULTS.status
    ),
    order: readChoice(
      search.get(REVIEW_QUEUE_FILTER_KEYS.order),
      isReviewQueueOrderFilter,
      REVIEW_QUEUE_FILTER_DEFAULTS.order
    ),
    partition: readChoice(
      search.get(REVIEW_QUEUE_FILTER_KEYS.partition),
      isReviewQueuePartitionFilter,
      REVIEW_QUEUE_FILTER_DEFAULTS.partition
    ),
    subject: readText(
      search.get(REVIEW_QUEUE_FILTER_KEYS.subject),
      SUBJECT_MAX_LENGTH
    ),
    sender: readText(
      search.get(REVIEW_QUEUE_FILTER_KEYS.sender),
      SENDER_MAX_LENGTH
    ),
    dateFrom: orderedDays.from,
    dateTo: orderedDays.to,
  }
}

/** Un cambio parcial, ya normalizado, sobre los filtros actuales. */
export function applyReviewQueueFilterPatch(
  filters: ReviewQueueFilters,
  patch: Partial<ReviewQueueFilters>
): ReviewQueueFilters {
  const subject = patch.subject ?? filters.subject
  const sender = patch.sender ?? filters.sender
  return {
    ...filters,
    ...patch,
    subject: subject.trim().slice(0, SUBJECT_MAX_LENGTH),
    sender: sender.trim().slice(0, SENDER_MAX_LENGTH),
  }
}

/**
 * URL con el cambio aplicado, o `null` si nada cambió. Conserva el resto de
 * parámetros de la ruta (pestaña superior, hojas) y no escribe los valores por
 * defecto.
 */
export function reviewQueueFiltersHref(
  pathname: string,
  currentQuery: string,
  patch: Partial<ReviewQueueFilters>
): string | null {
  const current = new URLSearchParams(currentQuery)
  const nextFilters = applyReviewQueueFilterPatch(
    readReviewQueueFilters(current),
    patch
  )
  const next = new URLSearchParams(currentQuery)
  writeFilter(next, REVIEW_QUEUE_FILTER_KEYS.tab, nextFilters.tab, "pending")
  writeFilter(next, REVIEW_QUEUE_FILTER_KEYS.status, nextFilters.status, "ALL")
  writeFilter(next, REVIEW_QUEUE_FILTER_KEYS.order, nextFilters.order, "OLDEST")
  writeFilter(
    next,
    REVIEW_QUEUE_FILTER_KEYS.partition,
    nextFilters.partition,
    "ALL"
  )
  writeFilter(next, REVIEW_QUEUE_FILTER_KEYS.subject, nextFilters.subject, "")
  writeFilter(next, REVIEW_QUEUE_FILTER_KEYS.sender, nextFilters.sender, "")
  writeFilter(next, REVIEW_QUEUE_FILTER_KEYS.dateFrom, nextFilters.dateFrom, "")
  writeFilter(next, REVIEW_QUEUE_FILTER_KEYS.dateTo, nextFilters.dateTo, "")

  const nextHref = toHref(pathname, next)
  const currentHref = toHref(pathname, current)
  return nextHref === currentHref ? null : nextHref
}

/**
 * Mantiene el rango ordenado al elegir un día: un `Desde` posterior al `Hasta`
 * mueve el otro extremo en vez de dejar una petición que el API rechaza.
 */
export function reviewQueueDatePatch(
  field: "dateFrom" | "dateTo",
  day: string,
  filters: ReviewQueueFilters
): Partial<ReviewQueueFilters> {
  if (field === "dateFrom") {
    const movesTo = Boolean(day && filters.dateTo && day > filters.dateTo)
    return { dateFrom: day, ...(movesTo ? { dateTo: day } : {}) }
  }
  const movesFrom = Boolean(day && filters.dateFrom && day < filters.dateFrom)
  return { dateTo: day, ...(movesFrom ? { dateFrom: day } : {}) }
}

export function reviewQueueApiQuery(
  filters: ReviewQueueFilters
): ReviewQueueApiQuery {
  const query: ReviewQueueApiQuery = {}
  if (filters.partition !== "ALL") {
    query.partition = filters.partition
  }
  const statuses = reviewQueueTabStatuses(filters)
  if (statuses) {
    query.status = statuses
  }
  if (filters.sender) {
    query.fromAddress = filters.sender
  }
  if (filters.subject) {
    query.subject = filters.subject
  }
  if (filters.dateFrom) {
    query.dateFrom = filters.dateFrom
  }
  if (filters.dateTo) {
    query.dateTo = filters.dateTo
  }
  if (filters.order === "NEWEST") {
    query.order = filters.order
  }
  return query
}

export function reviewQueueApiSearchParams(
  query: ReviewQueueApiQuery
): URLSearchParams {
  const params = new URLSearchParams()
  if (query.partition) {
    params.set("partition", query.partition)
  }
  if (query.status?.length) {
    params.set("status", query.status.join(","))
  }
  if (query.fromAddress) {
    params.set("fromAddress", query.fromAddress)
  }
  if (query.subject) {
    params.set("subject", query.subject)
  }
  if (query.dateFrom) {
    params.set("dateFrom", query.dateFrom)
  }
  if (query.dateTo) {
    params.set("dateTo", query.dateTo)
  }
  if (query.order) {
    params.set("order", query.order)
  }
  return params
}

/**
 * Estados que se piden al API. Pendientes no manda `status`: el servidor ya
 * devuelve solo lo no verificado, y en Revisados se piden los tres veredictos o
 * el elegido.
 */
export function reviewQueueTabStatuses(
  filters: ReviewQueueFilters
): AiReviewStatus[] | undefined {
  if (filters.tab === "pending") {
    return undefined
  }
  return filters.status === "ALL" ? [...REVIEWED_STATUSES] : [filters.status]
}

export function activeReviewFilters(
  filters: ReviewQueueFilters
): ActiveReviewFilter[] {
  const active: ActiveReviewFilter[] = []
  if (filters.subject) {
    active.push({ kind: "subject", value: filters.subject })
  }
  if (filters.sender) {
    active.push({ kind: "sender", value: filters.sender })
  }
  if (filters.dateFrom) {
    active.push({ kind: "dateFrom", value: filters.dateFrom })
  }
  if (filters.dateTo) {
    active.push({ kind: "dateTo", value: filters.dateTo })
  }
  if (filters.order === "NEWEST") {
    active.push({ kind: "order", value: "NEWEST" })
  }
  if (filters.partition !== "ALL") {
    active.push({ kind: "partition", value: filters.partition })
  }
  if (filters.tab === "reviewed" && filters.status !== "ALL") {
    active.push({ kind: "status", value: filters.status })
  }
  return active
}

/** Limpiar deja la pestaña actual y vuelve a la cola completa de esa pestaña. */
export function clearReviewFilters(
  filters: ReviewQueueFilters
): ReviewQueueFilters {
  return { ...REVIEW_QUEUE_FILTER_DEFAULTS, tab: filters.tab }
}

/** Día `YYYY-MM-DD` con el locale del perfil, o el valor crudo si no es válido. */
export function formatReviewDay(day: string, locale: string): string {
  const parsed = parseDate(day)
  if (!parsed) {
    return day
  }
  return formatDayMonthYear(
    new Date(Number(parsed.year), Number(parsed.month) - 1, Number(parsed.day)),
    locale
  )
}

function isReviewQueueOrderFilter(
  value: string | undefined
): value is ReviewQueueOrderFilter {
  return REVIEW_QUEUE_ORDER_FILTERS.some((option) => option === value)
}

function readChoice<T extends string>(
  value: string | null,
  isValid: (candidate: string | undefined) => candidate is T,
  fallback: T
): T {
  const candidate = value ?? undefined
  return isValid(candidate) ? candidate : fallback
}

function readText(value: string | null, maxLength: number): string {
  return (value ?? "").trim().slice(0, maxLength)
}

function readDay(value: string | null): string {
  const day = (value ?? "").trim()
  if (!DAY_PATTERN.test(day)) {
    return ""
  }
  const parsed = new Date(`${day}T00:00:00.000Z`)
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== day
  ) {
    return ""
  }
  return day
}

function orderDays(
  dateFrom: string,
  dateTo: string
): { from: string; to: string } {
  if (dateFrom && dateTo && dateFrom > dateTo) {
    return { from: dateTo, to: dateFrom }
  }
  return { from: dateFrom, to: dateTo }
}

function writeFilter(
  params: URLSearchParams,
  key: string,
  value: string,
  fallback: string
): void {
  const nextValue = value && value !== fallback ? value : null
  const currentValue = params.get(key)
  if (nextValue === currentValue) {
    return
  }
  if (nextValue === null) {
    params.delete(key)
    return
  }
  params.set(key, nextValue)
}

function toHref(pathname: string, params: URLSearchParams): string {
  const query = params.toString()
  return query ? `${pathname}?${query}` : pathname
}
