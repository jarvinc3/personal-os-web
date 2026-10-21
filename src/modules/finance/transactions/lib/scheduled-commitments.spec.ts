import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type {
  FinanceLoan,
  FinanceSubscriptionUpcomingCharge,
} from "@/src/modules/finance/shared/types/entities"

import {
  groupCommitmentsByMonth,
  loanCommitments,
  subscriptionCommitments,
} from "./scheduled-commitments.ts"

function loan(overrides: Partial<FinanceLoan> = {}): FinanceLoan {
  return {
    id: "loan-1",
    institutionId: null,
    accountId: "acc-1",
    lenderName: "Banco",
    originalAmount: "12000",
    currentBalance: "8000",
    currency: "DOP",
    installmentAmount: "1200",
    installmentFreq: "MONTHLY",
    totalInstallments: 12,
    paidInstallments: 4,
    nextDueDate: "2026-11-20",
    interestRate: null,
    rateType: "FIXED",
    insuranceAmount: null,
    prepaymentPenaltyPct: null,
    notes: null,
    isActive: true,
    ...overrides,
  }
}

function charge(
  overrides: Partial<FinanceSubscriptionUpcomingCharge> = {}
): FinanceSubscriptionUpcomingCharge {
  return {
    id: "sub-1:2026-11-05",
    subscriptionId: "sub-1",
    name: "Spotify",
    logoUrl: null,
    amount: "5.99",
    currency: "USD",
    date: "2026-11-05",
    daysUntil: 15,
    paymentMethod: {
      type: "CARD",
      id: "card-1",
      name: "Visa",
      institution: "Banco",
      last4: "4321",
      logoUrl: null,
    },
    ...overrides,
  }
}

describe("loanCommitments", () => {
  it("uses the next due date as a scheduled instalment", () => {
    const commitments = loanCommitments({
      loans: [loan()],
      fromDate: "2026-10-21",
    })

    assert.deepEqual(commitments, [
      {
        id: "loan:loan-1",
        kind: "LOAN",
        referenceId: "loan-1",
        name: "Banco",
        amount: "1200",
        currency: "DOP",
        date: "2026-11-20",
        hasPaymentMethod: true,
      },
    ])
  })

  it("skips inactive loans and due dates before the requested day", () => {
    const commitments = loanCommitments({
      loans: [
        loan({ id: "inactive", isActive: false }),
        loan({
          id: "paid",
          paidInstallments: 12,
          totalInstallments: 12,
        }),
        loan({ id: "past", nextDueDate: "2026-10-20" }),
      ],
      fromDate: "2026-10-21",
    })

    assert.deepEqual(commitments, [])
  })

  it("marks a loan without a payment account", () => {
    const [commitment] = loanCommitments({
      loans: [loan({ accountId: null })],
      fromDate: "2026-10-21",
    })

    assert.equal(commitment?.hasPaymentMethod, false)
  })
})

describe("subscriptionCommitments", () => {
  it("maps each upcoming charge and keeps the missing payment method visible", () => {
    const commitments = subscriptionCommitments([
      charge(),
      charge({
        id: "sub-2:2026-12-01",
        subscriptionId: "sub-2",
        name: "iCloud",
        date: "2026-12-01",
        paymentMethod: null,
      }),
    ])

    assert.equal(commitments[0]?.hasPaymentMethod, true)
    assert.equal(commitments[1]?.hasPaymentMethod, false)
    assert.equal(commitments[1]?.referenceId, "sub-2")
  })
})

describe("groupCommitmentsByMonth", () => {
  it("groups by month and orders each month by date", () => {
    const [first, second] = subscriptionCommitments([
      charge({ id: "later", date: "2026-11-20", name: "Later" }),
      charge({ id: "earlier", date: "2026-11-05", name: "Earlier" }),
    ])
    const grouped = groupCommitmentsByMonth([
      second!,
      first!,
      ...loanCommitments({ loans: [loan()], fromDate: "2026-10-21" }),
    ])

    assert.deepEqual(
      grouped.get("2026-11")?.map((item) => item.name),
      ["Earlier", "Banco", "Later"]
    )
  })
})
