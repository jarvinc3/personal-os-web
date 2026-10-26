import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money.ts"
import type {
  FinanceBalanceSheetCurrencyGroup,
  FinanceBalanceSheetCurrencyTotals,
} from "@/src/modules/finance/shared/types/entities.ts"
import {
  currencyGroupFor,
  pendingReceivablesAmount,
  receivablesLine,
} from "./currency-summary.ts"

const display: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es-DO",
}

function totals(
  overrides: Partial<FinanceBalanceSheetCurrencyTotals>
): FinanceBalanceSheetCurrencyTotals {
  return {
    assets: "0",
    available: "0",
    receivables: "0",
    liabilities: "0",
    netWorth: "0",
    doubtfulReceivables: "0",
    ...overrides,
  }
}

function group(
  currency: string,
  currencyTotals: FinanceBalanceSheetCurrencyTotals
): FinanceBalanceSheetCurrencyGroup {
  return {
    currency,
    accounts: [],
    cash: [],
    receivables: [],
    creditCards: [],
    loans: [],
    doubtfulReceivables: [],
    totals: currencyTotals,
    totalsBase: {
      assets: null,
      available: null,
      receivables: null,
      liabilities: null,
      netWorth: null,
      doubtfulReceivables: null,
    },
  }
}

describe("pendingReceivablesAmount", () => {
  it("reads the pending receivables of the currency", () => {
    assert.equal(
      pendingReceivablesAmount(totals({ receivables: "5000.00" })),
      5000
    )
  })

  it("has nothing to show without receivables", () => {
    assert.equal(
      pendingReceivablesAmount(totals({ receivables: "0.00" })),
      null
    )
    assert.equal(pendingReceivablesAmount(totals({ receivables: "" })), null)
  })

  it("leaves doubtful receivables out, as the total does", () => {
    assert.equal(
      pendingReceivablesAmount(
        totals({ receivables: "50.00", doubtfulReceivables: "900.00" })
      ),
      50
    )
  })
})

describe("receivablesLine", () => {
  it("formats the receivables in the currency of the group", () => {
    const line = receivablesLine(
      group("USD", totals({ receivables: "50.00" })),
      display
    )
    assert.ok(line !== null)
    assert.match(line, /USD/)
    assert.match(line, /50/)
  })

  it("returns null when the currency has no receivables", () => {
    assert.equal(
      receivablesLine(group("DOP", totals({ receivables: "0.00" })), display),
      null
    )
  })
})

describe("currencyGroupFor", () => {
  it("finds the group of a currency regardless of case", () => {
    const dop = group("DOP", totals({}))
    const usd = group("USD", totals({}))
    assert.equal(currencyGroupFor([dop, usd], "usd"), usd)
  })

  it("returns null for a currency without balances", () => {
    assert.equal(currencyGroupFor([group("DOP", totals({}))], "EUR"), null)
  })
})
