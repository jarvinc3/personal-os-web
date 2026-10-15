import type { InstitutionStackItem } from "./institution-stack.ts"
import {
  formatStackItemBalance,
  institutionInitials,
} from "./institution-stack.ts"
import { decimalAmount, decimalPercent, sumDecimals } from "./decimal.ts"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "./money.ts"

const FALLBACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

/** Key of the single ring that gathers every cash account without an institution. */
export const CASH_RING_KEY = "cash-ring"

export const CASH_RING_NAME = "Efectivo"

const CASH_RING_COLOR = "#334155"

/** Shown when a ring has no comparable amount, the same label institutions use. */
const UNMEASURED_BALANCE_LABEL = "Balance incompleto"

export type RingStackSlice = {
  key: string
  kind: InstitutionStackItem["kind"]
  name: string
  monogram: string
  logoUrl: string | null
  color: string
  /** Net worth, the consolidated balance the list row shows. */
  signedValue: number
  amountLabel: string
  /**
   * What the arc is made of. The ring measures the institution's gross size,
   * so a debt grows the arc pale instead of hiding inside a solid one.
   */
  assetsValue: number
  debtValue: number
  /** Debt amount, null when the institution owes nothing. */
  debtLabel: string | null
  /** Arc length: the gross size. */
  value: number
  percent: number
  percentLabel: string
}

type RingCandidate = Omit<RingStackSlice, "value" | "percent" | "percentLabel">

/**
 * Share for the legend. A share below half a point stays visible as `<1%`
 * instead of collapsing into the same `0%` as an unmeasured balance.
 */
function formatPercentLabel(percent: number): string {
  const rounded = Math.round(percent)
  if (rounded === 0 && percent > 0) {
    return "<1%"
  }
  return `${rounded}%`
}

/** A debt of zero has no label: the ring has nothing pale to explain. */
function debtLabelFor(
  debtValue: number,
  display: FinanceMoneyDisplay
): string | null {
  if (debtValue <= 0) {
    return null
  }
  return formatFinanceMoney(debtValue, display)
}

function institutionCandidate(
  item: Extract<InstitutionStackItem, { kind: "institution" }>,
  index: number,
  display: FinanceMoneyDisplay
): RingCandidate {
  const measured = item.status === "COMPLETE"
  const assetsValue = measured ? (parseFinanceMoney(item.totalAssets) ?? 0) : 0
  const debtValue = measured
    ? (parseFinanceMoney(item.totalLiabilities) ?? 0)
    : 0
  return {
    key: `institution-${item.id}`,
    kind: "institution",
    name: item.institution.name,
    monogram: institutionInitials(item.institution.name),
    logoUrl: item.institution.logoUrl?.trim() || null,
    color:
      item.institution.color?.trim() ||
      FALLBACK_COLORS[index % FALLBACK_COLORS.length]!,
    signedValue: measured ? (parseFinanceMoney(item.netWorth) ?? 0) : 0,
    amountLabel: formatStackItemBalance(item, display),
    assetsValue,
    debtValue,
    debtLabel: debtLabelFor(debtValue, display),
  }
}

/** The ring is in the base currency; mixed cash cannot be added in the client (ADR-002). */
function cashSharesBaseCurrency(
  items: readonly Extract<InstitutionStackItem, { kind: "cash" }>[],
  display: FinanceMoneyDisplay
): boolean {
  const baseCurrency = display.currency.trim().toUpperCase()
  return items.every(
    (item) => item.account.currency.trim().toUpperCase() === baseCurrency
  )
}

function unmeasuredCashCandidate(): RingCandidate {
  return {
    key: CASH_RING_KEY,
    kind: "cash",
    name: CASH_RING_NAME,
    monogram: institutionInitials(CASH_RING_NAME),
    logoUrl: null,
    color: CASH_RING_COLOR,
    signedValue: 0,
    amountLabel: UNMEASURED_BALANCE_LABEL,
    assetsValue: 0,
    debtValue: 0,
    debtLabel: null,
  }
}

function cashCandidate(
  items: readonly InstitutionStackItem[],
  display: FinanceMoneyDisplay
): RingCandidate | null {
  const cashItems = items.filter(
    (item): item is Extract<InstitutionStackItem, { kind: "cash" }> =>
      item.kind === "cash"
  )
  if (cashItems.length === 0) {
    return null
  }
  if (!cashSharesBaseCurrency(cashItems, display)) {
    return unmeasuredCashCandidate()
  }
  const netValue = decimalAmount(
    sumDecimals(cashItems.map((item) => item.balance))
  )
  // Cash in the red is money owed, so it takes the pale side of the arc.
  const assetsValue = Math.max(netValue, 0)
  const debtValue = Math.max(-netValue, 0)
  return {
    key: CASH_RING_KEY,
    kind: "cash",
    name: CASH_RING_NAME,
    monogram: institutionInitials(CASH_RING_NAME),
    logoUrl: null,
    color: CASH_RING_COLOR,
    signedValue: netValue,
    amountLabel: formatFinanceMoney(netValue, display),
    assetsValue,
    debtValue,
    debtLabel: debtLabelFor(debtValue, display),
  }
}

/**
 * Maps wallet stack items into one ring per institution plus a single ring for
 * every orphan cash account. The arc is the institution's gross size, assets
 * plus debt, and the percent is its share of the sum of those sizes. Items
 * without a measurable balance keep their ring at 0 % instead of disappearing.
 */
export function buildRingStackSlices(
  items: readonly InstitutionStackItem[],
  display: FinanceMoneyDisplay
): RingStackSlice[] {
  const institutionCandidates = items.flatMap((item, index) =>
    item.kind === "institution"
      ? [institutionCandidate(item, index, display)]
      : []
  )
  const cash = cashCandidate(items, display)
  const candidates = cash
    ? [...institutionCandidates, cash]
    : institutionCandidates

  const totalMagnitude = sumDecimals(
    candidates.map((candidate) => candidate.assetsValue + candidate.debtValue)
  )

  return candidates
    .map((candidate) => {
      const value = candidate.assetsValue + candidate.debtValue
      const percent = decimalPercent(value, totalMagnitude)
      return {
        ...candidate,
        value,
        percent,
        percentLabel: formatPercentLabel(percent),
      }
    })
    .sort((first, second) => second.value - first.value)
}
