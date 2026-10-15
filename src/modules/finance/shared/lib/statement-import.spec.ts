import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceStatementImportLine } from "@/src/modules/finance/shared/types/entities"
import {
  signedStatementLineAmount,
  statementLineDefaultDecision,
  statementLineGroups,
} from "./statement-import.ts"

function line(
  overrides: Partial<FinanceStatementImportLine> = {}
): FinanceStatementImportLine {
  return {
    id: "line-1",
    date: "2026-09-03",
    description: "COMPRA POS JUMBO",
    amount: "3220.40",
    currency: "DOP",
    type: "DEBIT",
    reference: null,
    decision: "CREATE",
    categoryId: null,
    categoryName: null,
    transactionId: null,
    ...overrides,
  }
}

describe("statementLineGroups", () => {
  it("splits matched, missing and ignored lines", () => {
    const groups = statementLineGroups([
      line({ id: "a", decision: "MATCH" }),
      line({ id: "b", decision: "CREATE" }),
      line({ id: "c", decision: "IGNORE" }),
    ])

    assert.deepEqual(
      groups.matched.map((entry) => entry.id),
      ["a"]
    )
    assert.deepEqual(
      groups.missing.map((entry) => entry.id),
      ["b"]
    )
    assert.deepEqual(
      groups.ignored.map((entry) => entry.id),
      ["c"]
    )
  })
})

describe("statementLineDefaultDecision", () => {
  it("returns MATCH when the line is already linked", () => {
    assert.equal(
      statementLineDefaultDecision(line({ transactionId: "tx-1" })),
      "MATCH"
    )
  })

  it("returns CREATE when the line is not linked", () => {
    assert.equal(
      statementLineDefaultDecision(line({ transactionId: null })),
      "CREATE"
    )
  })
})

describe("signedStatementLineAmount", () => {
  it("reads a debit as negative and a credit as positive", () => {
    assert.equal(signedStatementLineAmount(line({ type: "DEBIT" })), -3220.4)
    assert.equal(
      signedStatementLineAmount(line({ type: "CREDIT", amount: "100.00" })),
      100
    )
  })
})
