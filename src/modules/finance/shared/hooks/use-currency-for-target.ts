"use client"

import { currencyForTarget } from "@/src/modules/finance/shared/lib/ledger-form"
import type {
  FinanceAccount,
  FinanceCard,
} from "@/src/modules/finance/shared/types/entities"
import { useEffect, useRef } from "react"

export function useCurrencyForTarget(
  target: string,
  accounts: FinanceAccount[],
  cards: FinanceCard[],
  defaultCurrency: string,
  onCurrencyChange: (currency: string) => void,
  enabled = true
): void {
  const lastTarget = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }
    if (lastTarget.current === target) {
      return
    }
    lastTarget.current = target
    onCurrencyChange(
      currencyForTarget({
        destination: target,
        accounts,
        cards,
        fallback: defaultCurrency,
      })
    )
  }, [enabled, target, accounts, cards, defaultCurrency, onCurrencyChange])
}
