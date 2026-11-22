import type { InstitutionStackItem } from "./institution-stack.ts"
import { institutionInitials } from "./institution-stack.ts"
import { decimalAmount, decimalPercent, sumDecimals } from "./decimal.ts"
import {
  formatFinanceMoney,
  parseFinanceMoney,
  type FinanceMoneyDisplay,
} from "./money.ts"
import type { FinanceBalanceSheetCurrencySlice } from "@/src/modules/finance/shared/types/entities"

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
   * What the ring is made of. Assets and debts are separate groups, so a debt
   * gets its own left half instead of shortening the assets arc.
   */
  assetsValue: number
  debtValue: number
  /** Debt amount, null when the institution owes nothing. */
  debtLabel: string | null
  /** Gross size, assets plus debt. */
  value: number
  /** Share of the gross size for summaries and labels. */
  percent: number
  /** Share of the assets group. */
  assetsPercent: number
  /** Share of the debt group. */
  debtPercent: number
  /** Legend label with the share of each group this ring belongs to. */
  percentLabel: string
}

type RingCandidate = Omit<
  RingStackSlice,
  "value" | "percent" | "assetsPercent" | "debtPercent" | "percentLabel"
>

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

function groupPercentLabel(assetsPercent: number, debtPercent: number): string {
  const hasAssets = assetsPercent > 0
  const hasDebt = debtPercent > 0
  if (hasAssets && hasDebt) {
    return `${formatPercentLabel(assetsPercent)} activos · ${formatPercentLabel(debtPercent)} deuda`
  }
  if (hasDebt) {
    return `${formatPercentLabel(debtPercent)} deuda`
  }
  return formatPercentLabel(assetsPercent)
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

/** The native amounts of one currency: the ring never converts between them. */
function nativeSlice(
  item: InstitutionStackItem,
  currency: string
): FinanceBalanceSheetCurrencySlice | null {
  const wanted = currency.trim().toUpperCase()
  return (
    item.currencyTotals.find(
      (slice) => slice.currency.trim().toUpperCase() === wanted
    ) ?? null
  )
}

/** A ring with nothing to draw: the legend still explains why it is empty. */
function unmeasuredInstitutionCandidate(
  item: Extract<InstitutionStackItem, { kind: "institution" }>,
  index: number
): RingCandidate {
  return {
    key: `institution-${item.id}`,
    kind: "institution",
    name: item.institution.name,
    monogram: institutionInitials(item.institution.name),
    logoUrl: item.institution.logoUrl?.trim() || null,
    color:
      item.institution.color?.trim() ||
      (item.cash
        ? CASH_RING_COLOR
        : FALLBACK_COLORS[index % FALLBACK_COLORS.length]!),
    signedValue: 0,
    amountLabel: UNMEASURED_BALANCE_LABEL,
    assetsValue: 0,
    debtValue: 0,
    debtLabel: null,
  }
}

type InstitutionCandidateInput = {
  item: Extract<InstitutionStackItem, { kind: "institution" }>
  index: number
  display: FinanceMoneyDisplay
  currency: string
}

function institutionCandidate({
  item,
  index,
  display,
  currency,
}: InstitutionCandidateInput): RingCandidate | null {
  const slice = nativeSlice(item, currency)
  if (slice === null) {
    // Products in other currencies have no ring here; a balance that cannot be
    // measured keeps a 0 % ring so the legend can explain it.
    return item.currencyTotals.length > 0
      ? null
      : unmeasuredInstitutionCandidate(item, index)
  }
  const moneyDisplay = { ...display, currency }
  const assetsAmount = parseFinanceMoney(slice.assets) ?? 0
  const liabilitiesAmount = parseFinanceMoney(slice.liabilities) ?? 0
  // A negative amount belongs to the opposite group.
  const assetsValue =
    Math.max(assetsAmount, 0) + Math.max(-liabilitiesAmount, 0)
  const debtValue = Math.max(-assetsAmount, 0) + Math.max(liabilitiesAmount, 0)
  const netWorth = parseFinanceMoney(slice.netWorth) ?? 0
  return {
    key: `institution-${item.id}`,
    kind: "institution",
    name: item.institution.name,
    monogram: institutionInitials(item.institution.name),
    logoUrl: item.institution.logoUrl?.trim() || null,
    color:
      item.institution.color?.trim() ||
      (item.cash
        ? CASH_RING_COLOR
        : FALLBACK_COLORS[index % FALLBACK_COLORS.length]!),
    signedValue: netWorth,
    amountLabel:
      item.status === "COMPLETE"
        ? formatFinanceMoney(netWorth, moneyDisplay)
        : UNMEASURED_BALANCE_LABEL,
    assetsValue,
    debtValue,
    debtLabel: debtLabelFor(debtValue, moneyDisplay),
  }
}

/** One ring for every loose cash account of the currency; none when it has none. */
function cashCandidate(
  items: readonly InstitutionStackItem[],
  display: FinanceMoneyDisplay,
  currency: string
): RingCandidate | null {
  const cashItems = items.filter(
    (item): item is Extract<InstitutionStackItem, { kind: "cash" }> =>
      item.kind === "cash"
  )
  const cashSlices = cashItems
    .map((item) => nativeSlice(item, currency))
    .filter(
      (slice): slice is FinanceBalanceSheetCurrencySlice => slice !== null
    )
  if (cashSlices.length === 0) {
    return null
  }
  const moneyDisplay = { ...display, currency }
  const netValue = decimalAmount(
    sumDecimals(cashSlices.map((slice) => slice.netWorth))
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
    amountLabel: formatFinanceMoney(netValue, moneyDisplay),
    assetsValue,
    debtValue,
    debtLabel: debtLabelFor(debtValue, moneyDisplay),
  }
}

/**
 * Maps wallet stack items into one ring per institution plus a single ring for
 * every orphan cash account, all in the native amounts of `currency` (the base
 * one by default): nothing is converted in the client (ADR-002). An institution
 * without products in that currency has no ring there. Assets and debts are
 * separate groups: each arc is the slice's share of its own group, so each group
 * adds up to 100 %.
 */
export function buildRingStackSlices(
  items: readonly InstitutionStackItem[],
  display: FinanceMoneyDisplay,
  currency: string = display.currency
): RingStackSlice[] {
  const institutionCandidates = items.flatMap((item, index) => {
    if (item.kind !== "institution") {
      return []
    }
    const candidate = institutionCandidate({ item, index, display, currency })
    return candidate === null ? [] : [candidate]
  })
  const cash = cashCandidate(items, display, currency)
  const candidates = cash
    ? [...institutionCandidates, cash]
    : institutionCandidates

  const totalAssets = sumDecimals(
    candidates.map((candidate) => candidate.assetsValue)
  )
  const totalDebt = sumDecimals(
    candidates.map((candidate) => candidate.debtValue)
  )
  const totalMagnitude = sumDecimals(
    candidates.map((candidate) => candidate.assetsValue + candidate.debtValue)
  )

  return candidates
    .map((candidate) => {
      const value = candidate.assetsValue + candidate.debtValue
      const assetsPercent = decimalPercent(candidate.assetsValue, totalAssets)
      const debtPercent = decimalPercent(candidate.debtValue, totalDebt)
      return {
        ...candidate,
        value,
        percent: decimalPercent(value, totalMagnitude),
        assetsPercent,
        debtPercent,
        percentLabel: groupPercentLabel(assetsPercent, debtPercent),
      }
    })
    .sort((first, second) => second.value - first.value)
}

/** True when at least one ring has something to draw. */
export function hasDrawableRingBalance(
  slices: readonly RingStackSlice[]
): boolean {
  return slices.some((slice) => slice.value > 0)
}
