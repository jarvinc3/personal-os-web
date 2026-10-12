import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  instrumentHistoryLabel,
  instrumentHistoryLimitTransition,
} from "./instrument-history.ts"

const baseItem = {
  id: "h1",
  at: "2026-10-01T12:00:00.000Z",
  amount: null,
  currency: null,
  payload: {},
} as const

describe("instrument history", () => {
  it("labels each event kind", () => {
    assert.equal(
      instrumentHistoryLabel({ ...baseItem, kind: "ADJUSTMENT" }),
      "Ajuste de saldo"
    )
    assert.equal(
      instrumentHistoryLabel({ ...baseItem, kind: "CREDIT_LIMIT_CHANGED" }),
      "Cambio de límite"
    )
    assert.equal(
      instrumentHistoryLabel({ ...baseItem, kind: "STATEMENT_CLOSED" }),
      "Corte cerrado"
    )
  })

  it("describes a credit-limit change", () => {
    assert.equal(
      instrumentHistoryLimitTransition({
        ...baseItem,
        kind: "CREDIT_LIMIT_CHANGED",
        payload: { previousLimit: 1000, nextLimit: 2000 },
      }),
      "1000 → 2000"
    )
    assert.equal(
      instrumentHistoryLimitTransition({
        ...baseItem,
        kind: "CREDIT_LIMIT_CHANGED",
        payload: { previousLimit: null, nextLimit: 2000 },
      }),
      "Límite inicial: 2000"
    )
    assert.equal(
      instrumentHistoryLimitTransition({ ...baseItem, kind: "ADJUSTMENT" }),
      null
    )
  })
})
