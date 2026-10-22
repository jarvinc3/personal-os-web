import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceReceivable,
  FinanceReceivableStatus,
} from "@/src/modules/finance/shared/types/entities"

import {
  buildCreateReceivableShareBody,
  debtorFirstName,
  formatSharePendingTotals,
  MAX_RECEIVABLE_SHARE_ITEMS,
  maskShareUrl,
  receivableShareConcept,
  shareSelectionDebtor,
  shareSelectionError,
  shareSelectionTotals,
  shareSummaryLines,
  shareableReceivables,
  whatsAppShareHref,
  whatsAppShareMessage,
} from "./receivable-share.ts"

const DISPLAY: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
}

function receivable(
  overrides: Partial<FinanceReceivable> & { id: string }
): FinanceReceivable {
  return {
    debtorName: "Carlos Méndez",
    description: "Préstamo celular",
    amount: "8500.00",
    paidAmount: "3000.00",
    creditBalance: "0.00",
    writtenOffAmount: "0.00",
    writtenOffAt: null,
    currency: "DOP",
    dueDate: null,
    status: "PARTIAL" as FinanceReceivableStatus,
    ...overrides,
  }
}

describe("shareableReceivables", () => {
  it("leaves out cancelled and written-off cobros", () => {
    const listed = [
      receivable({ id: "pending", status: "PENDING" }),
      receivable({ id: "cancelled", status: "CANCELLED" }),
      receivable({ id: "written-off", status: "WRITTEN_OFF" }),
      receivable({ id: "paid", status: "PAID" }),
    ]

    assert.deepEqual(
      shareableReceivables(listed).map((item) => item.id),
      ["pending", "paid"]
    )
  })

  it("returns a new array instead of mutating the input", () => {
    const listed = [receivable({ id: "pending" })]

    assert.notEqual(shareableReceivables(listed), listed)
  })
})

describe("shareSelectionTotals", () => {
  it("keeps one line per currency without converting", () => {
    const totals = shareSelectionTotals(
      [
        receivable({ id: "a", amount: "8500.00", paidAmount: "3000.00" }),
        receivable({ id: "b", amount: "2350.00", paidAmount: "0.00" }),
        receivable({
          id: "c",
          amount: "120.00",
          paidAmount: "0.00",
          currency: "USD",
        }),
      ],
      DISPLAY
    )

    assert.deepEqual(totals, [
      { currency: "DOP", pending: 7850, label: "DOP $7,850.00" },
      { currency: "USD", pending: 120, label: "USD $120.00" },
    ])
  })

  it("is empty when nothing is selected", () => {
    assert.deepEqual(shareSelectionTotals([], DISPLAY), [])
  })
})

describe("formatSharePendingTotals", () => {
  it("joins currencies with a plus", () => {
    assert.equal(
      formatSharePendingTotals([
        { currency: "DOP", pending: 9650, label: "DOP $9,650.00" },
        { currency: "USD", pending: 120, label: "USD $120.00" },
      ]),
      "DOP $9,650.00 + USD $120.00"
    )
  })

  it("shows a dash with no selection", () => {
    assert.equal(formatSharePendingTotals([]), "—")
  })
})

describe("receivableShareConcept", () => {
  it("uses the stored description", () => {
    assert.equal(
      receivableShareConcept(receivable({ id: "a" })),
      "Préstamo celular"
    )
  })

  it("falls back when the concept is empty", () => {
    assert.equal(
      receivableShareConcept(receivable({ id: "a", description: "   " })),
      "Cobro sin concepto"
    )
  })
})

describe("shareSummaryLines", () => {
  it("lists the concept with the pending amount in its own currency", () => {
    assert.deepEqual(
      shareSummaryLines(
        [
          receivable({ id: "a" }),
          receivable({
            id: "b",
            description: "Cena cumpleaños",
            amount: "2350.00",
            paidAmount: "0.00",
          }),
        ],
        DISPLAY
      ),
      [
        {
          id: "a",
          concept: "Préstamo celular",
          pendingLabel: "DOP $5,500.00",
        },
        {
          id: "b",
          concept: "Cena cumpleaños",
          pendingLabel: "DOP $2,350.00",
        },
      ]
    )
  })
})

describe("shareSelectionDebtor", () => {
  it("returns the only debtor of the selection", () => {
    assert.equal(
      shareSelectionDebtor([receivable({ id: "a" }), receivable({ id: "b" })]),
      "Carlos Méndez"
    )
  })

  it("returns null when the selection mixes people", () => {
    assert.equal(
      shareSelectionDebtor([
        receivable({ id: "a" }),
        receivable({ id: "b", debtorName: "Ana Pérez" }),
      ]),
      null
    )
  })
})

describe("debtorFirstName", () => {
  it("keeps the first word only", () => {
    assert.equal(debtorFirstName("  Carlos   Méndez "), "Carlos")
  })
})

describe("shareSelectionError", () => {
  it("asks for at least one cobro", () => {
    assert.equal(shareSelectionError([]), "Elige al menos un cobro.")
  })

  it("rejects a selection of more than the API bound", () => {
    const many = Array.from(
      { length: MAX_RECEIVABLE_SHARE_ITEMS + 1 },
      (_, index) => receivable({ id: `r-${index}` })
    )

    assert.equal(
      shareSelectionError(many),
      `Máximo ${MAX_RECEIVABLE_SHARE_ITEMS} cobros por link.`
    )
  })

  it("rejects cobros from different people", () => {
    assert.equal(
      shareSelectionError([
        receivable({ id: "a" }),
        receivable({ id: "b", debtorName: "Ana Pérez" }),
      ]),
      "Los cobros deben ser de una misma persona."
    )
  })

  it("accepts one debtor with pending left", () => {
    assert.equal(shareSelectionError([receivable({ id: "a" })]), null)
  })
})

describe("buildCreateReceivableShareBody", () => {
  it("trims the debtor name and sends the cobro ids", () => {
    assert.deepEqual(
      buildCreateReceivableShareBody({
        receivables: [receivable({ id: "a" }), receivable({ id: "b" })],
        debtorName: "  Carlos Méndez  ",
      }),
      {
        ok: true,
        body: { receivableIds: ["a", "b"], debtorName: "Carlos Méndez" },
      }
    )
  })

  it("fails with the selection error", () => {
    assert.deepEqual(
      buildCreateReceivableShareBody({
        receivables: [],
        debtorName: "Carlos",
      }),
      { ok: false, error: "Elige al menos un cobro." }
    )
  })

  it("fails when the name is blank", () => {
    assert.deepEqual(
      buildCreateReceivableShareBody({
        receivables: [receivable({ id: "a" })],
        debtorName: "   ",
      }),
      { ok: false, error: "Escribe el nombre del deudor." }
    )
  })

  it("fails when the name is longer than the API bound", () => {
    assert.deepEqual(
      buildCreateReceivableShareBody({
        receivables: [receivable({ id: "a" })],
        debtorName: "C".repeat(121),
      }),
      { ok: false, error: "Máximo 120 caracteres." }
    )
  })
})

describe("maskShareUrl", () => {
  it("hides the middle of the token", () => {
    assert.equal(
      maskShareUrl("https://personalos.app/c/k7QpabcdefghX2aZ"),
      "personalos.app/c/k7Qp…X2aZ"
    )
  })

  it("keeps a short token whole", () => {
    assert.equal(
      maskShareUrl("https://personalos.app/c/short"),
      "personalos.app/c/short"
    )
  })

  it("returns a value it cannot parse unchanged", () => {
    assert.equal(maskShareUrl("no-es-una-url"), "no-es-una-url")
  })
})

describe("whatsAppShareHref", () => {
  const url = "https://personalos.app/c/abc"

  it("writes the message from the lender with the approved format", () => {
    const message = whatsAppShareMessage({
      url,
      debtorName: "Fernando Carmona",
      count: 1,
      pendingLabel: "DOP $9,650.00",
    })

    assert.equal(
      message,
      [
        "Hola Fernando \u{1F44B}",
        "",
        "Te comparto el detalle de lo que me debes (1 cobro) \u{1F9FE}",
        "\u{1F4B0} Pendiente: *DOP $9,650.00*",
        "",
        `\u{1F449} ${url}`,
        "",
        "Ahí puedes ver cada cobro y lo que ya has abonado. ¡Gracias! \u{1F64C}",
      ].join("\n")
    )
  })

  it("counts several cobros and keeps currencies apart", () => {
    const message = whatsAppShareMessage({
      url,
      debtorName: "Fernando Carmona",
      count: 3,
      pendingLabel: "DOP $9,650.00 + USD $120.00",
    })

    assert.match(message, /\(3 cobros\)/)
    assert.match(message, /Pendiente: \*DOP \$9,650\.00 \+ USD \$120\.00\*/)
  })

  it("opens WhatsApp with that message encoded", () => {
    const input = {
      url,
      debtorName: "Carlos Méndez",
      count: 2,
      pendingLabel: "DOP $5,500.00",
    }

    assert.equal(
      whatsAppShareHref(input),
      `https://wa.me/?text=${encodeURIComponent(whatsAppShareMessage(input))}`
    )
  })
})
