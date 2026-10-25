"use client"

import {
  MONEY_SIGN_TONE,
  moneySign,
  signedFinanceMoney,
  type FinanceMoneyDisplay,
  type MoneySign,
} from "@/src/modules/finance/shared/lib/money"
import { cn } from "@/src/shared/lib/utils"

type MoneyProps = {
  value: string | number | null | undefined
  display: FinanceMoneyDisplay
  /** `auto` colors by sign: success in, destructive out, neutral at zero. */
  tone?: "auto" | "none"
  /** Draws `+` or `−` from the sign of the amount. */
  showSign?: boolean
  /** Sign the amount does not carry itself, e.g. a transfer read from a card. */
  sign?: MoneySign
  className?: string
}

/** The one amount of the app: format, sign and color in a single place. */
export function Money({
  value,
  display,
  tone = "none",
  showSign = false,
  sign,
  className,
}: MoneyProps) {
  const resolvedSign = sign ?? (showSign ? moneySign(value) : null)
  const toneClass =
    tone === "auto" && resolvedSign ? MONEY_SIGN_TONE[resolvedSign] : null
  return (
    <span className={cn("tabular-nums", toneClass, className)}>
      {signedFinanceMoney(value, display, resolvedSign)}
    </span>
  )
}
