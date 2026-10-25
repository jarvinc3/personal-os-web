import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceMoneyDisplay } from "./money.ts"
import {
  prepaymentPreviewLines,
  type LoanPrepaymentPreview,
} from "./loan-prepayment.ts"

const display: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es-DO",
}

const preview: LoanPrepaymentPreview = {
  newBalance: 11900,
  totalInstallments: 12,
  installmentAmount: 1134.72,
  interestRemaining: 1900,
  newEndDate: "2026-11-20",
}

describe("prepaymentPreviewLines", () => {
  it("shows the new installment, term and end date", () => {
    const lines = prepaymentPreviewLines({
      preview: { ...preview, totalInstallments: 10 },
      currentInstallments: 12,
      mode: "REDUCE_TERM",
      display,
    })

    assert.equal(lines.length, 3)
    assert.match(lines[0] ?? "", /Cuota nueva/)
    assert.match(lines[1] ?? "", /^10 cuotas/)
    assert.match(lines[2] ?? "", /Interés restante/)
  })

  it("says the term stays when the abono removes no whole installment", () => {
    const lines = prepaymentPreviewLines({
      preview,
      currentInstallments: 12,
      mode: "REDUCE_TERM",
      display,
    })

    assert.match(lines[0] ?? "", /El plazo no cambia/)
    assert.match(lines[0] ?? "", /última cuota/)
    assert.equal(lines.length, 4)
  })

  it("does not warn about the term when reducing the installment", () => {
    const lines = prepaymentPreviewLines({
      preview,
      currentInstallments: 12,
      mode: "REDUCE_INSTALLMENT",
      display,
    })

    assert.doesNotMatch(lines[0] ?? "", /El plazo no cambia/)
  })
})
