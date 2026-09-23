import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  buildInstitutionStackItems,
  formatProductCounts,
  formatStackItemBalance,
  institutionInitials,
} from "./institution-stack.ts"
import type {
  FinanceAccount,
  FinanceCard,
  FinanceInstitution,
  FinanceLoan,
} from "../types/entities.ts"

const display = {
  currency: "DOP",
  showCents: false,
  compactNumbers: false,
}

function account(
  partial: Partial<FinanceAccount> & Pick<FinanceAccount, "id" | "name">,
): FinanceAccount {
  return {
    institutionId: null,
    institutionName: null,
    type: "CHECKING",
    currency: "DOP",
    accountNumber: null,
    balance: "0",
    color: null,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  }
}

function card(
  partial: Partial<FinanceCard> & Pick<FinanceCard, "id" | "name" | "institutionId">,
): FinanceCard {
  return {
    institutionName: "Bank",
    accountId: null,
    accountName: null,
    type: "CREDIT",
    network: "VISA",
    lastFour: "4321",
    statementClosingDay: null,
    paymentDueDay: null,
    color: null,
    isActive: true,
    balances: [{ id: "b1", currency: "DOP", balance: "0", creditLimit: null }],
    ...partial,
  }
}

function loan(
  partial: Partial<FinanceLoan> & Pick<FinanceLoan, "id" | "lenderName">,
): FinanceLoan {
  return {
    institutionId: null,
    accountId: null,
    originalAmount: "0",
    currentBalance: "0",
    currency: "DOP",
    installmentAmount: "0",
    installmentFreq: "MONTHLY",
    totalInstallments: 12,
    paidInstallments: 0,
    nextDueDate: "2026-02-01",
    interestRate: null,
    notes: null,
    isActive: true,
    ...partial,
  }
}

describe("institutionInitials", () => {
  it("uses two letters from a single word", () => {
    assert.equal(institutionInitials("Popular"), "PO")
  })

  it("uses first letters of two words", () => {
    assert.equal(institutionInitials("Banco Popular"), "BP")
  })
})

describe("formatProductCounts", () => {
  it("formats Spanish counts", () => {
    assert.equal(
      formatProductCounts({ accounts: 2, cards: 1, loans: 0 }),
      "2 cuentas · 1 tarjetas · 0 préstamos",
    )
  })
})

describe("buildInstitutionStackItems", () => {
  const institutions: FinanceInstitution[] = [
    {
      id: "i1",
      name: "Banco Popular",
      color: "#1B4332",
      logoUrl: null,
      country: "DO",
      isActive: true,
    },
    {
      id: "i2",
      name: "Inactive Bank",
      color: null,
      logoUrl: null,
      country: null,
      isActive: false,
    },
  ]

  it("attaches API net worth without summing local balances", () => {
    const items = buildInstitutionStackItems({
      institutions,
      accounts: [
        account({
          id: "a1",
          name: "Cuenta Principal",
          institutionId: "i1",
          balance: "84500",
        }),
        account({
          id: "cash1",
          name: "Billetera",
          type: "CASH",
          balance: "1200",
        }),
        account({
          id: "cash-linked",
          name: "Caja banco",
          type: "CASH",
          institutionId: "i1",
          balance: "50",
        }),
      ],
      cards: [
        card({
          id: "c1",
          name: "Visa Gold",
          institutionId: "i1",
          type: "CREDIT",
          balances: [
            { id: "b1", currency: "DOP", balance: "18500", creditLimit: null },
          ],
        }),
      ],
      loans: [loan({ id: "l1", lenderName: "Auto", institutionId: "i1", currentBalance: "13500" })],
      positions: [
        {
          institutionId: "i1",
          status: "COMPLETE",
          netWorth: "-8549.27",
          issues: [],
        },
      ],
    })

    assert.equal(items.length, 2)
    assert.equal(items[0]?.kind, "institution")
    if (items[0]?.kind === "institution") {
      assert.equal(items[0].counts.accounts, 2)
      assert.equal(items[0].counts.cards, 1)
      assert.equal(items[0].counts.loans, 1)
      assert.equal(items[0].status, "COMPLETE")
      assert.equal(items[0].netWorth, "-8549.27")
    }
    assert.equal(items[1]?.kind, "cash")
    if (items[1]?.kind === "cash") {
      assert.equal(items[1].account.name, "Billetera")
      assert.equal(items[1].balance, "1200")
    }
  })

  it("marks institutions incomplete when the snapshot has no position", () => {
    const items = buildInstitutionStackItems({
      institutions,
      accounts: [
        account({
          id: "a1",
          name: "Cuenta Principal",
          institutionId: "i1",
          balance: "84500",
        }),
      ],
      cards: [],
      loans: [],
    })

    assert.equal(items[0]?.kind, "institution")
    if (items[0]?.kind === "institution") {
      assert.equal(items[0].status, "INCOMPLETE")
      assert.equal(items[0].netWorth, null)
    }
  })
})

describe("formatStackItemBalance", () => {
  it("hides incomplete net worth", () => {
    const items = buildInstitutionStackItems({
      institutions: [
        {
          id: "i1",
          name: "BHD",
          color: null,
          logoUrl: null,
          country: "DO",
          isActive: true,
        },
      ],
      accounts: [],
      cards: [],
      loans: [],
      positions: [
        {
          institutionId: "i1",
          status: "INCOMPLETE",
          netWorth: null,
          issues: [{ code: "MISSING_CREDIT_LIMIT", cardId: "c1", currency: "DOP" }],
        },
      ],
    })
    assert.equal(items[0]?.kind, "institution")
    if (items[0]?.kind !== "institution") return
    assert.equal(formatStackItemBalance(items[0], display), "Balance incompleto")
  })
})
