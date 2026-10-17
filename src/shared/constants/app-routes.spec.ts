import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  APP_ROUTES,
  financeTransactionNewHref,
  isFinanceTransferFormType,
  parseTransactionFormType,
  settingsModuleHref,
} from "./app-routes.ts"

describe("financeTransactionNewHref", () => {
  it("builds the debit and credit create urls", () => {
    assert.equal(
      financeTransactionNewHref("DEBIT"),
      "/finance/transactions/new?type=DEBIT"
    )
    assert.equal(
      financeTransactionNewHref("CREDIT"),
      "/finance/transactions/new?type=CREDIT"
    )
    assert.equal(
      financeTransactionNewHref("DEBIT", "account:abc"),
      "/finance/transactions/new?type=DEBIT&destination=account%3Aabc"
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
  it("keeps the module root and the transfer route", () => {
    assert.equal(APP_ROUTES.app.finance, "/finance")
    assert.equal(APP_ROUTES.app.financeTransferNew, "/finance/transfers/new")
    assert.equal(APP_ROUTES.app.financeTransactions, "/finance/transactions")
    assert.equal(
      APP_ROUTES.app.settingsFinanceCurrencies,
      "/settings/finance/currencies"
    )
    assert.equal(APP_ROUTES.app.settingsWipeData, "/settings/wipe-data")
  })
})

describe("module placeholder routes", () => {
  it("keeps the coming soon routes", () => {
    assert.equal(APP_ROUTES.app.agenda, "/agenda")
    assert.equal(APP_ROUTES.app.projects, "/projects")
    assert.equal(APP_ROUTES.app.health, "/health")
  })
})

describe("isFinanceTransferFormType", () => {
  it("detects only the transfer type", () => {
    assert.equal(isFinanceTransferFormType("TRANSFER"), true)
    assert.equal(isFinanceTransferFormType(" transfer "), true)
    assert.equal(isFinanceTransferFormType("DEBIT"), false)
    assert.equal(isFinanceTransferFormType(undefined), false)
    assert.equal(isFinanceTransferFormType(["TRANSFER"]), false)
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
