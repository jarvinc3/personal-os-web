import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { FinanceAccount, FinanceInstitution } from "../types/entities.ts";
import { mapStackItemsToDonutSlices } from "./donut-stack.ts";
import type { InstitutionStackItem } from "./institution-stack.ts";

function institutionItem(
  partial: {
    id: string
    name: string
    netWorth: string | null
    color?: string | null
  },
): Extract<InstitutionStackItem, { kind: "institution" }> {
  const institution: FinanceInstitution = {
    id: partial.id,
    name: partial.name,
    color: partial.color ?? null,
    logoUrl: null,
    country: null,
    isActive: true,
  }
  return {
    kind: "institution",
    id: partial.id,
    institution,
    counts: { accounts: 1, cards: 0, loans: 0 },
    status: partial.netWorth === null ? "INCOMPLETE" : "COMPLETE",
    netWorth: partial.netWorth,
    issues: [],
    accounts: [],
    cards: [],
    loans: [],
  }
}

function cashItem(
  partial: {
    id: string
    name: string
    balance: string
    color?: string | null
  },
): Extract<InstitutionStackItem, { kind: "cash" }> {
  const account: FinanceAccount = {
    id: partial.id,
    institutionId: null,
    institutionName: null,
    name: partial.name,
    type: "CASH",
    currency: "DOP",
    accountNumber: null,
    balance: partial.balance,
    color: partial.color ?? null,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  }
  return {
    kind: "cash",
    id: partial.id,
    account,
    balance: partial.balance,
  }
}

describe("mapStackItemsToDonutSlices", () => {
  it("builds institution + cash slices from absolute balances", () => {
    const slices = mapStackItemsToDonutSlices([
      institutionItem({ id: "a", name: "Banco A", netWorth: "100", color: "#111" }),
      cashItem({ id: "c", name: "Efectivo", balance: "300", color: "#222" }),
      institutionItem({ id: "b", name: "Banco B", netWorth: "-100", color: "#333" }),
    ])

    assert.equal(slices.length, 3)
    assert.equal(slices[0]?.kind, "institution")
    assert.equal(slices[0]?.percent, 20)
    assert.equal(slices[1]?.kind, "cash")
    assert.equal(slices[1]?.percent, 60)
    assert.equal(slices[2]?.signedValue, -100)
    assert.equal(slices[2]?.value, 100)
  })

  it("skips incomplete institutions and zero balances", () => {
    const slices = mapStackItemsToDonutSlices([
      institutionItem({ id: "a", name: "Sin balance", netWorth: null }),
      cashItem({ id: "c", name: "Cero", balance: "0" }),
      cashItem({ id: "d", name: "Ok", balance: "50" }),
    ])
    assert.equal(slices.length, 1)
    assert.equal(slices[0]?.name, "Ok")
    assert.equal(slices[0]?.kind, "cash")
    assert.equal(slices[0]?.percent, 100)
  })
})
