"use client"

import {
  BrandLogo,
  CardNetworkMark,
} from "@/src/modules/finance/components/brand-logo"
import { buildLedgerTargetOptions, splitLedgerTarget } from "@/src/modules/finance/lib/ledger-payloads"
import type { FinanceAccount, FinanceCard } from "@/src/modules/finance/types/entities"
import type { ReactNode } from "react"

export type LabeledOption = {
  value: string
  label: string
  mark?: ReactNode
}

export function ledgerTargetSelectOptions(
  accounts: FinanceAccount[],
  cards: FinanceCard[],
): LabeledOption[] {
  const accountsById = new Map(accounts.map((account) => [account.id, account]))
  const cardsById = new Map(cards.map((card) => [card.id, card]))
  return buildLedgerTargetOptions(accounts, cards).map((option) => {
    const target = splitLedgerTarget(option.value)
    if (target.accountId) {
      const account = accountsById.get(target.accountId)
      return {
        ...option,
        mark: (
          <BrandLogo
            name={account?.institutionName ?? account?.name ?? option.label}
            logoUrl={account?.institutionLogoUrl}
            size={20}
          />
        ),
      }
    }
    if (target.cardId) {
      const card = cardsById.get(target.cardId)
      return {
        ...option,
        mark: (
          <span className="inline-flex items-center gap-1">
            <BrandLogo
              name={card?.institutionName ?? card?.name ?? option.label}
              logoUrl={card?.institutionLogoUrl}
              size={20}
            />
            <CardNetworkMark
              network={card?.network}
              logoUrl={card?.networkLogoUrl}
              size={20}
            />
          </span>
        ),
      }
    }
    return option
  })
}

export function institutionSelectOptions(
  institutions: { id: string; name: string; logoUrl?: string | null }[],
  empty?: { value: string; label: string },
): LabeledOption[] {
  return [
    ...(empty ? [empty] : []),
    ...institutions.map((item) => ({
      value: item.id,
      label: item.name,
      mark: <BrandLogo name={item.name} logoUrl={item.logoUrl} size={20} />,
    })),
  ]
}

export function accountSelectOptions(
  accounts: FinanceAccount[],
  empty?: { value: string; label: string },
): LabeledOption[] {
  return [
    ...(empty ? [empty] : []),
    ...accounts.map((account) => ({
      value: account.id,
      label: account.name,
      mark: (
        <BrandLogo
          name={account.institutionName ?? account.name}
          logoUrl={account.institutionLogoUrl}
          size={20}
        />
      ),
    })),
  ]
}
