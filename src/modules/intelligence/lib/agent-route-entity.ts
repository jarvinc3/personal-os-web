import type {
  AgentInvocationEntityRef,
  AgentInvocationEntityType,
} from "@/src/modules/intelligence/types/agent-chat.types"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUuid(value: string | undefined): value is string {
  return Boolean(value && UUID_PATTERN.test(value))
}

export function buildEntityRef(
  type: AgentInvocationEntityType,
  id: string | undefined
): AgentInvocationEntityRef | undefined {
  return isUuid(id) ? { type, id } : undefined
}

function readRouteSegments(pathname: string): string[] {
  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment))
}

function readProductRouteEntity(
  segments: readonly string[]
): AgentInvocationEntityRef | undefined {
  if (segments[1] === "institutions") {
    if (segments[3] === "accounts") {
      return buildEntityRef("account", segments[4])
    }
    if (segments[3] === "cards") {
      return buildEntityRef("card", segments[4])
    }
    if (segments[2] === "new") {
      return undefined
    }
    return buildEntityRef("institution", segments[2])
  }
  if (segments[1] === "cash") {
    return buildEntityRef("account", segments[2])
  }
  if (segments[1] === "merchants") {
    return buildEntityRef("merchant", segments[2])
  }
  return undefined
}

function readPlanningRouteEntity(
  segments: readonly string[]
): AgentInvocationEntityRef | undefined {
  if (segments[1] === "loans" && segments[2] !== "new") {
    return buildEntityRef("loan", segments[2])
  }
  if (segments[1] === "budgets") {
    return buildEntityRef("budget", segments[2])
  }
  if (segments[1] === "savings-goals") {
    return buildEntityRef("savings_goal", segments[2])
  }
  if (segments[1] === "receivables") {
    return buildEntityRef("receivable", segments[2])
  }
  if (segments[1] === "subscriptions" && segments[2] !== "calendar") {
    return buildEntityRef("subscription", segments[2])
  }
  return undefined
}

/** Entidad de la ruta de detalle, si la URL trae un id válido para el agente. */
export function readRouteEntity(
  pathname: string
): AgentInvocationEntityRef | undefined {
  const segments = readRouteSegments(pathname)
  if (segments[0] !== "finance") {
    return undefined
  }
  if (segments[1] === "transactions") {
    return buildEntityRef("transaction", segments[2])
  }
  return readProductRouteEntity(segments) ?? readPlanningRouteEntity(segments)
}
