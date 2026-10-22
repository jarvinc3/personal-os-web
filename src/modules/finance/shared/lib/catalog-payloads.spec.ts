import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildCardBalanceBodies,
  buildCardBalanceBody,
  buildCreateAccountBody,
  buildCreateCardBody,
  buildCreateCategoryBody,
  buildUpdateCategoryBody,
  buildCreateInstitutionBody,
  cardBalanceSaveMessage,
  nextUnusedCurrency,
} from "./catalog-payloads.ts"

describe("buildCreateAccountBody", () => {
  it("omits balance and saldo from the POST body", () => {
    const result = buildCreateAccountBody({
      name: " Nómina ",
      type: "CHECKING",
      currency: "dop",
      institutionId: "inst-1",
      accountNumber: "0011-2233-5678",
      color: " #22c55e ",
    })
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.equal("balance" in result.body, false)
    assert.equal("saldo" in result.body, false)
    assert.deepEqual(result.body, {
      name: "Nómina",
      type: "CHECKING",
      institutionId: "inst-1",
      accountNumber: "001122335678",
      currency: "DOP",
      color: "#22c55e",
    })
  })

  it("rejects non-CASH accounts without an institution", () => {
    const none = buildCreateAccountBody({
      name: "Ahorros",
      type: "SAVINGS",
      institutionId: "__none__",
      accountNumber: "12345678",
    })
    assert.equal(none.ok, false)

    const missing = buildCreateAccountBody({
      name: "Ahorros",
      type: "SAVINGS",
      accountNumber: "12345678",
    })
    assert.equal(missing.ok, false)
  })

  it("rejects bank accounts without an account number on create", () => {
    const payload = buildCreateAccountBody({
      name: "Ahorros",
      type: "SAVINGS",
      institutionId: "inst-1",
    })
    assert.equal(payload.ok, false)
    if (payload.ok) {
      return
    }
    assert.match(payload.error, /número de cuenta/i)
  })

  it("allows an update that keeps the stored account number", () => {
    const payload = buildCreateAccountBody(
      {
        name: "Ahorros",
        type: "SAVINGS",
        institutionId: "inst-1",
      },
      { isUpdate: true }
    )
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.equal("accountNumber" in payload.body, false)
  })

  it("allows CASH without an institution", () => {
    const result = buildCreateAccountBody({
      name: "Efectivo",
      type: "CASH",
    })
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.equal("institutionId" in result.body, false)
    assert.equal("accountNumber" in result.body, false)
  })

  it("rejects CASH with an account number", () => {
    const result = buildCreateAccountBody({
      name: "Efectivo",
      type: "CASH",
      accountNumber: "12345678",
    })
    assert.equal(result.ok, false)
  })

  it("drops a chosen institution from a CASH account", () => {
    const accountPayload = buildCreateAccountBody({
      name: "Efectivo",
      type: "CASH",
      institutionId: "inst-bank-1",
    })
    assert.equal(accountPayload.ok, true)
    if (!accountPayload.ok) {
      return
    }
    assert.equal("institutionId" in accountPayload.body, false)
  })

  it("sends institutionId and never a free-text institution name", () => {
    const result = buildCreateAccountBody({
      name: "Ahorros",
      type: "SAVINGS",
      institutionId: "inst-1",
      accountNumber: "12345678",
    })
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.equal(result.body.institutionId, "inst-1")
    assert.equal("institution" in result.body, false)
  })

  it("sends color null on update and omits empty color on create", () => {
    const created = buildCreateAccountBody({
      name: "Efectivo",
      type: "CASH",
      color: "  ",
    })
    assert.equal(created.ok, true)
    if (!created.ok) {
      return
    }
    assert.equal("color" in created.body, false)

    const updated = buildCreateAccountBody(
      {
        name: "Efectivo",
        type: "CASH",
        color: "",
      },
      { isUpdate: true }
    )
    assert.equal(updated.ok, true)
    if (!updated.ok) {
      return
    }
    assert.equal(updated.body.color, null)
  })
})

describe("buildCreateInstitutionBody", () => {
  it("sends color null on update and omits empty color on create", () => {
    const created = buildCreateInstitutionBody({
      name: "Banco",
      color: "",
    })
    assert.equal(created.ok, true)
    if (!created.ok) {
      return
    }
    assert.equal("color" in created.body, false)

    const updated = buildCreateInstitutionBody(
      { name: "Banco", color: "  " },
      { isUpdate: true }
    )
    assert.equal(updated.ok, true)
    if (!updated.ok) {
      return
    }
    assert.equal(updated.body.color, null)
  })
})

describe("buildCreateCardBody", () => {
  it("requires accountId for DEBIT and omits it for CREDIT", () => {
    const debitMissing = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Débito",
      type: "DEBIT",
      lastFour: "4242",
    })
    assert.equal(debitMissing.ok, false)

    const debit = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Débito",
      type: "DEBIT",
      accountId: "acc-1",
      lastFour: "4242",
    })
    assert.equal(debit.ok, true)
    if (!debit.ok) {
      return
    }
    assert.equal(debit.body.accountId, "acc-1")

    const credit = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      accountId: "acc-should-drop",
      lastFour: "4242",
    })
    assert.equal(credit.ok, true)
    if (!credit.ok) {
      return
    }
    assert.equal("accountId" in credit.body, false)
  })

  it("requires lastFour of exactly 4 digits", () => {
    const short = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      lastFour: "12",
    })
    assert.equal(short.ok, false)
    if (short.ok) {
      return
    }
    assert.match(short.error, /4 dígitos/)

    const letters = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      lastFour: "abcd",
    })
    assert.equal(letters.ok, false)

    const empty = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      lastFour: "  ",
    })
    assert.equal(empty.ok, false)
    if (empty.ok) {
      return
    }
    assert.match(empty.error, /últimos 4/i)

    const valid = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      lastFour: "4242",
    })
    assert.equal(valid.ok, true)
    if (!valid.ok) {
      return
    }
    assert.equal(valid.body.lastFour, "4242")
  })

  it("accepts closing and due days in 1..31 and rejects the rest", () => {
    const valid = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      lastFour: "4242",
      statementClosingDay: "31",
      paymentDueDay: "15",
    })
    assert.equal(valid.ok, true)
    if (!valid.ok) {
      return
    }
    assert.equal(valid.body.statementClosingDay, 31)
    assert.equal(valid.body.paymentDueDay, 15)

    const zero = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      lastFour: "4242",
      statementClosingDay: "0",
    })
    assert.equal(zero.ok, false)
    if (zero.ok) {
      return
    }
    assert.match(zero.error, /1 y 31/)

    const high = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      lastFour: "4242",
      paymentDueDay: "32",
    })
    assert.equal(high.ok, false)

    const decimal = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      lastFour: "4242",
      statementClosingDay: "15.5",
    })
    assert.equal(decimal.ok, false)
  })

  it("sends color null on update and omits empty color on create", () => {
    const created = buildCreateCardBody({
      institutionId: "inst-1",
      name: "Crédito",
      type: "CREDIT",
      lastFour: "4242",
      color: "",
    })
    assert.equal(created.ok, true)
    if (!created.ok) {
      return
    }
    assert.equal("color" in created.body, false)

    const updated = buildCreateCardBody(
      {
        institutionId: "inst-1",
        name: "Crédito",
        type: "CREDIT",
        lastFour: "4242",
        color: "  ",
      },
      { isUpdate: true }
    )
    assert.equal(updated.ok, true)
    if (!updated.ok) {
      return
    }
    assert.equal(updated.body.color, null)
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
    if (!result.ok) {
      return
    }
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
    if (result.ok) {
      return
    }
    assert.equal(result.error, "Saldo inválido")
  })

  it("requires a credit limit when asked", () => {
    const result = buildCardBalanceBody(
      { currency: "DOP", balance: "42000" },
      { requireCreditLimit: true }
    )
    assert.equal(result.ok, false)
    if (result.ok) {
      return
    }
    assert.equal(result.error, "Límite de crédito obligatorio")
  })
})

describe("buildCardBalanceBodies", () => {
  it("skips empty rows and builds multiple balances", () => {
    const result = buildCardBalanceBodies([
      { currency: "dop", balance: "100", creditLimit: "50000" },
      { currency: "usd", balance: "25.5", creditLimit: "" },
      { currency: "EUR", balance: "", creditLimit: "" },
    ])
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.deepEqual(result.body, [
      { currency: "DOP", balance: 100, creditLimit: 50000 },
      { currency: "USD", balance: 25.5 },
    ])
  })

  it("requires a credit limit on filled CREDIT rows", () => {
    const result = buildCardBalanceBodies(
      [
        { currency: "dop", balance: "100", creditLimit: "50000" },
        { currency: "usd", balance: "25.5", creditLimit: "" },
      ],
      { requireCreditLimit: true }
    )
    assert.equal(result.ok, false)
    if (result.ok) {
      return
    }
    assert.equal(result.error, "Límite de crédito obligatorio")
  })

  it("rejects duplicate currencies", () => {
    const result = buildCardBalanceBodies([
      { currency: "USD", balance: "10" },
      { currency: "usd", balance: "20" },
    ])
    assert.equal(result.ok, false)
    if (result.ok) {
      return
    }
    assert.equal(result.error, "Cada moneda solo puede usarse una vez")
  })

  it("rejects an invalid balance in any filled row", () => {
    const result = buildCardBalanceBodies([
      { currency: "DOP", balance: "10" },
      { currency: "USD", balance: "abc" },
    ])
    assert.equal(result.ok, false)
    if (result.ok) {
      return
    }
    assert.equal(result.error, "Saldo inválido")
  })

  it("requires a credit limit when every CREDIT row is empty", () => {
    const result = buildCardBalanceBodies(
      [
        { currency: "DOP", balance: "", creditLimit: "" },
        { currency: "USD", balance: "  ", creditLimit: "" },
      ],
      { requireCreditLimit: true }
    )
    assert.equal(result.ok, false)
    if (result.ok) {
      return
    }
    assert.equal(result.error, "Límite de crédito obligatorio")
  })
})

describe("nextUnusedCurrency", () => {
  it("keeps the preferred currency when it is free", () => {
    assert.equal(nextUnusedCurrency(["EUR"], "DOP"), "DOP")
  })

  it("falls back to USD when the preferred currency is taken", () => {
    assert.equal(nextUnusedCurrency(["DOP"], "DOP"), "USD")
  })

  it("prefers a tracked currency before the hardcoded fallback", () => {
    assert.equal(nextUnusedCurrency(["DOP", "USD"], "DOP", ["GBP"]), "GBP")
  })
})

describe("cardBalanceSaveMessage", () => {
  it("reports a full success after creating the card", () => {
    assert.deepEqual(
      cardBalanceSaveMessage({ created: true, total: 2, failedCurrencies: [] }),
      { kind: "success", text1: "Tarjeta creada" }
    )
  })

  it("keeps the created card visible when some balances fail", () => {
    const result = cardBalanceSaveMessage({
      created: true,
      total: 2,
      failedCurrencies: ["USD"],
    })
    assert.equal(result.kind, "error")
    assert.match(result.text1, /Tarjeta creada/)
    assert.match(result.text2 ?? "", /USD/)
  })
})

describe("buildCreateCategoryBody", () => {
  it("sends the emoji icon string on create", () => {
    const result = buildCreateCategoryBody({
      name: " Mercado ",
      icon: "🛒",
      parentId: "__none__",
      type: "EXPENSE",
    })
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.deepEqual(result.body, {
      name: "Mercado",
      icon: "🛒",
      type: "EXPENSE",
    })
  })

  it("includes INCOME type on create", () => {
    const result = buildCreateCategoryBody({
      name: "Salario",
      icon: "💼",
      type: "INCOME",
    })
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.equal(result.body.type, "INCOME")
  })

  it("rejects Lucide-style keys instead of sending them as icon", () => {
    const result = buildCreateCategoryBody({
      name: "Cart",
      icon: "shopping-cart",
      type: "EXPENSE",
    })
    assert.equal(result.ok, false)
  })

  it("omits the icon when it was not chosen", () => {
    const payload = buildCreateCategoryBody({
      name: "Sin icono",
      type: "EXPENSE",
    })
    assert.equal(payload.ok, true)
    if (!payload.ok) {
      return
    }
    assert.deepEqual(payload.body, { name: "Sin icono", type: "EXPENSE" })
  })
})

describe("buildUpdateCategoryBody", () => {
  it("sends parentId null when the category has no parent", () => {
    const result = buildUpdateCategoryBody({
      name: "Mercado",
      icon: "🛒",
      parentId: "__none__",
      type: "EXPENSE",
      persistedParentId: null,
    })
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.equal(result.body.parentId, null)
    assert.equal(result.body.type, "EXPENSE")
  })

  it("omits type while a parent is still persisted", () => {
    const result = buildUpdateCategoryBody({
      name: "Cafetería",
      icon: "☕",
      parentId: "food",
      type: "INCOME",
      persistedParentId: "food",
    })
    assert.equal(result.ok, true)
    if (!result.ok) {
      return
    }
    assert.equal(result.body.parentId, "food")
    assert.equal("type" in result.body, false)
  })
})
