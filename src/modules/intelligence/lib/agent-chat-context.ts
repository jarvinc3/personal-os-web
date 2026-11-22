import { AGENT_CHAT_CONTEXT_PARAM } from "@/src/modules/intelligence/constants/agent-chat"
import {
  buildEntityRef,
  readRouteEntity,
} from "@/src/modules/intelligence/lib/agent-route-entity"
import type {
  AgentInvocationContext,
  AgentInvocationEntityRef,
  AgentInvocationEntityType,
} from "@/src/modules/intelligence/types/agent-chat.types"

const FILTER_EXCLUDED_KEYS = new Set([
  "sheet",
  "sheetId",
  "picker",
  "tab",
  "returnTo",
  "suggestion",
  AGENT_CHAT_CONTEXT_PARAM,
])

const CONTEXT_FILTER_LIMIT = 2000

const FINANCE_SECTION_LABELS: ReadonlyArray<[string, string]> = [
  ["/finance/transactions", "Movimientos"],
  ["/finance/planning", "Planificación"],
  ["/finance/budgets", "Planificación"],
  ["/finance/savings-goals", "Planificación"],
  ["/finance/receivables", "Planificación"],
  ["/finance/loans", "Planificación"],
  ["/finance/subscriptions", "Suscripciones"],
  ["/finance/products", "Productos"],
  ["/finance/categories", "Productos"],
  ["/finance/bank-charges", "Productos"],
  ["/finance/merchants", "Productos"],
  ["/finance/recycle-bin", "Productos"],
  ["/finance/wealth", "Productos"],
  ["/finance/institutions", "Productos"],
  ["/finance/cash", "Productos"],
  ["/finance/imports", "Productos"],
]

const SHEET_ENTITY_TYPES: Record<string, AgentInvocationEntityType> = {
  "transaction-options-sheet": "transaction",
  "account-sheet": "account",
  "cash-account-options-sheet": "account",
  "card-options-sheet": "card",
  "loan-options-sheet": "loan",
  "budget-sheet": "budget",
  "budget-options-sheet": "budget",
  "savings-sheet": "savings_goal",
  "savings-options-sheet": "savings_goal",
  "receivable-sheet": "receivable",
  "receivable-options-sheet": "receivable",
  "subscription-sheet": "subscription",
  "merchant-edit-sheet": "merchant",
  "category-sheet": "category",
  "institution-options-sheet": "institution",
}

const ROUTE_LABELS: Record<string, string> = {
  "/home": "Inicio",
  "/settings": "Ajustes",
  "/notifications": "Notificaciones",
  "/keep-awake": "Keep Awake",
  "/intelligence": "Inteligencia",
  "/agenda": "Agenda",
  "/projects": "Proyectos",
  "/health": "Salud",
  "/help": "Ayuda",
}

type SearchParamsLike = {
  get(name: string): string | null
  toString(): string
}

function readSheetEntity(
  sheet: string | null,
  sheetId: string | null
): AgentInvocationEntityRef | undefined {
  if (!sheet) {
    return undefined
  }
  const type = SHEET_ENTITY_TYPES[sheet]
  return type ? buildEntityRef(type, sheetId ?? undefined) : undefined
}

function readFilters(
  searchParams: SearchParamsLike
): Record<string, string | string[]> | undefined {
  const filters: Record<string, string | string[]> = {}
  const params = new URLSearchParams(searchParams.toString())
  for (const [key, value] of params) {
    if (FILTER_EXCLUDED_KEYS.has(key)) {
      continue
    }
    const current = filters[key]
    if (current === undefined) {
      filters[key] = value
    } else if (Array.isArray(current)) {
      current.push(value)
    } else {
      filters[key] = [current, value]
    }
  }
  return Object.keys(filters).length > 0 ? filters : undefined
}

/** La vista del contexto es la hoja abierta o, si no hay, la pestaña activa. */
function resolveSheetOrView(
  sheet: string | null,
  tab: string | null
): Pick<AgentInvocationContext, "sheet" | "view"> {
  if (sheet) {
    return { sheet }
  }
  if (tab) {
    return { view: tab }
  }
  return {}
}

/** Contexto que viaja al agente al abrir o enviar un mensaje. */
export function buildAgentInvocationContext({
  pathname,
  searchParams,
}: {
  pathname: string
  searchParams: SearchParamsLike
}): AgentInvocationContext {
  const sheet = searchParams.get("sheet")
  const activeSheet = sheet === "agent-chat" ? null : sheet
  const tab = searchParams.get("tab")
  const context: AgentInvocationContext = {
    route: pathname || "/",
    ...resolveSheetOrView(activeSheet, tab),
  }

  const entityRef =
    readRouteEntity(pathname) ??
    readSheetEntity(activeSheet, searchParams.get("sheetId"))
  if (entityRef) {
    context.entityRef = entityRef
  }
  const filters = readFilters(searchParams)
  if (filters) {
    context.filters = filters
  }
  if (JSON.stringify(context).length > CONTEXT_FILTER_LIMIT) {
    delete context.filters
  }
  return context
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/")
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, "="))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export function encodeAgentContext(context: AgentInvocationContext): string {
  return toBase64Url(JSON.stringify(context))
}

export function decodeAgentContext(
  value: string | null | undefined
): AgentInvocationContext | null {
  if (!value) {
    return null
  }
  try {
    const parsed: unknown = JSON.parse(fromBase64Url(value))
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed) ||
      typeof (parsed as { route?: unknown }).route !== "string"
    ) {
      return null
    }
    return parsed as AgentInvocationContext
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof DOMException) {
      return null
    }
    throw new Error("No se pudo leer el contexto del agente", {
      cause: error,
    })
  }
}

function compareRouteLabels(left: string, right: string): number {
  if (left < right) {
    return -1
  }
  if (left > right) {
    return 1
  }
  return 0
}

export function agentContextLabel(
  context: AgentInvocationContext | null | undefined
): string {
  if (!context) {
    return "Sin contexto"
  }
  const route = context.route
  if (route.startsWith("/finance")) {
    const section = FINANCE_SECTION_LABELS.find(
      ([prefix]) => route === prefix || route.startsWith(`${prefix}/`)
    )?.[1]
    return section ? `Finanzas · ${section}` : "Finanzas"
  }
  const matched = Object.entries(ROUTE_LABELS)
    .sort(([left], [right]) => right.length - left.length)
    .find(([prefix]) => route === prefix || route.startsWith(`${prefix}/`))
  return matched?.[1] ?? route
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(canonicalize)
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => compareRouteLabels(left, right))
        .map(([key, item]) => [key, canonicalize(item)])
    )
  }
  return value
}

/** Misma clave SHA-256 canónica que usa el back para `conversations/latest`. */
export async function agentInvocationContextKey(
  context: AgentInvocationContext
): Promise<string> {
  const canonical = JSON.stringify(canonicalize(context))
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical)
  )
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}
