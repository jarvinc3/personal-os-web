import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  APP_ROUTES,
  financeTransactionNewHref,
  parseTransactionFormType,
  settingsModuleHref,
} from "./app-routes.ts"

describe("financeTransactionNewHref", () => {
  it("builds the debit and credit create urls", () => {
    assert.equal(
      financeTransactionNewHref("DEBIT"),
      "/finance/transactions/new?type=DEBIT",
    )
    assert.equal(
      financeTransactionNewHref("CREDIT"),
      "/finance/transactions/new?type=CREDIT",
    )
  })
})

describe("settingsModuleHref", () => {
  it("builds the module settings path", () => {
    assert.equal(settingsModuleHref("finance"), "/settings/finance")
    assert.equal(settingsModuleHref("agenda"), "/settings/agenda")
  })
})

describe("finance route constants", () => {
  it("keeps the module root and splits overview from transfers", () => {
    assert.equal(APP_ROUTES.app.finance, "/finance")
    assert.equal(APP_ROUTES.app.financeOverview, "/finance/overview")
    assert.equal(APP_ROUTES.app.financeTransferNew, "/finance/transfers/new")
    assert.equal(APP_ROUTES.app.financeTransactions, "/finance/transactions")
  })
})

describe("parseTransactionFormType", () => {
  it("keeps credit only when the query is credit", () => {
    assert.equal(parseTransactionFormType("CREDIT"), "CREDIT")
    assert.equal(parseTransactionFormType(" credit "), "CREDIT")
    assert.equal(parseTransactionFormType("DEBIT"), "DEBIT")
    assert.equal(parseTransactionFormType(null), "DEBIT")
    assert.equal(parseTransactionFormType("TRANSFER"), "DEBIT")
  })
})
