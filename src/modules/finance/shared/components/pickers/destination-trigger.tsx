"use client"

import {
  AccountProductRow,
  CardProductRow,
} from "@/src/modules/finance/shared/components/product-rows"
import { splitLedgerTarget } from "@/src/modules/finance/shared/lib/ledger-payloads"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
} from "@/src/modules/finance/shared/types/entities"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { ChevronDownIcon, WalletIcon } from "lucide-react"

type DestinationTriggerProps = {
  destination: string
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  display: FinanceMoneyDisplay
  disabled?: boolean
  placeholder?: string
  onClick: () => void
}

export function DestinationTrigger({
  destination,
  accounts,
  cards,
  display,
  disabled,
  placeholder = "Elige cuenta o tarjeta",
  onClick,
}: DestinationTriggerProps) {
  const target = splitLedgerTarget(destination)
  const account = accounts.find((item) => item.id === target.accountId)
  const card = cards.find((item) => item.id === target.cardId)

  if (card) {
    return (
      <div className={cn(disabled && "pointer-events-none opacity-50")}>
        <CardProductRow
          card={card}
          accounts={accounts}
          display={display}
          onPress={onClick}
        />
      </div>
    )
  }

  if (account) {
    return (
      <div className={cn(disabled && "pointer-events-none opacity-50")}>
        <AccountProductRow
          account={account}
          display={display}
          onPress={onClick}
        />
      </div>
    )
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex h-14 w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 text-left disabled:opacity-50",
        PRESSABLE_CLASS
      )}
      onClick={onClick}
    >
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {placeholder}
      </span>
      <WalletIcon className="size-4 text-muted-foreground" />
      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}
