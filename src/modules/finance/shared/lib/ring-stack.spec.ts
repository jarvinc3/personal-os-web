import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceAccount, FinanceInstitution } from "../types/entities.ts"
import type { InstitutionStackItem } from "./institution-stack.ts"
import type { FinanceMoneyDisplay } from "./money.ts"
import {
  CASH_RING_KEY,
  CASH_RING_NAME,
  buildRingStackSlices,
} from "./ring-stack.ts"

const display: FinanceMoneyDisplay = {
  currency: "DOP",
  showCents: false,
  compactNumbers: false,
}

function institutionItem(partial: {
  id: string
  name: string
  netWorth: string | null
  totalAssets?: string
  totalLiabilities?: string | null
  color?: string | null
  logoUrl?: string | null
}): Extract<InstitutionStackItem, { kind: "institution" }> {
  const institution: FinanceInstitution = {
    id: partial.id,
    name: partial.name,
    color: partial.color ?? null,
    logoUrl: partial.logoUrl ?? null,
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
    totalAssets: partial.totalAssets ?? "0",
    totalLiabilities: partial.totalLiabilities ?? null,
    issues: [],
    accounts: [],
    cards: [],
    loans: [],
  }
}

function cashItem(partial: {
  id: string
  name: string
  balance: string
}): Extract<InstitutionStackItem, { kind: "cash" }> {
  const account: FinanceAccount = {
    id: partial.id,
    institutionId: null,
    institutionName: null,
    name: partial.name,
    type: "CASH",
    currency: "DOP",
    accountNumber: null,
    balance: partial.balance,
    color: null,
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

describe("buildRingStackSlices", () => {
  it("orders rings by gross size and gathers every cash account", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Banco A",
          netWorth: "100",
          totalAssets: "100",
          color: "#111",
        }),
        cashItem({ id: "c1", name: "Billetera", balance: "200" }),
        cashItem({ id: "c2", name: "Alcancía", balance: "100" }),
        institutionItem({
          id: "b",
          name: "Banco B",
          netWorth: "-100",
          totalAssets: "0",
          totalLiabilities: "100",
          color: "#333",
        }),
      ],
      display
    )

    assert.deepEqual(
      slices.map((slice) => slice.name),
      [CASH_RING_NAME, "Banco A", "Banco B"]
    )
    assert.equal(slices[0]?.key, CASH_RING_KEY)
    assert.equal(slices[0]?.kind, "cash")
    assert.equal(slices[0]?.signedValue, 300)
    assert.equal(slices[0]?.percent, 60)
    assert.equal(slices[0]?.percentLabel, "60%")
    assert.match(slices[0]?.amountLabel ?? "", /300/)
    assert.equal(slices[1]?.percent, 20)
    assert.equal(slices[2]?.signedValue, -100)
    assert.equal(slices[2]?.value, 100)
  })

  it("sums cash balances as decimals", () => {
    const slices = buildRingStackSlices(
      [
        cashItem({ id: "c1", name: "Billetera", balance: "0.10" }),
        cashItem({ id: "c2", name: "Alcancía", balance: "0.20" }),
      ],
      display
    )

    assert.equal(slices[0]?.signedValue, 0.3)
    assert.equal(slices[0]?.percent, 100)
  })

  it("draws the debt as the pale part of the same arc", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Banco A",
          netWorth: "50",
          totalAssets: "100",
          totalLiabilities: "50",
        }),
      ],
      display
    )

    assert.equal(slices[0]?.value, 150)
    assert.equal(slices[0]?.assetsValue, 100)
    assert.equal(slices[0]?.debtValue, 50)
    assert.equal(slices[0]?.signedValue, 50)
    assert.equal(slices[0]?.percent, 100)
    assert.match(slices[0]?.debtLabel ?? "", /50/)
  })

  it("leaves the debt empty when the institution owes nothing", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Banco A",
          netWorth: "100",
          totalAssets: "100",
          totalLiabilities: "0",
        }),
      ],
      display
    )

    assert.equal(slices[0]?.debtValue, 0)
    assert.equal(slices[0]?.debtLabel, null)
  })

  it("counts cash in the red as debt", () => {
    const slices = buildRingStackSlices(
      [cashItem({ id: "c", name: "Efectivo", balance: "-80" })],
      display
    )

    assert.equal(slices[0]?.signedValue, -80)
    assert.equal(slices[0]?.assetsValue, 0)
    assert.equal(slices[0]?.debtValue, 80)
    assert.match(slices[0]?.debtLabel ?? "", /80/)
  })

  it("keeps a ring at 0 % when the balance cannot be measured", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({ id: "a", name: "Sin balance", netWorth: null }),
        cashItem({ id: "c", name: "Cero", balance: "0" }),
      ],
      display
    )

    assert.deepEqual(
      slices.map((slice) => slice.percent),
      [0, 0]
    )
    assert.deepEqual(
      slices.map((slice) => slice.percentLabel),
      ["0%", "0%"]
    )
    assert.deepEqual(
      slices.map((slice) => slice.value),
      [0, 0]
    )
    assert.equal(slices[0]?.name, "Sin balance")
    assert.equal(slices[0]?.amountLabel, "Balance incompleto")
  })

  it("keeps a share below half a point visible", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Banco A",
          netWorth: "1000",
          totalAssets: "1000",
        }),
        cashItem({ id: "c", name: "Suelto", balance: "0.5" }),
      ],
      display
    )

    assert.deepEqual(
      slices.map((slice) => slice.percentLabel),
      ["100%", "<1%"]
    )
  })

  it("falls back to the chart palette when the institution has no color", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Sin color",
          netWorth: "10",
          totalAssets: "10",
        }),
      ],
      display
    )

    assert.equal(slices[0]?.color, "var(--chart-1)")
  })

  it("carries the institution logo and leaves cash without one", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Banco A",
          netWorth: "10",
          totalAssets: "10",
          logoUrl: "https://logo.test/banco-a.png",
        }),
        cashItem({ id: "c", name: "Efectivo", balance: "5" }),
      ],
      display
    )

    assert.equal(slices[0]?.logoUrl, "https://logo.test/banco-a.png")
    assert.equal(slices[1]?.logoUrl, null)
  })

  it("treats a blank logo as absent", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Banco A",
          netWorth: "10",
          totalAssets: "10",
          logoUrl: "  ",
        }),
      ],
      display
    )

    assert.equal(slices[0]?.logoUrl, null)
  })
})
