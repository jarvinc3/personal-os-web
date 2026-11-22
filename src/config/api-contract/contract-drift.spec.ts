import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { ApiContract } from "./contract.ts"
import {
  compareContracts,
  formatContractDifferences,
} from "./contract-drift.ts"

function buildContract(patch: Partial<ApiContract> = {}): ApiContract {
  return {
    openapi: "3.0.0",
    info: { title: "Personal OS API", version: "0.100.0" },
    paths: {},
    ...patch,
  } as ApiContract
}

function compare({
  backContract,
  vendoredContract,
}: {
  backContract: ApiContract
  vendoredContract: ApiContract
}) {
  return compareContracts({ backContract, vendoredContract })
}

describe("deriva del contrato OpenAPI", () => {
  it("no reporta nada cuando la copia coincide con el back", () => {
    const contract = buildContract({
      paths: { "/api/finance/budgets": { get: { operationId: "list" } } },
    })

    assert.deepEqual(
      compare({ backContract: contract, vendoredContract: contract }),
      []
    )
  })

  it("no confunde el orden de las claves con una diferencia", () => {
    const backContract = buildContract({
      paths: {
        "/api/b": { get: { operationId: "b" } },
        "/api/a": { get: { operationId: "a" } },
      },
    })
    const vendoredContract = buildContract({
      paths: {
        "/api/a": { get: { operationId: "a" } },
        "/api/b": { get: { operationId: "b" } },
      },
    })

    assert.deepEqual(compare({ backContract, vendoredContract }), [])
  })

  it("detecta un parámetro que el back agregó", () => {
    const vendoredContract = buildContract({
      paths: { "/api/finance/budgets": { get: { parameters: [] } } },
    })
    const backContract = buildContract({
      paths: {
        "/api/finance/budgets": {
          get: { parameters: [{ name: "limit", in: "query" }] },
        },
      },
    })

    assert.deepEqual(compare({ backContract, vendoredContract }), [
      {
        kind: "operation",
        change: "changed",
        name: "GET /api/finance/budgets",
      },
    ])
  })

  it("detecta una operación que el back quitó", () => {
    const vendoredContract = buildContract({
      paths: {
        "/api/intelligence/messages": { get: { operationId: "list" } },
      },
    })
    const backContract = buildContract({
      paths: { "/api/intelligence/messages": {} },
    })

    assert.deepEqual(compare({ backContract, vendoredContract }), [
      {
        kind: "operation",
        change: "removed",
        name: "GET /api/intelligence/messages",
      },
    ])
  })

  it("detecta una ruta que solo existe en la copia versionada", () => {
    const vendoredContract = buildContract({
      paths: { "/api/ai/chat": { post: { operationId: "chat" } } },
    })

    assert.deepEqual(
      compare({ backContract: buildContract(), vendoredContract }),
      [{ kind: "path", change: "removed", name: "/api/ai/chat" }]
    )
  })

  it("detecta un esquema nuevo en el back", () => {
    const backContract = buildContract({
      components: { schemas: { BudgetDto: { type: "object" } } },
    })

    assert.deepEqual(
      compare({ backContract, vendoredContract: buildContract() }),
      [{ kind: "schema", change: "added", name: "BudgetDto" }]
    )
  })

  it("detecta un cambio dentro de un esquema", () => {
    const vendoredContract = buildContract({
      components: { schemas: { BudgetDto: { type: "object" } } },
    })
    const backContract = buildContract({
      components: {
        schemas: { BudgetDto: { type: "object", required: ["amountLimit"] } },
      },
    })

    assert.deepEqual(compare({ backContract, vendoredContract }), [
      { kind: "schema", change: "changed", name: "BudgetDto" },
    ])
  })

  it("ignora la versión del API, que cambia con cada release", () => {
    const backContract = buildContract({
      info: { title: "Personal OS API", version: "0.101.0" },
      paths: { "/api/finance/budgets": { get: { operationId: "list" } } },
    })
    const vendoredContract = buildContract({
      info: { title: "Personal OS API", version: "0.100.0" },
      paths: { "/api/finance/budgets": { get: { operationId: "list" } } },
    })

    assert.deepEqual(compare({ backContract, vendoredContract }), [])
  })

  it("reporta el documento cuando el cambio está fuera de rutas y esquemas", () => {
    const backContract = buildContract({ tags: [{ name: "finance" }] })

    assert.deepEqual(
      compare({ backContract, vendoredContract: buildContract() }),
      [{ kind: "content", change: "changed", name: "documento" }]
    )
  })
})

describe("informe de la deriva del contrato", () => {
  it("dice de qué lado está cada diferencia", () => {
    assert.deepEqual(
      formatContractDifferences([
        { kind: "path", change: "added", name: "/api/finance/new" },
        { kind: "operation", change: "removed", name: "GET /api/ai/chat" },
        { kind: "schema", change: "changed", name: "BudgetDto" },
      ]),
      [
        "ruta solo en el back: /api/finance/new",
        "operación solo en la copia versionada: GET /api/ai/chat",
        "esquema cambió en el back: BudgetDto",
      ]
    )
  })

  it("recorta el informe cuando hay muchas diferencias", () => {
    const differences = Array.from({ length: 25 }, (_, index) => ({
      kind: "path" as const,
      change: "added" as const,
      name: `/api/ruta-${index}`,
    }))

    const lines = formatContractDifferences(differences)

    assert.equal(lines.length, 21)
    assert.equal(lines.at(-1), "y 5 diferencias más")
  })
})
