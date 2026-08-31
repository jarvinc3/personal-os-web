import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildCardBalanceBody,
  buildCreateAccountBody,
  buildCreateCardBody,
  buildCreateCategoryBody,
} from "./catalog-payloads.ts"

describe("buildCreateAccountBody", () => {
  it("omits balance and saldo from the POST body", () => {
    const result = buildCreateAccountBody({
      name: " Nómina ",
      type: "CHECKING",
      currency: "dop",
      institutionId: "__none__",
      color: " #22c55e ",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal("balance" in result.body, false)
    assert.equal("saldo" in result.body, false)
    assert.deepEqual(result.body, {
      name: "Nómina",
      type: "CHECKING",
      currency: "DOP",
      color: "#22c55e",
    })
  })

  it("sends institutionId when selected and not free-text institution", () => {
    const result = buildCreateAccountBody({
      name: "Ahorros",
      type: "SAVINGS",
      institutionId: "inst-1",
      institution: "should-not-send",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.body.institutionId, "inst-1")
    assert.equal("institution" in result.body, false)
  })
})

describe("buildCreateCardBody", () => {
  it("requires accountId for DEBIT and omits it for CREDIT", () => {
    const debitMissing = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Débito",
      type: "DEBIT",
    })
    assert.equal(debitMissing.ok, false)

    const debit = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Débito",
      type: "DEBIT",
      accountId: "acc-1",
    })
    assert.equal(debit.ok, true)
    if (!debit.ok) return
    assert.equal(debit.body.accountId, "acc-1")

    const credit = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      accountId: "acc-should-drop",
    })
    assert.equal(credit.ok, true)
    if (!credit.ok) return
    assert.equal("accountId" in credit.body, false)
  })
})

describe("buildCardBalanceBody", () => {
  it("sends numbers for balance and creditLimit", () => {
    const result = buildCardBalanceBody({
      currency: "dop",
      balance: "145.63",
      creditLimit: "50000",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.equal(result.body.currency, "DOP")
    assert.equal(result.body.balance, 145.63)
    assert.equal(result.body.creditLimit, 50000)
    assert.equal(typeof result.body.balance, "number")
    assert.equal(typeof result.body.creditLimit, "number")
  })

  it("rejects invalid money instead of sending NaN", () => {
    const result = buildCardBalanceBody({
      currency: "USD",
      balance: "abc",
    })
    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.error, "Saldo inválido")
  })
})

describe("buildCreateCategoryBody", () => {
  it("sends the emoji icon string on create", () => {
    const result = buildCreateCategoryBody({
      name: " Mercado ",
      icon: "🛒",
      parentId: "__none__",
    })
    assert.equal(result.ok, true)
    if (!result.ok) return
    assert.deepEqual(result.body, { name: "Mercado", icon: "🛒" })
  })

  it("rejects Lucide-style keys instead of sending them as icon", () => {
    const result = buildCreateCategoryBody({
      name: "Cart",
      icon: "shopping-cart",
    })
    assert.equal(result.ok, false)
  })
})
