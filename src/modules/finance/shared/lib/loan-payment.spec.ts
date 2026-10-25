import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type {
  FinanceAccount,
  FinanceLoanInstallment,
} from "@/src/modules/finance/shared/types/entities.ts"
import {
  defaultLoanPaymentAccountId,
  installmentDueTotal,
  installmentExcess,
  nextUnpaidInstallment,
} from "./loan-payment.ts"

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

function installment(
  partial: Partial<FinanceLoanInstallment> & Pick<FinanceLoanInstallment, "id">
): FinanceLoanInstallment {
  return {
    loanId: "loan-1",
    installmentNo: 1,
    dueDate: "2026-11-20",
    amount: "1134.72",
    principal: "900.00",
    interest: "200.00",
    insurance: "34.72",
    fees: "0.00",
    lateFee: "0.00",
    paidAmount: "0.00",
    status: "PENDING",
    paidAt: null,
    ...partial,
  }
}

describe("defaultLoanPaymentAccountId", () => {
  it("proposes the account the loan is paid from", () => {
    const id = defaultLoanPaymentAccountId({
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
    const id = defaultLoanPaymentAccountId({
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
    const id = defaultLoanPaymentAccountId({
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
    const id = defaultLoanPaymentAccountId({
      accounts: [account({ id: "empty", freeBalance: "0" })],
      loanAccountId: null,
      currency: "DOP",
    })
    assert.equal(id, "")
  })
})

describe("installmentDueTotal", () => {
  it("adds principal, interest, insurance, fees and late fee", () => {
    assert.equal(
      installmentDueTotal(
        installment({
          id: "i1",
          principal: "900.00",
          interest: "200.00",
          insurance: "34.72",
          fees: "10.00",
          lateFee: "5.28",
        })
      ),
      1150
    )
  })

  it("ignores what was already paid", () => {
    assert.equal(
      installmentDueTotal(installment({ id: "i1", paidAmount: "500.00" })),
      1134.72
    )
  })
})

describe("installmentExcess", () => {
  it("measures what goes past the installment", () => {
    assert.equal(installmentExcess(1200, 1134.72), 65.28)
  })

  it("is zero when the payment fits or is partial", () => {
    assert.equal(installmentExcess(1134.72, 1134.72), 0)
    assert.equal(installmentExcess(500, 1134.72), 0)
  })
})

describe("nextUnpaidInstallment", () => {
  it("returns the oldest installment that is not paid", () => {
    const next = nextUnpaidInstallment([
      installment({ id: "i1", status: "PAID" }),
      installment({ id: "i2", installmentNo: 2, status: "PARTIAL" }),
      installment({ id: "i3", installmentNo: 3 }),
    ])
    assert.equal(next?.id, "i2")
  })

  it("returns null when every installment is paid", () => {
    assert.equal(
      nextUnpaidInstallment([installment({ id: "i1", status: "PAID" })]),
      null
    )
  })
})
