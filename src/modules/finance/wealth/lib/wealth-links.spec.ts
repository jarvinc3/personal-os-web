import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceBalanceSheetLine } from "@/src/modules/finance/shared/types/entities"

import { wealthLineHref } from "./wealth-links.ts"

function line(
  partial: Partial<FinanceBalanceSheetLine> &
    Pick<FinanceBalanceSheetLine, "kind" | "id">
): FinanceBalanceSheetLine {
  return {
    name: "Producto",
    description: null,
    institutionId: null,
    currency: "DOP",
    balance: "0",
    balanceBase: "0",
    hasDrift: false,
    driftDifference: null,
    reconciliation: "PENDING",
    creditLimit: null,
    availableCredit: null,
    dueDate: null,
    doubtful: false,
    ...partial,
  }
}

describe("wealthLineHref", () => {
  it("opens the account inside its institution", () => {
    assert.equal(
      wealthLineHref(
        line({
          kind: "ACCOUNT",
          id: "acc-1",
          institutionId: "inst-1",
        })
      ),
      "/finance/institutions/inst-1/accounts/acc-1"
    )
  })

  it("opens cash under the cash route when it has no institution", () => {
    assert.equal(
      wealthLineHref(line({ kind: "CASH", id: "cash-1" })),
      "/finance/cash/cash-1"
    )
  })

  it("opens the card, loan and receivable details", () => {
    assert.equal(
      wealthLineHref(
        line({
          kind: "CREDIT_CARD",
          id: "card-1",
          institutionId: "inst-1",
        })
      ),
      "/finance/institutions/inst-1/cards/card-1"
    )
    assert.equal(
      wealthLineHref(line({ kind: "LOAN", id: "loan-1" })),
      "/finance/loans/loan-1"
    )
    assert.equal(
      wealthLineHref(line({ kind: "RECEIVABLE", id: "rec-1" })),
      "/finance/receivables/rec-1"
    )
  })

  it("returns null for a card without institution", () => {
    assert.equal(
      wealthLineHref(line({ kind: "CREDIT_CARD", id: "card-1" })),
      null
    )
  })
})
