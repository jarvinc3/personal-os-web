import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"

import {
  formatPublicShareUpdatedAt,
  publicShareCountCaption,
  publicShareCurrencyRows,
  publicShareDetailDescription,
  publicShareItemCaption,
  publicShareItemProgress,
  publicSharePaymentRows,
  publicSharePendingTotals,
  publicShareSummaryRows,
  type PublicReceivableShareItem,
} from "./public-receivable-share.ts"

const DISPLAY: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es-DO",
}

function item(
  overrides: Partial<PublicReceivableShareItem> = {}
): PublicReceivableShareItem {
  return {
    ref: "a1b2c3",
    concept: "Préstamo celular",
    createdAt: "2026-09-12T14:00:00.000Z",
    dueDate: "2026-10-30T00:00:00.000Z",
    amount: "8500.00",
    paid: "3000.00",
    pending: "5500.00",
    currency: "DOP",
    status: "PARTIAL",
    note: null,
    payments: [],
    ...overrides,
  }
}

describe("publicShareCurrencyRows", () => {
  it("keeps one row per currency with its own bar", () => {
    const rows = publicShareCurrencyRows(
      [
        {
          currency: "DOP",
          amount: "12650.00",
          paid: "3000.00",
          pending: "9650.00",
        },
        { currency: "USD", amount: "120.00", paid: "0.00", pending: "120.00" },
      ],
      DISPLAY
    )

    assert.deepEqual(rows, [
      {
        currency: "DOP",
        pendingLabel: "DOP $9,650.00",
        paidCaption: "DOP $3,000.00 pagado · 24%",
        totalCaption: "Total DOP $12,650.00",
        progress: (3000 / 12650) * 100,
      },
      {
        currency: "USD",
        pendingLabel: "USD $120.00",
        paidCaption: "USD $0.00 pagado · 0%",
        totalCaption: "Total USD $120.00",
        progress: 0,
      },
    ])
  })

  it("reports no progress when the total is zero", () => {
    const rows = publicShareCurrencyRows(
      [{ currency: "DOP", amount: "0.00", paid: "0.00", pending: "0.00" }],
      DISPLAY
    )

    assert.equal(rows[0]?.progress, 0)
  })
})

describe("publicSharePendingTotals", () => {
  it("exposes pending per currency for the shared formatting", () => {
    assert.deepEqual(
      publicSharePendingTotals(
        [
          {
            currency: "DOP",
            amount: "12650.00",
            paid: "3000.00",
            pending: "9650.00",
          },
          {
            currency: "USD",
            amount: "120.00",
            paid: "0.00",
            pending: "120.00",
          },
        ],
        DISPLAY
      ),
      [
        { currency: "DOP", pending: 9650, label: "DOP $9,650.00" },
        { currency: "USD", pending: 120, label: "USD $120.00" },
      ]
    )
  })
})

describe("publicShareItemProgress", () => {
  it("is the collected share of the total", () => {
    assert.equal(publicShareItemProgress(item()), (3000 / 8500) * 100)
  })

  it("never goes past full or below zero", () => {
    assert.equal(
      publicShareItemProgress(item({ amount: "100.00", paid: "150.00" })),
      100
    )
    assert.equal(
      publicShareItemProgress(item({ amount: "100.00", paid: "-10.00" })),
      0
    )
  })
})

describe("publicShareItemCaption", () => {
  it("shows what is left and when it is due", () => {
    assert.equal(
      publicShareItemCaption(item(), DISPLAY),
      "Resta DOP $5,500.00 · Vence 30 oct 2026"
    )
  })

  it("says the cobro is complete with nothing left", () => {
    assert.equal(
      publicShareItemCaption(
        item({ paid: "8500.00", pending: "0.00", dueDate: null }),
        DISPLAY
      ),
      "Cobro completo"
    )
  })

  it("omits the due date when there is none", () => {
    assert.equal(
      publicShareItemCaption(item({ dueDate: null }), DISPLAY),
      "Resta DOP $5,500.00"
    )
  })
})

describe("publicShareSummaryRows", () => {
  it("lists amounts, creation and due date", () => {
    assert.deepEqual(publicShareSummaryRows(item(), DISPLAY), [
      { label: "Monto total", value: "DOP $8,500.00" },
      { label: "Pagado", value: "DOP $3,000.00", tone: "success" },
      { label: "Pendiente", value: "DOP $5,500.00" },
      { label: "Creado", value: "12 sep 2026" },
      { label: "Vence", value: "30 oct 2026" },
    ])
  })

  it("omits the due date when there is none", () => {
    const rows = publicShareSummaryRows(item({ dueDate: null }), DISPLAY)

    assert.deepEqual(
      rows.map((row) => row.label),
      ["Monto total", "Pagado", "Pendiente", "Creado"]
    )
  })
})

describe("publicSharePaymentRows", () => {
  it("maps each payment with its date", () => {
    assert.deepEqual(
      publicSharePaymentRows(
        item({
          payments: [
            { paidAt: "2026-10-10T12:00:00.000Z", amount: "2000.00" },
            { paidAt: "2026-09-25T12:00:00.000Z", amount: "1000.00" },
          ],
        }),
        DISPLAY
      ),
      [
        {
          key: "2026-10-10T12:00:00.000Z-2000.00",
          amountLabel: "DOP $2,000.00",
          dateLabel: "10 oct 2026",
        },
        {
          key: "2026-09-25T12:00:00.000Z-1000.00",
          amountLabel: "DOP $1,000.00",
          dateLabel: "25 sep 2026",
        },
      ]
    )
  })
})

describe("publicShareDetailDescription", () => {
  it("names the owner and the read-only condition", () => {
    assert.equal(
      publicShareDetailDescription("Jarvin"),
      "Cobro compartido por Jarvin · solo lectura"
    )
  })
})

describe("formatPublicShareUpdatedAt", () => {
  const now = new Date(2026, 9, 16, 18, 0)

  it("says today with the time", () => {
    assert.equal(
      formatPublicShareUpdatedAt(
        new Date(2026, 9, 16, 15, 30).toISOString(),
        now,
        "es-DO"
      ),
      "Actualizado hoy, 03:30 p.m."
    )
  })

  it("says yesterday", () => {
    assert.equal(
      formatPublicShareUpdatedAt(
        new Date(2026, 9, 15, 15, 30).toISOString(),
        now,
        "es-DO"
      ),
      "Actualizado ayer, 03:30 p.m."
    )
  })

  it("falls back to the day", () => {
    assert.equal(
      formatPublicShareUpdatedAt(
        new Date(2026, 8, 12, 15, 30).toISOString(),
        now,
        "es-DO"
      ),
      "Actualizado el 12 sep"
    )
  })

  it("returns an empty label for an unreadable date", () => {
    assert.equal(formatPublicShareUpdatedAt("", now, "es-DO"), "")
  })
})

describe("publicShareCountCaption", () => {
  it("keeps the singular for one cobro", () => {
    assert.equal(publicShareCountCaption(1), "1 cobro")
    assert.equal(publicShareCountCaption(3), "3 cobros")
  })
})
