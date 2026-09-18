import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildTransactionsSearchParams,
  canReverseTransaction,
  formatTransactionDate,
  transferDirectionLabel,
  transactionsFromPayload,
  visibleTransactionTotals,
} from "./transactions-query.ts";

describe("buildTransactionsSearchParams", () => {
  it("sends page and the DTO filters, omitting empty sentinels", () => {
    const qs = buildTransactionsSearchParams({
      page: 2,
      limit: 20,
      dateFrom: "2026-08-01",
      dateTo: "2026-08-31",
      accountId: "acc-1",
      type: "DEBIT",
      status: "CONFIRMED",
      cardId: "__all__",
      search: "  ",
    })
    const params = new URLSearchParams(qs)
    assert.equal(params.get("page"), "2")
    assert.equal(params.get("limit"), "20")
    assert.equal(params.get("dateFrom"), "2026-08-01")
    assert.equal(params.get("dateTo"), "2026-08-31")
    assert.equal(params.get("accountId"), "acc-1")
    assert.equal(params.get("type"), "DEBIT")
    assert.equal(params.get("status"), "CONFIRMED")
    assert.equal(params.has("cardId"), false)
    assert.equal(params.has("search"), false)
    assert.equal(params.has("categoryId"), false)
  })

  it("includes a trimmed search term", () => {
    const qs = buildTransactionsSearchParams({
      page: 1,
      limit: 20,
      search: "  supermercado  ",
    })
    assert.equal(new URLSearchParams(qs).get("search"), "supermercado")
  })
})

describe("transactionsFromPayload", () => {
  it("reads items and pagination instead of treating the object as an array", () => {
    const listed = transactionsFromPayload({
      items: [{ id: "t1", amount: "10.00" }],
      pagination: { page: 2, limit: 20, total: 21, totalPages: 2 },
    })
    assert.equal(listed.items.length, 1)
    assert.equal(listed.items[0]?.id, "t1")
    assert.equal(listed.pagination.page, 2)
    assert.equal(listed.pagination.totalPages, 2)

    const asArray = transactionsFromPayload([{ id: "nope" }])
    assert.deepEqual(asArray.items, [])

    const nestedData = transactionsFromPayload({
      data: { items: [{ id: "hidden" }], pagination: { page: 1 } },
    })
    assert.deepEqual(nestedData.items, [])
  })
})

describe("visibleTransactionTotals", () => {
  it("splits CREDIT into income and DEBIT into expenses, ignoring transfers", () => {
    const totals = visibleTransactionTotals([
      { type: "CREDIT", amount: "10.00", transferGroupId: null },
      { type: "DEBIT", amount: "3.25", transferGroupId: null },
      { type: "DEBIT", amount: "10.00", transferGroupId: null },
      { type: "TRANSFER", amount: "50.00", transferGroupId: "grp-1" },
      { type: "DEBIT", amount: "100.00", transferGroupId: "grp-2" },
    ])
    assert.equal(totals.income, 10)
    assert.equal(totals.expenses, 13.25)
  })
})

describe("formatTransactionDate", () => {
  it("keeps the calendar day of an UTC midnight ISO string", () => {
    const expected = new Date(2026, 8, 18).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    assert.equal(formatTransactionDate("2026-09-18T00:00:00.000Z"), expected)
    assert.equal(formatTransactionDate("2026-09-18"), expected)
    assert.match(formatTransactionDate("2026-09-18T00:00:00.000Z"), /18/)
    assert.match(formatTransactionDate("2026-09-18T00:00:00.000Z"), /2026/)
  })
})

describe("canReverseTransaction", () => {
  it("is true only for CONFIRMED non-transfer movements", () => {
    assert.equal(
      canReverseTransaction({
        status: "CONFIRMED",
        type: "DEBIT",
        transferGroupId: null,
      }),
      true,
    )
    assert.equal(
      canReverseTransaction({
        status: "CONFIRMED",
        type: "TRANSFER",
        transferGroupId: null,
      }),
      false,
    )
    assert.equal(
      canReverseTransaction({
        status: "CONFIRMED",
        type: "DEBIT",
        transferGroupId: "grp-1",
      }),
      false,
    )
    assert.equal(
      canReverseTransaction({
        status: "REVERSED",
        type: "DEBIT",
        transferGroupId: null,
      }),
      false,
    )
    assert.equal(
      canReverseTransaction({
        status: "PENDING",
        type: "CREDIT",
        transferGroupId: null,
      }),
      false,
    )
  })
})

describe("transferDirectionLabel", () => {
  it("joins origin and destination names", () => {
    assert.equal(
      transferDirectionLabel({
        accountName: "Nómina",
        cardName: null,
        transferToAccountName: "Ahorros",
        transferToCardName: null,
      }),
      "Nómina → Ahorros",
    )
  })
})
