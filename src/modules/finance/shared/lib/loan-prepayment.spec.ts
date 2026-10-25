import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceMoneyDisplay } from "./money.ts"
import type { FinanceAccount } from "@/src/modules/finance/shared/types/entities.ts"
import {
  defaultPrepaymentAccountId,
  prepaymentPreviewLines,
  type LoanPrepaymentPreview,
} from "./loan-prepayment.ts"

const display: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: true,
  compactNumbers: false,
  locale: "es-DO",
}

function account(
  partial: Partial<FinanceAccount> & Pick<FinanceAccount, "id">
): FinanceAccount {
  return {
    institutionId: null,
    institutionName: null,
    name: "Cuenta",
    type: "SAVINGS",
    currency: "DOP",
    accountNumberLast4: null,
    balance: "0",
    freeBalance: "0",
    earmarkedAmount: "0",
    color: null,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  } as FinanceAccount
}

const preview: LoanPrepaymentPreview = {
  newBalance: 11900,
  totalInstallments: 12,
  installmentAmount: 1134.72,
  interestRemaining: 1900,
  newEndDate: "2026-11-20",
}

describe("defaultPrepaymentAccountId", () => {
  it("proposes the account the loan is paid from", () => {
    const id = defaultPrepaymentAccountId({
      accounts: [
        account({ id: "cash", freeBalance: "0" }),
        account({ id: "bank", freeBalance: "4500" }),
      ],
      loanAccountId: "bank",
      currency: "DOP",
    })
    assert.equal(id, "bank")
  })

  it("falls back to the first account with free balance", () => {
    const id = defaultPrepaymentAccountId({
      accounts: [
        account({ id: "empty", freeBalance: "0" }),
        account({ id: "funded", freeBalance: "100" }),
      ],
      loanAccountId: null,
      currency: "DOP",
    })
    assert.equal(id, "funded")
  })

  it("prefers a funded account in the loan currency", () => {
    const id = defaultPrepaymentAccountId({
      accounts: [
        account({ id: "usd", currency: "USD", freeBalance: "900" }),
        account({ id: "dop", currency: "DOP", freeBalance: "50" }),
      ],
      loanAccountId: null,
      currency: "DOP",
    })
    assert.equal(id, "dop")
  })

  it("proposes nothing when no account has free balance", () => {
    const id = defaultPrepaymentAccountId({
      accounts: [account({ id: "empty", freeBalance: "0" })],
      loanAccountId: null,
      currency: "DOP",
    })
    assert.equal(id, "")
  })
})

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
