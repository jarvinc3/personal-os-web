import assert from "node:assert/strict"
import { describe, it } from "node:test"

import type { FinanceAccount, FinanceInstitution } from "../types/entities.ts"
import type { InstitutionStackItem } from "./institution-stack.ts"
import type { FinanceMoneyDisplay } from "./money.ts"
import {
  CASH_RING_KEY,
  CASH_RING_NAME,
  buildRingStackSlices,
  hasDrawableRingBalance,
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
    cash: null,
    currencyTotals: [],
    irregularities: { drift: false, reconciliation: false },
  }
}

function cashItem(partial: {
  id: string
  name: string
  balance: string
  currency?: string
}): Extract<InstitutionStackItem, { kind: "cash" }> {
  const account: FinanceAccount = {
    id: partial.id,
    institutionId: null,
    institutionName: null,
    name: partial.name,
    type: "CASH",
    currency: partial.currency ?? "DOP",
    accountNumberLast4: null,
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
    currencyTotals: [],
    irregularities: { drift: false, reconciliation: false },
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
    assert.equal(slices[0]?.assetsPercent, 75)
    assert.equal(slices[0]?.percentLabel, "75%")
    assert.match(slices[0]?.amountLabel ?? "", /300/)
    assert.equal(slices[1]?.percent, 20)
    assert.equal(slices[1]?.assetsPercent, 25)
    assert.equal(slices[2]?.signedValue, -100)
    assert.equal(slices[2]?.value, 100)
    assert.equal(slices[2]?.debtPercent, 100)
    assert.equal(slices[2]?.percentLabel, "100% deuda")
  })

  it("calculates each group over its own total", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Banco A",
          netWorth: "100",
          totalAssets: "100",
          totalLiabilities: "0",
        }),
        institutionItem({
          id: "b",
          name: "Banco B",
          netWorth: "-300",
          totalAssets: "0",
          totalLiabilities: "300",
        }),
        institutionItem({
          id: "c",
          name: "Banco C",
          netWorth: "200",
          totalAssets: "300",
          totalLiabilities: "100",
        }),
      ],
      display
    )

    const totalAssets = slices.reduce(
      (sum, slice) => sum + slice.assetsPercent,
      0
    )
    const totalDebt = slices.reduce((sum, slice) => sum + slice.debtPercent, 0)
    const first = slices.find((slice) => slice.name === "Banco A")
    const second = slices.find((slice) => slice.name === "Banco B")
    const third = slices.find((slice) => slice.name === "Banco C")

    assert.equal(totalAssets, 100)
    assert.equal(totalDebt, 100)
    assert.equal(first?.assetsPercent, 25)
    assert.equal(second?.debtPercent, 75)
    assert.equal(third?.assetsPercent, 75)
    assert.equal(third?.debtPercent, 25)
    assert.equal(third?.percentLabel, "75% activos · 25% deuda")
  })

  it("moves a negative asset balance to the debt group", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Banco A",
          netWorth: "-50",
          totalAssets: "-50",
          totalLiabilities: "0",
        }),
      ],
      display
    )

    assert.equal(slices[0]?.assetsValue, 0)
    assert.equal(slices[0]?.debtValue, 50)
    assert.equal(slices[0]?.assetsPercent, 0)
    assert.equal(slices[0]?.debtPercent, 100)
    assert.equal(slices[0]?.percentLabel, "100% deuda")
  })

  it("keeps every share between 0 and 100 with negative balances", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Banco A",
          netWorth: "-80",
          totalAssets: "0",
          totalLiabilities: "80",
        }),
        institutionItem({
          id: "b",
          name: "Banco B",
          netWorth: "-20",
          totalAssets: "0",
          totalLiabilities: "20",
        }),
      ],
      display
    )

    for (const slice of slices) {
      assert.ok(slice.assetsPercent >= 0 && slice.assetsPercent <= 100)
      assert.ok(slice.debtPercent >= 0 && slice.debtPercent <= 100)
      assert.ok(slice.percent >= 0 && slice.percent <= 100)
    }
    assert.deepEqual(
      slices.map((slice) => slice.debtPercent),
      [80, 20]
    )
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

  it("leaves the cash ring unmeasured when the currencies differ", () => {
    const slices = buildRingStackSlices(
      [
        cashItem({
          id: "c1",
          name: "Billetera",
          balance: "100",
          currency: "DOP",
        }),
        cashItem({
          id: "c2",
          name: "Cuenta USD",
          balance: "50",
          currency: "USD",
        }),
      ],
      display
    )

    assert.equal(slices[0]?.amountLabel, "Balance incompleto")
    assert.equal(slices[0]?.signedValue, 0)
    assert.equal(slices[0]?.percent, 0)
  })

  it("leaves the cash ring unmeasured when the cash is not in the base currency", () => {
    const slices = buildRingStackSlices(
      [
        cashItem({
          id: "c",
          name: "Cuenta USD",
          balance: "50",
          currency: "USD",
        }),
      ],
      display
    )

    assert.equal(slices[0]?.amountLabel, "Balance incompleto")
    assert.equal(slices[0]?.signedValue, 0)
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
    assert.equal(slices[0]?.assetsPercent, 100)
    assert.equal(slices[0]?.debtPercent, 100)
    assert.equal(slices[0]?.percentLabel, "100% activos · 100% deuda")
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
    assert.equal(slices[0]?.assetsPercent, 0)
    assert.equal(slices[0]?.debtPercent, 100)
    assert.equal(slices[0]?.percentLabel, "100% deuda")
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

describe("hasDrawableRingBalance", () => {
  it("is false when every ring is zero or unmeasured", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({ id: "a", name: "Sin balance", netWorth: null }),
        cashItem({ id: "c", name: "Cero", balance: "0" }),
      ],
      display
    )

    assert.equal(hasDrawableRingBalance(slices), false)
  })

  it("is true when any ring has assets or debt", () => {
    const slices = buildRingStackSlices(
      [
        institutionItem({
          id: "a",
          name: "Banco A",
          netWorth: "-10",
          totalAssets: "0",
          totalLiabilities: "10",
        }),
      ],
      display
    )

    assert.equal(hasDrawableRingBalance(slices), true)
  })
})

function cashInstitutionItem(totalBase: string) {
  return {
    ...institutionItem({ id: "cash", name: "Efectivo", netWorth: null }),
    institution: {
      id: "cash",
      name: "Efectivo",
      type: "cash" as const,
      color: null,
      logoUrl: null,
      country: "DO",
      isActive: true,
      isSystem: true,
    },
    cash: {
      totalBase,
      baseCurrency: "DOP",
      rateDate: "2026-10-15",
      status: "COMPLETE" as const,
      byCurrency: [],
    },
  }
}

describe("cash institution ring", () => {
  it("sizes the Efectivo ring from the converted cash total", () => {
    const slices = buildRingStackSlices([cashInstitutionItem("1600")], display)
    const slice = slices.find((entry) => entry.key === "institution-cash")

    assert.equal(slice?.assetsValue, 1600)
    assert.equal(slice?.percent, 100)
    assert.equal(slice?.amountLabel, "DOP $1,600")
  })

  it("moves a negative Efectivo total to the debt group", () => {
    const slices = buildRingStackSlices([cashInstitutionItem("-1600")], display)
    const slice = slices.find((entry) => entry.key === "institution-cash")

    assert.equal(slice?.signedValue, -1600)
    assert.equal(slice?.assetsValue, 0)
    assert.equal(slice?.debtValue, 1600)
    assert.equal(slice?.debtPercent, 100)
    assert.equal(slice?.percentLabel, "100% deuda")
  })
})
