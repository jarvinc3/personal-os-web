import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildTransactionsSearchParams,
  canReverseTransaction,
  fetchAllTransactionPages,
  formatTransactionDate,
  mergeTransactionsById,
  movementSideMoney,
  movementTouchesInstrument,
  OPERATION_LEG_ROLE,
  signedAmount,
  timelineMonthQuery,
  timelineMonthQueryKey,
  transactionInstrumentLabel,
  transactionsFromPayload,
  transferDirectionLabel,
  transferSignFromInstrument,
  visibleTransactionTotals,
} from "./transactions-query.ts"
import type { FinanceTransaction } from "../types/entities.ts"
import { FINANCE_TRANSACTIONS_QUERY_KEY } from "../types/api.ts"

describe("buildTransactionsSearchParams", () => {
  it("sends the cursor and the DTO filters, omitting empty sentinels", () => {
    const qs = buildTransactionsSearchParams({
      cursor: "cur-2",
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
    assert.equal(params.get("cursor"), "cur-2")
    assert.equal(params.get("limit"), "20")
    assert.equal(params.get("groupOperations"), "true")
    assert.equal(params.has("page"), false)
    assert.equal(params.get("dateFrom"), "2026-08-01")
    assert.equal(params.get("dateTo"), "2026-08-31")
    assert.equal(params.get("accountId"), "acc-1")
    assert.equal(params.get("type"), "DEBIT")
    assert.equal(params.has("possibleDuplicates"), false)
    assert.equal(params.get("status"), "CONFIRMED")
    assert.equal(params.has("cardId"), false)
    assert.equal(params.has("search"), false)
    assert.equal(params.has("categoryId"), false)
  })

  it("includes a trimmed search term", () => {
    const qs = buildTransactionsSearchParams({
      limit: 20,
      search: "  supermercado  ",
    })
    assert.equal(new URLSearchParams(qs).get("search"), "supermercado")
  })

  it("asks for possible duplicates only when filtering them", () => {
    const qs = buildTransactionsSearchParams({
      limit: 20,
      possibleDuplicates: true,
    })
    assert.equal(new URLSearchParams(qs).get("possibleDuplicates"), "true")
  })
})

describe("transactionsFromPayload", () => {
  it("reads items and the cursor instead of treating the object as an array", () => {
    const listed = transactionsFromPayload({
      items: [{ id: "t1", amount: "10.00" }],
      nextCursor: "cursor-2",
      hasMore: true,
    })
    assert.equal(listed.items.length, 1)
    assert.equal(listed.items[0]?.id, "t1")
    assert.equal(listed.nextCursor, "cursor-2")
    assert.equal(listed.hasMore, true)

    const asArray = transactionsFromPayload([{ id: "nope" }])
    assert.deepEqual(asArray.items, [])

    const nestedData = transactionsFromPayload({
      data: { items: [{ id: "hidden" }], nextCursor: "x" },
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

  it("counts the transfer fee leg as expense without counting the transfer", () => {
    const totals = visibleTransactionTotals([
      {
        type: "TRANSFER",
        amountBaseCurrency: "100.00",
        transferGroupId: "grp-1",
        status: "CONFIRMED",
        legs: [
          {
            amountBaseCurrency: "100.00",
            status: "CONFIRMED",
            legRole: "SOURCE",
          },
          {
            amountBaseCurrency: "2.50",
            status: "CONFIRMED",
            legRole: "FEE",
          },
        ],
      },
    ])
    assert.equal(totals.expenses, 2.5)
    assert.equal(totals.income, 0)
  })

  it("uses the amount in the requested currency instead of the base amount", () => {
    const totals = visibleTransactionTotals(
      [
        {
          type: "DEBIT",
          amount: "10.00",
          currency: "USD",
          amountBaseCurrency: "614.51",
          transferGroupId: null,
        },
      ],
      "USD"
    )
    assert.equal(totals.expenses, 10)
  })

  it("ignores movements in another currency when one is requested", () => {
    const totals = visibleTransactionTotals(
      [
        {
          type: "DEBIT",
          amount: "500.00",
          currency: "DOP",
          amountBaseCurrency: "500.00",
          transferGroupId: null,
        },
      ],
      "USD"
    )
    assert.equal(totals.expenses, 0)
  })
})

describe("formatTransactionDate", () => {
  it("keeps the calendar day of an UTC midnight ISO string", () => {
    const expected = new Date(2026, 8, 18).toLocaleDateString("es", {
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
  it("is true for any CONFIRMED movement, including transfers", () => {
    assert.equal(
      canReverseTransaction({
        status: "CONFIRMED",
        type: "DEBIT",
        transferGroupId: null,
      }),
      true
    )
    assert.equal(
      canReverseTransaction({
        status: "CONFIRMED",
        type: "TRANSFER",
        transferGroupId: null,
      }),
      true
    )
    assert.equal(
      canReverseTransaction({
        status: "CONFIRMED",
        type: "DEBIT",
        transferGroupId: "grp-1",
      }),
      true
    )
    assert.equal(
      canReverseTransaction({
        status: "REVERSED",
        type: "DEBIT",
        transferGroupId: null,
      }),
      false
    )
    assert.equal(
      canReverseTransaction({
        status: "PENDING",
        type: "CREDIT",
        transferGroupId: null,
      }),
      false
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
      "Visa Gold"
    )
    assert.equal(
      transactionInstrumentLabel({
        accountName: "Nómina",
        cardName: null,
      }),
      "Nómina"
    )
    assert.equal(
      transactionInstrumentLabel({
        accountName: null,
        cardName: null,
      }),
      null
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
      "Nómina → Ahorros"
    )
  })
})

describe("fetchAllTransactionPages", () => {
  it("walks the cursor and keeps search filters", async () => {
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
        const index = Number(params.get("cursor") ?? 1)
        const nextIndex = index + 1
        return {
          items: [{ id: `t${index}`, amount: "1.00" }],
          nextCursor: index < 2 ? String(nextIndex) : null,
          hasMore: index < 2,
        }
      }
    )
    assert.equal(calls.length, 2)
    assert.equal(
      new URLSearchParams(calls[0]?.split("?")[1]).has("cursor"),
      false
    )
    assert.equal(
      new URLSearchParams(calls[1]?.split("?")[1]).get("cursor"),
      "2"
    )
    assert.match(calls[0] ?? "", /limit=100/)
    assert.match(calls[0] ?? "", /accountId=acc-1/)
    assert.match(calls[0] ?? "", /search=super/)
    assert.deepEqual(
      items.map((item) => item.id),
      ["t1", "t2"]
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
        nextCursor: null,
        hasMore: false,
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
      ["a", "b", "c"]
    )
  })
})

const transfer: FinanceTransaction = {
  id: "tx-1",
  type: "DEBIT",
  status: "CONFIRMED",
  editable: "NONE",
  amount: "100.00",
  currency: "DOP",
  ledgerAmount: "-100.00",
  ledgerCurrency: "DOP",
  amountBaseCurrency: "100.00",
  exchangeRate: null,
  accountId: "acc-a",
  accountName: "Ahorros",
  cardId: null,
  cardName: null,
  categoryId: null,
  merchant: null,
  notes: null,
  source: null,
  transactionDate: "2026-10-20T13:02:00.000Z",
  description: null,
  transferGroupId: "grp-1",
  transferToAccountId: "acc-b",
  transferToAccountName: "Corriente",
  transferToCardId: null,
  transferToCardName: null,
  kind: "OPERATION",
  operationType: "TRANSFER",
  legs: [
    {
      ...({
        id: "leg-out",
        type: "DEBIT",
        amount: "100.00",
        accountId: "acc-a",
        cardId: null,
      } as FinanceTransaction),
      legRole: OPERATION_LEG_ROLE.SOURCE,
    },
    {
      ...({
        id: "leg-in",
        type: "CREDIT",
        amount: "100.00",
        accountId: "acc-b",
        cardId: "card-b",
      } as FinanceTransaction),
      legRole: OPERATION_LEG_ROLE.DESTINATION,
    },
  ],
}

describe("transferSignFromInstrument", () => {
  it("signs the source account negative and the destination positive", () => {
    assert.equal(
      transferSignFromInstrument(transfer, { accountId: "acc-a" }),
      "−"
    )
    assert.equal(
      transferSignFromInstrument(transfer, { accountId: "acc-b" }),
      "+"
    )
  })

  it("signs a card on the destination leg positive", () => {
    assert.equal(
      transferSignFromInstrument(transfer, { cardId: "card-b" }),
      "+"
    )
  })

  it("falls back to the row fields when the legs are missing", () => {
    const withoutLegs = { ...transfer, legs: undefined }
    assert.equal(
      transferSignFromInstrument(withoutLegs, { accountId: "acc-a" }),
      "−"
    )
    assert.equal(
      transferSignFromInstrument(withoutLegs, { accountId: "acc-b" }),
      "+"
    )
  })

  it("returns no sign for an unrelated instrument", () => {
    assert.equal(
      transferSignFromInstrument(transfer, { accountId: "acc-z" }),
      null
    )
  })
})

describe("movementTouchesInstrument", () => {
  it("matches the origin, the destination and the legs", () => {
    assert.equal(
      movementTouchesInstrument(transfer, { accountId: "acc-a" }),
      true
    )
    assert.equal(
      movementTouchesInstrument(transfer, { accountId: "acc-b" }),
      true
    )
    assert.equal(
      movementTouchesInstrument(transfer, { cardId: "card-b" }),
      true
    )
    assert.equal(
      movementTouchesInstrument(transfer, { cardId: "card-z" }),
      false
    )
  })
})

describe("signedAmount", () => {
  const display = { currency: "DOP", showCents: true, compactNumbers: false }

  it("signs a transfer from the side of the instrument", () => {
    assert.match(
      signedAmount({
        transaction: transfer,
        display,
        instrument: { accountId: "acc-a" },
      }),
      /^− /
    )
    assert.match(
      signedAmount({
        transaction: transfer,
        display,
        instrument: { accountId: "acc-b" },
      }),
      /^\+ /
    )
  })

  it("leaves a transfer unsigned when no instrument is given", () => {
    assert.doesNotMatch(
      signedAmount({ transaction: transfer, display }),
      /^[+−] /
    )
  })
})

describe("movementSideMoney", () => {
  const crossCurrency: FinanceTransaction = {
    ...transfer,
    amount: "100.00",
    currency: "USD",
    exchangeRate: "61.45",
    transferToAmount: "6145.00",
    transferToCurrency: "DOP",
    legs: [
      {
        ...({
          id: "leg-out",
          type: "DEBIT",
          amount: "100.00",
          accountId: "acc-a",
          cardId: null,
        } as FinanceTransaction),
        legRole: OPERATION_LEG_ROLE.SOURCE,
      },
      {
        ...({
          id: "leg-in",
          type: "CREDIT",
          amount: "6145.00",
          accountId: "acc-b",
          cardId: null,
        } as FinanceTransaction),
        legRole: OPERATION_LEG_ROLE.DESTINATION,
      },
    ],
  }

  it("keeps the source amount on the origin side", () => {
    assert.deepEqual(movementSideMoney(crossCurrency, { accountId: "acc-a" }), {
      amount: "100.00",
      currency: "USD",
    })
  })

  it("shows the received amount and currency on the destination side", () => {
    assert.deepEqual(movementSideMoney(crossCurrency, { accountId: "acc-b" }), {
      amount: "6145.00",
      currency: "DOP",
    })
  })

  it("falls back to the source amount when the destination is unknown", () => {
    assert.deepEqual(movementSideMoney(crossCurrency), {
      amount: "100.00",
      currency: "USD",
    })
  })

  it("falls back to the source amount when the API sends no received amount", () => {
    const withoutReceived: FinanceTransaction = {
      ...crossCurrency,
      transferToAmount: null,
    }
    assert.deepEqual(
      movementSideMoney(withoutReceived, { accountId: "acc-b" }),
      {
        amount: "100.00",
        currency: "USD",
      }
    )
  })

  it("prices the destination row in the received currency", () => {
    const display = { currency: "DOP", showCents: true, compactNumbers: false }
    assert.equal(
      signedAmount({
        transaction: crossCurrency,
        display,
        instrument: { accountId: "acc-b" },
      }),
      "+ DOP $6,145.00"
    )
    assert.equal(
      signedAmount({
        transaction: crossCurrency,
        display,
        instrument: { accountId: "acc-a" },
      }),
      "− USD $100.00"
    )
  })
})
