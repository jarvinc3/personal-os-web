import type { FinanceMoneyDisplay } from "@/src/modules/finance"

const DEFAULT_CURRENCY = "DOP"

/** Blocks carry their own currency; cents stay visible in the chat. */
export function chatMoneyDisplay(
  currency: string | null | undefined
): FinanceMoneyDisplay {
  return {
    currency: (currency ?? DEFAULT_CURRENCY).toUpperCase(),
    showCents: true,
    compactNumbers: false,
  }
}
