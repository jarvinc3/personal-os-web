import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { describe, it } from "node:test"

import {
  agentContextLabel,
  agentInvocationContextKey,
  buildAgentInvocationContext,
  decodeAgentContext,
  encodeAgentContext,
} from "./agent-chat-context.ts"

const TRANSACTION_ID = "00000000-0000-4000-8000-000000000001"
const ACCOUNT_ID = "00000000-0000-4000-8000-000000000002"
const INSTITUTION_ID = "00000000-0000-4000-8000-000000000003"

function params(query = "") {
  return new URLSearchParams(query)
}

const CONTRACT_PATH = "openapi/swagger-spec.json"

/** Enum que el back publica y valida, leído del contrato versionado. */
function contractEntityTypes(): string[] {
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf8")) as {
    components: {
      schemas: {
        AiInvocationEntityRefDto: {
          properties: { type: { enum: string[] } }
        }
      }
    }
  }

  return contract.components.schemas.AiInvocationEntityRefDto.properties.type
    .enum
}

/** Entidades que la web puede armar hoy, por ruta y por hoja. */
function producedEntityTypes(): string[] {
  const routes = [
    `/finance/transactions/${TRANSACTION_ID}`,
    `/finance/institutions/${INSTITUTION_ID}`,
    `/finance/institutions/${INSTITUTION_ID}/accounts/${ACCOUNT_ID}`,
    `/finance/institutions/${INSTITUTION_ID}/cards/${ACCOUNT_ID}`,
  ]
  const sheets = ["institution-options-sheet", "transaction-options-sheet"]

  return [
    ...routes.map(
      (pathname) =>
        buildAgentInvocationContext({ pathname, searchParams: params() })
          .entityRef?.type
    ),
    ...sheets.map(
      (sheet) =>
        buildAgentInvocationContext({
          pathname: "/finance/institutions",
          searchParams: params(`sheet=${sheet}&sheetId=${INSTITUTION_ID}`),
        }).entityRef?.type
    ),
  ].filter((type): type is string => Boolean(type))
}

describe("contexto de entidad aceptado por el contrato", () => {
  it("todo tipo que arma la web existe en AiInvocationEntityRefDto", () => {
    const accepted = contractEntityTypes()
    const produced = producedEntityTypes()

    assert.ok(produced.includes("institution"))
    for (const type of produced) {
      assert.ok(accepted.includes(type), `El contrato no acepta ${type}`)
    }
  })
})

describe("buildAgentInvocationContext", () => {
  it("reads the route, sheet and filters without internal params", () => {
    const context = buildAgentInvocationContext({
      pathname: "/finance/planning",
      searchParams: params(
        "sheet=budget-sheet&sheetId=b-1&month=2026-11&tag=a&tag=b"
      ),
    })

    assert.deepEqual(context, {
      route: "/finance/planning",
      sheet: "budget-sheet",
      filters: { month: "2026-11", tag: ["a", "b"] },
    })
  })

  it("uses the tab as the view when there is no sheet", () => {
    const context = buildAgentInvocationContext({
      pathname: "/intelligence",
      searchParams: params("tab=review&status=PENDING"),
    })

    assert.deepEqual(context, {
      route: "/intelligence",
      view: "review",
      filters: { status: "PENDING" },
    })
  })

  it("reads the selected finance entity from a detail route", () => {
    const context = buildAgentInvocationContext({
      pathname: `/finance/transactions/${TRANSACTION_ID}`,
      searchParams: params("sheet=transaction-options-sheet"),
    })

    assert.deepEqual(context.entityRef, {
      type: "transaction",
      id: TRANSACTION_ID,
    })
  })

  it("reads the entity of a record sheet over a list", () => {
    const context = buildAgentInvocationContext({
      pathname: "/finance/transactions",
      searchParams: params(
        `sheet=transaction-options-sheet&sheetId=${TRANSACTION_ID}`
      ),
    })

    assert.deepEqual(context.entityRef, {
      type: "transaction",
      id: TRANSACTION_ID,
    })
  })

  it("reads an account or card inside an institution route", () => {
    const account = buildAgentInvocationContext({
      pathname: `/finance/institutions/${INSTITUTION_ID}/accounts/${ACCOUNT_ID}`,
      searchParams: params(),
    })
    const card = buildAgentInvocationContext({
      pathname: `/finance/institutions/${INSTITUTION_ID}/cards/${ACCOUNT_ID}`,
      searchParams: params(),
    })

    assert.equal(account.entityRef?.type, "account")
    assert.equal(card.entityRef?.type, "card")
  })

  it("reads the entity of every finance detail route", () => {
    const routes = [
      { section: "transactions", type: "transaction" },
      { section: "institutions", type: "institution" },
      { section: "cash", type: "account" },
      { section: "loans", type: "loan" },
      { section: "budgets", type: "budget" },
      { section: "savings-goals", type: "savings_goal" },
      { section: "receivables", type: "receivable" },
      { section: "subscriptions", type: "subscription" },
      { section: "merchants", type: "merchant" },
    ] as const

    for (const route of routes) {
      const context = buildAgentInvocationContext({
        pathname: `/finance/${route.section}/${TRANSACTION_ID}`,
        searchParams: params(),
      })

      assert.equal(context.entityRef?.type, route.type, route.section)
    }
  })

  it("does not invent an entity on the subscriptions calendar", () => {
    const context = buildAgentInvocationContext({
      pathname: "/finance/subscriptions/calendar",
      searchParams: params(),
    })

    assert.equal(context.entityRef, undefined)
  })

  it("does not invent an entity for a create route", () => {
    const context = buildAgentInvocationContext({
      pathname: "/finance/transactions/new",
      searchParams: params(),
    })

    assert.equal(context.entityRef, undefined)
  })

  it("drops filters when the context would be too long", () => {
    const longValue = "x".repeat(2500)
    const context = buildAgentInvocationContext({
      pathname: "/finance/transactions",
      searchParams: params(`description=${longValue}`),
    })

    assert.equal(context.filters, undefined)
    assert.equal(context.route, "/finance/transactions")
  })
})

describe("agent context encoding", () => {
  it("round-trips the context through the URL-safe value", () => {
    const context = buildAgentInvocationContext({
      pathname: `/finance/transactions/${TRANSACTION_ID}`,
      searchParams: params("month=2026-11"),
    })

    assert.deepEqual(decodeAgentContext(encodeAgentContext(context)), context)
  })

  it("returns null for a value that is not a context", () => {
    assert.equal(decodeAgentContext("no-es-base64"), null)
    assert.equal(decodeAgentContext(encodeAgentContext({} as never)), null)
  })

  it("labels finance and app routes for the header chip", () => {
    assert.equal(
      agentContextLabel({ route: "/finance/planning" }),
      "Finanzas · Planificación"
    )
    assert.equal(agentContextLabel({ route: "/finance" }), "Finanzas")
    assert.equal(agentContextLabel({ route: "/home" }), "Inicio")
    assert.equal(agentContextLabel(null), "Sin contexto")
  })
})

describe("agentInvocationContextKey", () => {
  it("matches the canonical SHA-256 key used by the back", async () => {
    const context = {
      route: "/finance/transactions",
      sheet: "transaction-options-sheet",
      entityRef: { type: "transaction" as const, id: TRANSACTION_ID },
      filters: { month: "2026-11", nested: { b: "2", a: "1" } },
    }
    const canonical = JSON.stringify({
      entityRef: { id: TRANSACTION_ID, type: "transaction" },
      filters: { month: "2026-11", nested: { a: "1", b: "2" } },
      route: "/finance/transactions",
      sheet: "transaction-options-sheet",
    })
    const expected = createHash("sha256").update(canonical).digest("hex")

    assert.equal(await agentInvocationContextKey(context), expected)
  })
})
