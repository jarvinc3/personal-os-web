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
  partial: Partial<FinanceAccount> & Pick<FinanceAccount, "id" | "name">
): FinanceAccount {
  return {
    institutionId: null,
    institutionName: null,
    type: "CHECKING",
    currency: "DOP",
    accountNumberLast4: null,
    balance: "0",
    color: null,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...partial,
  }
}

function card(
  partial: Partial<FinanceCard> &
    Pick<FinanceCard, "id" | "name" | "institutionId">
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
    nextStatementDate: null,
    nextPaymentDueDate: null,
    color: null,
    isActive: true,
    balances: [
      {
        id: "b1",
        currency: "DOP",
        balance: "0",
        creditLimit: null,
        availableCredit: null,
      },
    ],
    ...partial,
  }
}

function loan(
  partial: Partial<FinanceLoan> & Pick<FinanceLoan, "id" | "lenderName">
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
  it("uses the singular for one product", () => {
    assert.equal(
      formatProductCounts({ accounts: 1, cards: 1, loans: 1 }),
      "1 cuenta · 1 tarjeta · 1 préstamo"
    )
  })

  it("uses the plural from two products on", () => {
    assert.equal(
      formatProductCounts({ accounts: 2, cards: 3, loans: 0 }),
      "2 cuentas · 3 tarjetas · 0 préstamos"
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
      loans: [
        loan({
          id: "l1",
          lenderName: "Auto",
          institutionId: "i1",
          currentBalance: "13500",
        }),
      ],
      positions: [
        {
          institutionId: "i1",
          status: "COMPLETE",
          netWorth: "-8549.27",
          totalAssets: "0",
          totalLiabilities: "8549.27",
          byCurrency: [
            {
              currency: "DOP",
              assets: "0",
              available: "0",
              receivables: "0",
              liabilities: "8549.27",
              netWorth: "-8549.27",
            },
          ],
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
      assert.deepEqual(items[0].currencyTotals, [
        {
          currency: "DOP",
          assets: "0",
          available: "0",
          receivables: "0",
          liabilities: "8549.27",
          netWorth: "-8549.27",
        },
      ])
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
          totalAssets: "0",
          totalLiabilities: null,
          issues: [
            { code: "MISSING_CREDIT_LIMIT", cardId: "c1", currency: "DOP" },
          ],
        },
      ],
    })
    assert.equal(items[0]?.kind, "institution")
    if (items[0]?.kind !== "institution") {
      return
    }
    assert.equal(
      formatStackItemBalance(items[0], display),
      "Balance incompleto"
    )
  })
})

describe("cash institution balance", () => {
  const cashInstitution: FinanceInstitution = {
    id: "cash",
    name: "Efectivo",
    type: "cash",
    color: null,
    logoUrl: null,
    country: "DO",
    isActive: true,
    isSystem: true,
  }

  it("uses the converted cash total for the Efectivo card", () => {
    const items = buildInstitutionStackItems({
      institutions: [cashInstitution],
      accounts: [
        account({
          id: "c1",
          name: "Efectivo",
          institutionId: "cash",
          type: "CASH",
        }),
      ],
      cards: [],
      loans: [],
      cash: {
        totalBase: "1600",
        baseCurrency: "DOP",
        rateDate: "2026-10-15",
        status: "COMPLETE",
        byCurrency: [],
      },
    })

    assert.equal(formatStackItemBalance(items[0]!, display), "DOP $1,600")
  })

  it("falls back to Balance incompleto when the cash total has no rate", () => {
    const items = buildInstitutionStackItems({
      institutions: [cashInstitution],
      accounts: [],
      cards: [],
      loans: [],
      cash: {
        totalBase: null,
        baseCurrency: "DOP",
        rateDate: "2026-10-15",
        status: "INCOMPLETE",
        byCurrency: [],
      },
    })

    assert.equal(
      formatStackItemBalance(items[0]!, display),
      "Balance incompleto"
    )
  })

  it("marks an institution with an open drift and a pending reconciliation", () => {
    const items = buildInstitutionStackItems({
      institutions: [
        {
          id: "i1",
          name: "Banco Popular",
          color: "#1B4332",
          logoUrl: null,
          country: "DO",
          isActive: true,
        },
      ],
      accounts: [account({ id: "a1", name: "Ahorros", institutionId: "i1" })],
      cards: [card({ id: "c1", name: "Visa", institutionId: "i1" })],
      loans: [],
      positions: [
        {
          institutionId: "i1",
          status: "COMPLETE",
          netWorth: "0",
          totalAssets: "0",
          totalLiabilities: "0",
          issues: [],
        },
      ],
      drifts: [
        {
          id: "drift-1",
          accountId: "a1",
          cardId: null,
          currency: "DOP",
          name: "Ahorros",
          storedBalance: "100",
          expectedBalance: "90",
          difference: "-10",
          detectedAt: "2026-10-20T04:00:00.000Z",
          resolvedAt: null,
        },
      ],
      reconciliationItems: [
        {
          key: "card:c1:DOP",
          kind: "card",
          accountId: null,
          cardId: "c1",
          currency: "DOP",
          name: "Visa",
          institutionName: "Banco Popular",
          balance: "0",
          reconciled: false,
          lastReconciledAt: null,
        },
      ],
    })

    const bank = items.find((item) => item.kind === "institution")
    assert.equal(bank?.irregularities.drift, true)
    assert.equal(bank?.irregularities.reconciliation, true)
  })

  it("marks a cash card only when its own account has an irregularity", () => {
    const items = buildInstitutionStackItems({
      institutions: [],
      accounts: [account({ id: "cash-1", name: "Efectivo", type: "CASH" })],
      cards: [],
      loans: [],
      drifts: [],
      reconciliationItems: [
        {
          key: "account:cash-1:DOP",
          kind: "account",
          accountId: "cash-1",
          cardId: null,
          currency: "DOP",
          name: "Efectivo",
          institutionName: null,
          balance: "0",
          reconciled: false,
          lastReconciledAt: null,
        },
      ],
    })

    const cash = items.find((item) => item.kind === "cash")
    assert.equal(cash?.irregularities.drift, false)
    assert.equal(cash?.irregularities.reconciliation, true)
  })
})
