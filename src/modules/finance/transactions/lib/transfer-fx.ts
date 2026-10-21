import { parseFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type { FinanceTransaction } from "@/src/modules/finance/shared/types/entities"

/** Pair rate from two display quotes that share the same base currency. */
export function crossExchangeRate(input: {
  sourceRate: string | null | undefined
  destinationRate: string | null | undefined
}): number | null {
  const source = parseFinanceMoney(input.sourceRate)
  const destination = parseFinanceMoney(input.destinationRate)
  if (source === null || destination === null || destination === 0) {
    return null
  }
  return source / destination
}

/** Amount that enters the destination account, rounded to cents. */
export function receivedFromRate(
  amount: string | number | null | undefined,
  rate: string | number | null | undefined
): number | null {
  const source = parseFinanceMoney(amount)
  const pairRate = parseFinanceMoney(rate)
  if (source === null || pairRate === null) {
    return null
  }
  return Number((source * pairRate).toFixed(2))
}

/** Editable rate keeps at most the 8 decimals the API stores. */
export function formatTransferRateInput(rate: number): string {
  return String(Number(rate.toFixed(8)))
}

export function transferRateLabel(input: {
  rate: string | number | null | undefined
  sourceCurrency: string
  destinationCurrency: string
}): string {
  const rate = parseFinanceMoney(input.rate)
  if (rate === null) {
    return "—"
  }
  const decimals = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(rate)
  return `1 ${input.sourceCurrency} = ${decimals} ${input.destinationCurrency}`
}

export type CrossCurrencyRate = {
  rate: string
  sourceCurrency: string
  destinationCurrency: string
}

/**
 * The rate a transfer used and the two currencies it crossed. `null` when the
 * transfer stayed in one currency or the API sent no rate.
 */
export function crossCurrencyRate(
  transaction: Pick<
    FinanceTransaction,
    "currency" | "transferToCurrency" | "exchangeRate"
  >
): CrossCurrencyRate | null {
  const destinationCurrency = transaction.transferToCurrency
  if (!destinationCurrency || !transaction.exchangeRate) {
    return null
  }
  if (destinationCurrency === transaction.currency) {
    return null
  }
  return {
    rate: transaction.exchangeRate,
    sourceCurrency: transaction.currency,
    destinationCurrency,
  }
}
