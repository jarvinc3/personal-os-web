import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  cashAccountNameFor,
  cashCurrencies,
  cashCurrencyMissing,
  isCashInstitution,
  selectableBankInstitutions,
} from "./cash.ts"
import type {
  FinanceBalanceSheet,
  FinanceInstitution,
} from "../types/entities.ts"

function institution(
  partial: Partial<FinanceInstitution> & Pick<FinanceInstitution, "id" | "name">
): FinanceInstitution {
  return {
    type: "bank",
    color: null,
    logoUrl: null,
    country: "DO",
    isActive: true,
    isSystem: false,
    ...partial,
  }
}

function sheetWithCash(currencies: string[]): FinanceBalanceSheet {
  return {
    asOf: "2026-10-15T00:00:00.000Z",
    rateDate: "2026-10-15",
    baseCurrency: "DOP",
    global: {
      status: "COMPLETE",
      assets: { accounts: "0" },
      liabilities: { creditCards: "0", loans: "0" },
      totalAssets: "0",
      totalLiabilities: "0",
      netWorth: "0",
      issues: [],
    },
    institutions: [],
    cash: {
      totalBase: "0",
      baseCurrency: "DOP",
      rateDate: "2026-10-15",
      status: "COMPLETE",
      byCurrency: currencies.map((currency) => ({
        currency,
        total: "0",
        totalBase: "0",
        accounts: [],
      })),
    },
  }
}

describe("cash institution helpers", () => {
  it("detects the system cash institution by flag or type", () => {
    assert.equal(
      isCashInstitution(
        institution({ id: "c", name: "Efectivo", isSystem: true })
      ),
      true
    )
    assert.equal(
      isCashInstitution(
        institution({ id: "c", name: "Efectivo", type: "cash" })
      ),
      true
    )
    assert.equal(
      isCashInstitution(institution({ id: "b", name: "Banco" })),
      false
    )
  })

  it("keeps cash out of the card and loan selectors", () => {
    const bank = institution({ id: "b", name: "Banco" })
    const cash = institution({ id: "c", name: "Efectivo", isSystem: true })

    assert.deepEqual(selectableBankInstitutions([bank, cash]), [bank])
  })

  it("lists the currencies with a cash account, upper-cased", () => {
    assert.deepEqual(cashCurrencies(sheetWithCash(["dop", "usd"]).cash), [
      "DOP",
      "USD",
    ])
  })

  it("reports a currency without a cash account", () => {
    const sheet = sheetWithCash(["DOP"])

    assert.equal(cashCurrencyMissing(sheet.cash, "usd"), true)
    assert.equal(cashCurrencyMissing(sheet.cash, "DOP"), false)
  })

  it("names the base-currency cash account Efectivo and other currencies with the code", () => {
    assert.equal(cashAccountNameFor("DOP", "DOP"), "Efectivo")
    assert.equal(cashAccountNameFor("usd", "DOP"), "Efectivo USD")
  })
})
