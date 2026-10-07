"use client"

import { BrandLogo, CardNetworkMark } from "@/src/modules/finance/components/brand-logo"
import {
  ledgerTargetLabel,
} from "@/src/modules/finance/lib/ledger-form"
import { splitLedgerTarget } from "@/src/modules/finance/lib/ledger-payloads"
import type { FinanceAccount, FinanceCard } from "@/src/modules/finance/types/entities"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { ChevronDownIcon, WalletIcon } from "lucide-react"

type DestinationTriggerProps = {
  destination: string
  accounts: FinanceAccount[]
  cards: FinanceCard[]
  disabled?: boolean
  placeholder?: string
  onClick: () => void
}

export function DestinationTrigger({
  destination,
  accounts,
  cards,
  disabled,
  placeholder = "Elige cuenta o tarjeta",
  onClick,
}: DestinationTriggerProps) {
  const label = ledgerTargetLabel(destination, accounts, cards)
  const target = splitLedgerTarget(destination)
  const account = accounts.find((item) => item.id === target.accountId)
  const card = cards.find((item) => item.id === target.cardId)
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "flex h-14 w-full items-center gap-3 rounded-2xl border border-border bg-card px-3 text-left disabled:opacity-50",
        PRESSABLE_CLASS,
      )}
      onClick={onClick}
    >
      {card ? (
        <span className="inline-flex items-center gap-1">
          <BrandLogo
            name={card.institutionName || card.name}
            logoUrl={card.institutionLogoUrl}
            size={28}
          />
          <CardNetworkMark
            network={card.network}
            logoUrl={card.networkLogoUrl}
            size={28}
          />
        </span>
      ) : (
        <BrandLogo
          name={account?.institutionName || account?.name || label || "Cuenta"}
          logoUrl={account?.institutionLogoUrl}
          size={28}
        />
      )}
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {label ?? placeholder}
      </span>
      {!label ? <WalletIcon className="size-4 text-muted-foreground" /> : null}
      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}
