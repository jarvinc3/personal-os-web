import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceMoneyDisplay } from "./money.ts"
import type { FinanceReconciliationStatusItem } from "@/src/modules/finance/shared/types/entities.ts"
import {
  pendingReconciliationItems,
  reconciliationSubtitle,
} from "./reconciliation-pending.ts"

const display: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es-DO",
}

function item(
  overrides: Partial<FinanceReconciliationStatusItem>
): FinanceReconciliationStatusItem {
  return {
    key: "account-1",
    kind: "account",
    accountId: "account-1",
    cardId: null,
    currency: "DOP",
    name: "Cuenta principal",
    institutionName: "Banco Popular",
    balance: "500.00",
    reconciled: false,
    lastReconciledAt: null,
    ...overrides,
  }
}

describe("pendingReconciliationItems", () => {
  it("lists only the products still pending this month", () => {
    const pending = item({ key: "pending" })
    const done = item({ key: "done", reconciled: true, lastReconciledAt: "x" })

    assert.deepEqual(
      pendingReconciliationItems([pending, done]).map((entry) => entry.key),
      ["pending"]
    )
  })

  it("leaves out a product with nothing to compare", () => {
    const empty = item({ key: "empty", balance: "0.00" })
    assert.deepEqual(pendingReconciliationItems([empty]), [])
  })
})

describe("reconciliationSubtitle", () => {
  it("does not repeat the product name as its institution", () => {
    const line = reconciliationSubtitle(
      item({
        name: "Efectivo",
        institutionName: "Efectivo",
        balance: "500.00",
      }),
      display
    )
    assert.doesNotMatch(line, /Efectivo/)
    assert.match(line, /DOP/)
    assert.match(line, /500/)
  })

  it("keeps the institution when it adds information", () => {
    const line = reconciliationSubtitle(
      item({ name: "Cuenta principal", institutionName: "Banco Popular" }),
      display
    )
    assert.match(line, /^Banco Popular · DOP/)
  })

  it("shows only the amount without an institution", () => {
    const line = reconciliationSubtitle(
      item({ name: "Cuenta", institutionName: null }),
      display
    )
    assert.match(line, /^DOP/)
  })
})
