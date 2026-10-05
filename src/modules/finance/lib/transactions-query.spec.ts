import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  buildTransactionsSearchParams,
  canReverseTransaction,
  fetchAllTransactionPages,
  formatTransactionDate,
  mergeTransactionsById,
  timelineMonthQuery,
  timelineMonthQueryKey,
  transactionInstrumentLabel,
  transactionsFromPayload,
  transferDirectionLabel,
  visibleTransactionTotals,
} from "./transactions-query.ts";
import { FINANCE_TRANSACTIONS_QUERY_KEY } from "../types/api.ts";

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
      { type: "CREDIT", amountBaseCurrency: "10.00", transferGroupId: null },
      { type: "DEBIT", amountBaseCurrency: "3.25", transferGroupId: null },
      { type: "DEBIT", amountBaseCurrency: "10.00", transferGroupId: null },
      {
        type: "TRANSFER",
        amountBaseCurrency: "50.00",
        transferGroupId: "grp-1",
      },
      {
        type: "DEBIT",
        amountBaseCurrency: "100.00",
        transferGroupId: "grp-2",
      },
    ])
    assert.equal(totals.income, 10)
    assert.equal(totals.expenses, 13.25)
  })

  it("adds the base-currency amount instead of the original foreign amount", () => {
    const totals = visibleTransactionTotals([
      { type: "DEBIT", amountBaseCurrency: "500.00", transferGroupId: null },
      { type: "DEBIT", amountBaseCurrency: "500.00", transferGroupId: null },
      { type: "DEBIT", amountBaseCurrency: "60.50", transferGroupId: null },
    ])
    assert.equal(totals.expenses, 1060.5)
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

describe("transactionInstrumentLabel", () => {
  it("prefers the card and falls back to the account", () => {
    assert.equal(
      transactionInstrumentLabel({
        accountName: "Nómina",
        cardName: "Visa Gold",
      }),
      "Visa Gold",
    )
    assert.equal(
      transactionInstrumentLabel({
        accountName: "Nómina",
        cardName: null,
      }),
      "Nómina",
    )
    assert.equal(
      transactionInstrumentLabel({
        accountName: null,
        cardName: null,
      }),
      null,
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

describe("fetchAllTransactionPages", () => {
  it("walks pages until totalPages and keeps search filters", async () => {
    const calls: string[] = []
    const items = await fetchAllTransactionPages(
      {
        limit: 100,
        accountId: "acc-1",
        search: "super",
        dateFrom: "2026-01-01",
        dateTo: "2026-12-31",
      },
      async (path) => {
        calls.push(path)
        const params = new URLSearchParams(path.split("?")[1])
        const page = Number(params.get("page"))
        return {
          items: [{ id: `t${page}`, amount: "1.00" }],
          pagination: { page, limit: 100, total: 2, totalPages: 2 },
        }
      },
    )
    assert.equal(calls.length, 2)
    assert.match(calls[0] ?? "", /page=1/)
    assert.match(calls[1] ?? "", /page=2/)
    assert.match(calls[0] ?? "", /limit=100/)
    assert.match(calls[0] ?? "", /accountId=acc-1/)
    assert.match(calls[0] ?? "", /search=super/)
    assert.deepEqual(
      items.map((item) => item.id),
      ["t1", "t2"],
    )
  })
})

describe("timelineMonthQuery", () => {
  it("requests the calendar bounds of the current month", async () => {
    const paths: string[] = []
    const query = timelineMonthQuery("2026-10", async (path) => {
      paths.push(path)
      return {
        items: [],
        pagination: { page: 1, limit: 100, total: 0, totalPages: 1 },
      }
    })
    assert.deepEqual(query.queryKey, timelineMonthQueryKey("2026-10"))
    assert.deepEqual(query.queryKey, [
      ...FINANCE_TRANSACTIONS_QUERY_KEY,
      "timeline",
      "month",
      "2026-10",
    ])
    assert.equal(query.staleTime, 5 * 60 * 1000)
    await query.queryFn()
    assert.match(paths[0] ?? "", /dateFrom=2026-10-01/)
    assert.match(paths[0] ?? "", /dateTo=2026-10-31/)
    assert.match(paths[0] ?? "", /limit=100/)
  })
})

describe("mergeTransactionsById", () => {
  it("keeps one row per id when the month query overlaps a year", () => {
    const merged = mergeTransactionsById([
      [{ id: "a" }, { id: "b" }],
      [{ id: "b" }, { id: "c" }],
    ])
    assert.deepEqual(
      merged.map((item) => item.id),
      ["a", "b", "c"],
    )
  })
})
