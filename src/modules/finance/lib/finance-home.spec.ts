import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  FinanceCategory,
  FinanceTransaction,
} from "../types/entities.ts";
import { deriveFrequentExpenses } from "./finance-home.ts";

function transaction(
  overrides: Partial<FinanceTransaction>,
): FinanceTransaction {
  return {
    id: "tx",
    type: "DEBIT",
    status: "CONFIRMED",
    amount: "10",
    currency: "DOP",
    ledgerAmount: "10",
    ledgerCurrency: "DOP",
    amountBaseCurrency: "10",
    exchangeRate: null,
    accountId: null,
    accountName: null,
    cardId: null,
    cardName: null,
    categoryId: null,
    merchant: null,
    notes: null,
    source: null,
    transactionDate: "2026-09-06T12:00:00.000Z",
    description: null,
    transferGroupId: null,
    transferToAccountId: null,
    transferToAccountName: null,
    transferToCardId: null,
    transferToCardName: null,
    ...overrides,
  }
}

describe("deriveFrequentExpenses", () => {
  it("ranks confirmed expenses and exposes category presentation", () => {
    const categories: FinanceCategory[] = [
      {
        id: "food",
        name: "Comida",
        icon: "🍽️",
        color: "#ff0000",
        parentId: null,
        isSystem: false,
      },
    ]
    const result = deriveFrequentExpenses(
      [
        transaction({ id: "1", merchant: "Mercado", categoryId: "food" }),
        transaction({ id: "2", merchant: "Mercado", categoryId: "food" }),
        transaction({ id: "3", merchant: "Café" }),
        transaction({
          id: "4",
          merchant: "Mercado",
          status: "PENDING",
        }),
        transaction({ id: "5", merchant: "Nómina", type: "CREDIT" }),
        transaction({
          id: "6",
          merchant: "Transferencia",
          type: "TRANSFER",
          transferGroupId: "grp-1",
        }),
        transaction({
          id: "7",
          merchant: "Piernas",
          type: "DEBIT",
          transferGroupId: "grp-2",
        }),
      ],
      categories,
    )

    assert.deepEqual(result, [
      {
        key: "mercado",
        label: "Mercado",
        categoryName: "Comida",
        initials: "ME",
        color: "#ff0000",
        icon: "🍽️",
        count: 2,
      },
      {
        key: "café",
        label: "Café",
        categoryName: "Sin categoría",
        initials: "CA",
        color: "#64748B",
        icon: undefined,
        count: 1,
      },
    ])
  })
})
