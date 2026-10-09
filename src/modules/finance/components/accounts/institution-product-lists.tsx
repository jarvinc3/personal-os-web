"use client"

import { BrandLogo, CardNetworkMark } from "@/src/modules/finance/components/brand-logo";
import {
  FINANCE_ACCOUNT_TYPE_LABEL,
  FINANCE_CARD_TYPE_LABEL,
} from "@/src/modules/finance/constants/catalog";
import { resolveCardDisplayBalances } from "@/src/modules/finance/lib/card-balances";
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import type {
  FinanceAccount,
  FinanceCard,
} from "@/src/modules/finance/types/entities";
import { Button } from "@/src/shared/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty";
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils";
import {
  ChevronRightIcon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  PlusIcon,
} from "lucide-react";

type AccountProductRowProps = {
  account: FinanceAccount
  display: FinanceMoneyDisplay
  onPress: () => void
}

export function AccountProductRow({
  account,
  display,
  onPress,
}: AccountProductRowProps) {
  const lastFour = account.accountNumber?.replace(/\D/g, "").slice(-4)
  const subtitle = lastFour
    ? `${FINANCE_ACCOUNT_TYPE_LABEL[account.type]} · •••• ${lastFour}`
    : `${FINANCE_ACCOUNT_TYPE_LABEL[account.type]} · ${account.currency}`
  const tint = account.color
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-2 pl-4 text-left",
        tint
          ? "border-transparent bg-card"
          : "border-border bg-card",
        PRESSABLE_CLASS
      )}
      style={
        tint
          ? {
            borderColor: `color-mix(in srgb, ${tint} 0%, var(--border))`,
          }
          : undefined
      }
    >
      {tint && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-35 transition-opacity group-hover:opacity-50"
          style={{ backgroundColor: tint }}
        />
      )}

      <BrandLogo
        name={account.institutionName ?? account.name}
        logoUrl={account.institutionLogoUrl}
        size={44}
        className="relative z-10"
      />

      <div className="relative z-10 flex flex-col gap-1 flex-2">
        <div className="flex flex-col">
          <p className="font-semibold truncate text-foreground">{account.name}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <p className="relative z-10 font-semibold tabular-nums shrink-0 text-foreground">
          {formatFinanceMoney(account.balance, {
            ...display,
            currency: account.currency,
          })}
        </p>
      </div>

      <ChevronRightIcon className="absolute right-0 top-1/2 -translate-y-1/2 size-8 text-muted-foreground group-hover:text-foreground" />
    </button>
  )
}

type CardProductRowProps = {
  card: FinanceCard
  accounts: readonly FinanceAccount[]
  display: FinanceMoneyDisplay
  onPress: () => void
}

export function CardProductRow({
  card,
  accounts,
  display,
  onPress,
}: CardProductRowProps) {
  const balances = resolveCardDisplayBalances(card, accounts)

  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "relative flex w-full flex-col gap-4 overflow-hidden rounded-2xl bg-zinc-900 p-4 text-left text-white hover:opacity-95",
        PRESSABLE_CLASS
      )}
      style={card.color ? { backgroundColor: card.color } : undefined}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0">
        <span className="absolute top-[-45%] right-[-12%] h-[190%] w-[38%] rotate-22 bg-black/20" />
        <span className="absolute bottom-[-55%] left-[-18%] h-28 w-[62%] -rotate-6 rounded-4xl bg-white/10" />
      </span>

      <div className="relative z-10 flex gap-3 justify-between items-center">
        <p className="text-sm truncate text-white font-semibold">
          {card.name}
        </p>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
          {FINANCE_CARD_TYPE_LABEL[card.type]}
        </span>
      </div>

      <div className="relative z-10 flex min-w-0 flex-col">
        <p className="text-[10px] tracking-[0.14em] text-white/55 uppercase">
          {card.type === "CREDIT" ? "Balance disponible" : "Saldo actual"}
        </p>
        {balances.length === 0 ? (
          <p className="text-xl font-bold tabular-nums">Sin saldo</p>
        ) : (
          balances.map((item) => (
            <p key={item.id} className="text-xl font-bold tabular-nums">
              {formatFinanceMoney(item.balance, {
                ...display,
                currency: item.currency,
              })}
            </p>
          ))
        )}
      </div>

      <div className="relative z-10 flex gap-3 justify-between items-end">
        <p className="tracking-[0.2em] text-white/80">
          •••• {card.lastFour ?? "····"}
        </p>
        <span className="inline-flex items-center gap-1">
          <BrandLogo
            name={card.institutionName}
            logoUrl={card.institutionLogoUrl}
            size={28}
          />
          <CardNetworkMark
            network={card.network}
            logoUrl={card.networkLogoUrl}
            size={28}
          />
        </span>
      </div>

      <ChevronRightIcon className="absolute right-0 top-1/2 -translate-y-1/2 size-8 text-muted-foreground group-hover:text-foreground" />
    </button>
  )
}

type ProductEmptyProps = {
  tab: "accounts" | "cards" | "loans"
  onCreate: () => void
}

export function InstitutionProductEmpty({ tab, onCreate }: ProductEmptyProps) {
  if (tab === "loans") {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HandCoinsIcon />
          </EmptyMedia>
          <EmptyTitle>Sin préstamos</EmptyTitle>
          <EmptyDescription>
            Registra un préstamo para seguir sus cuotas.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onCreate}>
            <PlusIcon />
            Préstamo
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (tab === "cards") {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CreditCardIcon />
          </EmptyMedia>
          <EmptyTitle>Sin tarjetas</EmptyTitle>
          <EmptyDescription>
            Agrega una tarjeta de crédito o débito de esta institución.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={onCreate}>
            <PlusIcon />
            Tarjeta
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Empty className="py-10">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LandmarkIcon />
        </EmptyMedia>
        <EmptyTitle>Sin cuentas</EmptyTitle>
        <EmptyDescription>
          Crea la primera cuenta de esta institución.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={onCreate}>
          <PlusIcon />
          Cuenta
        </Button>
      </EmptyContent>
    </Empty>
  )
}
