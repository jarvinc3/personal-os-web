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

export const REVIEW_QUEUE_ORDER_FILTERS = [
  "OLDEST",
  "NEWEST",
  "IMPACT",
] as const
export type ReviewQueueOrderFilter = (typeof REVIEW_QUEUE_ORDER_FILTERS)[number]

export const REVIEW_QUEUE_SEMANTIC_TYPE_FILTERS = [
  "ALL",
  "FIN_TRANSACTION",
  "PURCHASE_RECEIPT",
  "SUBSCRIPTION_BILLING",
  "FIN_STATEMENT_NOTICE",
  "FIN_ACCOUNT_NOTICE",
  "SECURITY_OTP",
  "SECURITY_ALERT",
  "TECH_NOTIFICATION",
  "JOB",
  "CALENDAR_EVENT",
  "MARKETING",
  "SOCIAL",
  "OTHER",
] as const
export type ReviewQueueSemanticTypeFilter =
  (typeof REVIEW_QUEUE_SEMANTIC_TYPE_FILTERS)[number]

export const REVIEW_QUEUE_ROUTE_FILTERS = [
  "ALL",
  "FINANCE",
  "SUBSCRIPTIONS",
  "CALENDAR",
  "SECURITY",
] as const
export type ReviewQueueRouteFilter = (typeof REVIEW_QUEUE_ROUTE_FILTERS)[number]

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
  semanticType: ReviewQueueSemanticTypeFilter
  route: ReviewQueueRouteFilter
  confidenceMin: number | null
  confidenceMax: number | null
  /** Día `YYYY-MM-DD`, completo en la zona del perfil. */
  dateFrom: string
  dateTo: string
  uncertain: boolean
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
  uncertain?: boolean
  semanticType?: Exclude<ReviewQueueSemanticTypeFilter, "ALL">
  route?: Exclude<ReviewQueueRouteFilter, "ALL">
  confidenceMin?: number
  confidenceMax?: number
}

export type ActiveReviewFilter =
  | { kind: "subject"; value: string }
  | { kind: "sender"; value: string }
  | { kind: "dateFrom"; value: string }
  | { kind: "dateTo"; value: string }
  | { kind: "order"; value: "NEWEST" }
  | { kind: "order"; value: "IMPACT" }
  | {
      kind: "semanticType"
      value: Exclude<ReviewQueueSemanticTypeFilter, "ALL">
    }
  | { kind: "route"; value: Exclude<ReviewQueueRouteFilter, "ALL"> }
  | { kind: "confidenceMin"; value: number }
  | { kind: "confidenceMax"; value: number }
  | { kind: "partition"; value: Exclude<ReviewQueuePartitionFilter, "ALL"> }
  | { kind: "status"; value: Exclude<ReviewQueueStatusFilter, "ALL"> }
  | { kind: "uncertain" }

export const REVIEW_QUEUE_FILTER_KEYS = {
  tab: "queue",
  status: "status",
  order: "order",
  partition: "partition",
  subject: "q",
  sender: "sender",
  dateFrom: "from",
  dateTo: "to",
  uncertain: "uncertain",
  semanticType: "semanticType",
  route: "route",
  confidenceMin: "confidenceMin",
  confidenceMax: "confidenceMax",
} as const

export const REVIEW_QUEUE_FILTER_DEFAULTS: ReviewQueueFilters = {
  tab: "pending",
  status: "ALL",
  order: "OLDEST",
  partition: "ALL",
  subject: "",
  sender: "",
  semanticType: "ALL",
  route: "ALL",
  confidenceMin: null,
  confidenceMax: null,
  dateFrom: "",
  dateTo: "",
  uncertain: false,
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

export function isReviewQueueSemanticTypeFilter(
  value: string | undefined
): value is ReviewQueueSemanticTypeFilter {
  return REVIEW_QUEUE_SEMANTIC_TYPE_FILTERS.some((option) => option === value)
}

export function isReviewQueueRouteFilter(
  value: string | undefined
): value is ReviewQueueRouteFilter {
  return REVIEW_QUEUE_ROUTE_FILTERS.some((option) => option === value)
}

export function readReviewQueueFilters(search: {
  get(name: string): string | null
}): ReviewQueueFilters {
  const dateFrom = readDay(search.get(REVIEW_QUEUE_FILTER_KEYS.dateFrom))
  const dateTo = readDay(search.get(REVIEW_QUEUE_FILTER_KEYS.dateTo))
  const orderedDays = orderDays(dateFrom, dateTo)
  const confidence = orderConfidenceRange(
    readConfidence(search.get(REVIEW_QUEUE_FILTER_KEYS.confidenceMin)),
    readConfidence(search.get(REVIEW_QUEUE_FILTER_KEYS.confidenceMax))
  )
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
    semanticType: readChoice(
      search.get(REVIEW_QUEUE_FILTER_KEYS.semanticType),
      isReviewQueueSemanticTypeFilter,
      REVIEW_QUEUE_FILTER_DEFAULTS.semanticType
    ),
    route: readChoice(
      search.get(REVIEW_QUEUE_FILTER_KEYS.route),
      isReviewQueueRouteFilter,
      REVIEW_QUEUE_FILTER_DEFAULTS.route
    ),
    confidenceMin: confidence.min,
    confidenceMax: confidence.max,
    dateFrom: orderedDays.from,
    dateTo: orderedDays.to,
    uncertain: search.get(REVIEW_QUEUE_FILTER_KEYS.uncertain) === "true",
  }
}

/** Un cambio parcial, ya normalizado, sobre los filtros actuales. */
export function applyReviewQueueFilterPatch(
  filters: ReviewQueueFilters,
  patch: Partial<ReviewQueueFilters>
): ReviewQueueFilters {
  const subject = patch.subject ?? filters.subject
  const sender = patch.sender ?? filters.sender
  const confidence = orderConfidenceRange(
    patch.confidenceMin === undefined
      ? filters.confidenceMin
      : patch.confidenceMin,
    patch.confidenceMax === undefined
      ? filters.confidenceMax
      : patch.confidenceMax
  )
  return {
    ...filters,
    ...patch,
    subject: subject.trim().slice(0, SUBJECT_MAX_LENGTH),
    sender: sender.trim().slice(0, SENDER_MAX_LENGTH),
    confidenceMin: confidence.min,
    confidenceMax: confidence.max,
  }
}

/**
 * Une un cambio en el borrador de la hoja sin recortar el texto: recortar en
 * cada tecla borra el espacio que separa la palabra que se está escribiendo.
 */
export function patchReviewQueueDraft(
  draft: ReviewQueueFilters,
  patch: Partial<ReviewQueueFilters>
): ReviewQueueFilters {
  return { ...draft, ...patch }
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
  writeFilter(
    next,
    REVIEW_QUEUE_FILTER_KEYS.semanticType,
    nextFilters.semanticType,
    "ALL"
  )
  writeFilter(next, REVIEW_QUEUE_FILTER_KEYS.route, nextFilters.route, "ALL")
  writeFilter(
    next,
    REVIEW_QUEUE_FILTER_KEYS.confidenceMin,
    nextFilters.confidenceMin === null ? "" : String(nextFilters.confidenceMin),
    ""
  )
  writeFilter(
    next,
    REVIEW_QUEUE_FILTER_KEYS.confidenceMax,
    nextFilters.confidenceMax === null ? "" : String(nextFilters.confidenceMax),
    ""
  )
  writeFilter(next, REVIEW_QUEUE_FILTER_KEYS.dateFrom, nextFilters.dateFrom, "")
  writeFilter(next, REVIEW_QUEUE_FILTER_KEYS.dateTo, nextFilters.dateTo, "")
  writeFilter(
    next,
    REVIEW_QUEUE_FILTER_KEYS.uncertain,
    String(nextFilters.uncertain),
    "false"
  )

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
  if (filters.order !== "OLDEST") {
    query.order = filters.order
  }
  if (filters.uncertain) {
    query.uncertain = true
  }
  if (filters.semanticType !== "ALL") {
    query.semanticType = filters.semanticType
  }
  if (filters.route !== "ALL") {
    query.route = filters.route
  }
  if (filters.confidenceMin !== null) {
    query.confidenceMin = filters.confidenceMin
  }
  if (filters.confidenceMax !== null) {
    query.confidenceMax = filters.confidenceMax
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
  if (query.uncertain) {
    params.set("uncertain", "true")
  }
  if (query.semanticType) {
    params.set("semanticType", query.semanticType)
  }
  if (query.route) {
    params.set("route", query.route)
  }
  if (query.confidenceMin !== undefined) {
    params.set("confidenceMin", String(query.confidenceMin))
  }
  if (query.confidenceMax !== undefined) {
    params.set("confidenceMax", String(query.confidenceMax))
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
  } else if (filters.order === "IMPACT") {
    active.push({ kind: "order", value: "IMPACT" })
  }
  if (filters.semanticType !== "ALL") {
    active.push({ kind: "semanticType", value: filters.semanticType })
  }
  if (filters.route !== "ALL") {
    active.push({ kind: "route", value: filters.route })
  }
  if (filters.confidenceMin !== null) {
    active.push({ kind: "confidenceMin", value: filters.confidenceMin })
  }
  if (filters.confidenceMax !== null) {
    active.push({ kind: "confidenceMax", value: filters.confidenceMax })
  }
  if (filters.partition !== "ALL") {
    active.push({ kind: "partition", value: filters.partition })
  }
  if (filters.tab === "reviewed" && filters.status !== "ALL") {
    active.push({ kind: "status", value: filters.status })
  }
  if (filters.uncertain) {
    active.push({ kind: "uncertain" })
  }
  return active
}

/** Quita solo el filtro de un chip y conserva el resto de la búsqueda. */
export function removeReviewFilter(
  filters: ReviewQueueFilters,
  filter: ActiveReviewFilter
): ReviewQueueFilters {
  switch (filter.kind) {
    case "subject":
      return { ...filters, subject: "" }
    case "sender":
      return { ...filters, sender: "" }
    case "dateFrom":
      return { ...filters, dateFrom: "" }
    case "dateTo":
      return { ...filters, dateTo: "" }
    case "order":
      return { ...filters, order: "OLDEST" }
    case "semanticType":
      return { ...filters, semanticType: "ALL" }
    case "route":
      return { ...filters, route: "ALL" }
    case "confidenceMin":
      return { ...filters, confidenceMin: null }
    case "confidenceMax":
      return { ...filters, confidenceMax: null }
    case "partition":
      return { ...filters, partition: "ALL" }
    case "status":
      return { ...filters, status: "ALL" }
    case "uncertain":
      return { ...filters, uncertain: false }
  }
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

function readConfidence(value: string | null): number | null {
  if (value === null || value.trim() === "") {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : null
}

function orderConfidenceRange(
  min: number | null,
  max: number | null
): { min: number | null; max: number | null } {
  if (min !== null && max !== null && min > max) {
    return { min: max, max: min }
  }
  return { min, max }
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
