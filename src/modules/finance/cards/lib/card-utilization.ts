export type CardUtilization = {
  /** What the card owes, including anything above the limit. */
  debt: number
  /** Debt over the limit; above 100% when the card is overspent. */
  utilizationPct: number
  /** How much the debt exceeds the limit, zero when it does not. */
  overdraft: number
}

/**
 * A negative available credit means the card owes more than its limit, so the
 * debt grows and the utilization goes past 100% instead of stopping there.
 */
export function cardUtilization(input: {
  available: number
  creditLimit: number
}): CardUtilization | null {
  const { available, creditLimit } = input
  if (creditLimit <= 0) {
    return null
  }
  const debt = Math.max(0, creditLimit - available)
  return {
    debt,
    utilizationPct: (debt / creditLimit) * 100,
    overdraft: Math.max(0, -available),
  }
}
