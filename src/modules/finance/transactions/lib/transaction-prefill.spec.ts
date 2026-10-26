import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildTransactionFormParams,
  parseTransactionPrefill,
  readTransactionPrefillQuery,
} from "./transaction-prefill.ts"

describe("parseTransactionPrefill", () => {
  it("reads and trims the known fields", () => {
    const params = new URLSearchParams({
      amount: " 250 ",
      currency: "dop",
      categoryId: "cat-food",
      date: "2026-10-13",
      merchant: " Café ",
      description: " nota ",
    })

    assert.deepStrictEqual(parseTransactionPrefill(params), {
      amount: "250",
      currency: "DOP",
      categoryId: "cat-food",
      transactionDate: "2026-10-13",
      merchant: "Café",
      description: "nota",
    })
  })

  it("returns empty values when the query has nothing", () => {
    assert.deepStrictEqual(parseTransactionPrefill(new URLSearchParams()), {
      amount: "",
      currency: "",
      categoryId: "",
      transactionDate: "",
      merchant: "",
      description: "",
    })
  })
})

describe("readTransactionPrefillQuery", () => {
  it("mantiene el prefill al abrir y cerrar la calculadora por ruta", () => {
    const base = new URLSearchParams({
      type: "DEBIT",
      merchant: "Café",
      amount: "250",
    })
    const withPickers = new URLSearchParams(base)
    withPickers.set("picker", "calculator-transaction-amount")
    withPickers.set("sheet", "transaction-amount-sheet")
    withPickers.set("sheetId", "abc")

    assert.equal(
      readTransactionPrefillQuery(withPickers),
      readTransactionPrefillQuery(base)
    )

    withPickers.delete("picker")
    assert.equal(
      readTransactionPrefillQuery(withPickers),
      readTransactionPrefillQuery(base)
    )
  })

  it("devuelve el mismo texto aunque la URL ordene las claves distinto", () => {
    assert.equal(
      readTransactionPrefillQuery(
        new URLSearchParams("merchant=Caf%C3%A9&amount=250")
      ),
      readTransactionPrefillQuery(
        new URLSearchParams("amount=250&merchant=Caf%C3%A9")
      )
    )
  })

  it("cambia cuando cambia un valor del prefill", () => {
    assert.notEqual(
      readTransactionPrefillQuery(new URLSearchParams({ merchant: "Café" })),
      readTransactionPrefillQuery(new URLSearchParams({ merchant: "Pan" }))
    )
  })
})

describe("buildTransactionFormParams", () => {
  it("keeps only the values that exist", () => {
    const params = buildTransactionFormParams({
      type: "DEBIT",
      destination: "account:acc-1",
      amount: "250",
      currency: "DOP",
      categoryId: "",
      transactionDate: "",
      merchant: "",
      description: "",
    })

    assert.equal(params.get("type"), "DEBIT")
    assert.equal(params.get("destination"), "account:acc-1")
    assert.equal(params.get("amount"), "250")
    assert.equal(params.get("currency"), "DOP")
    assert.equal(params.has("categoryId"), false)
    assert.equal(params.has("date"), false)
    assert.equal(params.has("merchant"), false)
  })
})
