import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  APP_ROUTES,
  financeTransactionNewHref,
  internalReturnPath,
  isFinanceTransferFormType,
  parseTransactionFormType,
  settingsModuleHref,
} from "./app-routes.ts"

describe("financeTransactionNewHref", () => {
  it("builds the debit and credit create urls", () => {
    assert.equal(
      financeTransactionNewHref({ type: "DEBIT" }),
      "/finance/transactions/new?type=DEBIT"
    )
    assert.equal(
      financeTransactionNewHref({ type: "CREDIT" }),
      "/finance/transactions/new?type=CREDIT"
    )
    assert.equal(
      financeTransactionNewHref({
        type: "DEBIT",
        destination: "account:abc",
      }),
      "/finance/transactions/new?type=DEBIT&destination=account%3Aabc"
    )
  })

  it("carries the place to return after saving when it is internal", () => {
    assert.equal(
      financeTransactionNewHref({
        type: "DEBIT",
        returnTo: "/finance/cash/acc-1",
      }),
      "/finance/transactions/new?type=DEBIT&returnTo=%2Ffinance%2Fcash%2Facc-1"
    )
    assert.equal(
      financeTransactionNewHref({
        type: "DEBIT",
        returnTo: "https://evil.test/x",
      }),
      "/finance/transactions/new?type=DEBIT"
    )
  })
})

describe("internalReturnPath", () => {
  it("accepts an absolute same-origin path", () => {
    assert.equal(
      internalReturnPath("/finance/institutions/i-1/accounts/a-1"),
      "/finance/institutions/i-1/accounts/a-1"
    )
  })

  it("rejects external urls, protocol-relative paths and empty values", () => {
    assert.equal(internalReturnPath("https://evil.test"), null)
    assert.equal(internalReturnPath("//evil.test/x"), null)
    assert.equal(internalReturnPath("finance"), null)
    assert.equal(internalReturnPath("  "), null)
    assert.equal(internalReturnPath(null), null)
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

describe("gallery route constants", () => {
  it("keeps the gallery routes", () => {
    assert.equal(APP_ROUTES.app.dev, "/dev")
    assert.equal(APP_ROUTES.app.devCardGallery, "/dev/cards")
    assert.equal(
      APP_ROUTES.app.devCardGalleryEntity("cuenta"),
      "/dev/cards/cuenta"
    )
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
