"use client"

import { BrandLogo, CardNetworkMark } from "@/src/modules/finance/components/brand-logo";
import {
  FINANCE_ACCOUNT_TYPE_LABEL,
  FINANCE_CARD_TYPE_LABEL,
} from "@/src/modules/finance/constants/catalog";
import type { FinanceMoneyDisplay } from "@/src/modules/finance/lib/money";
import { formatFinanceMoney } from "@/src/modules/finance/lib/money";
import type {
  FinanceAccount,
  FinanceCard,
  FinanceLoan,
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
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "flex gap-3 items-center p-4 w-full text-left rounded-2xl border border-border bg-card hover:bg-muted/40",
        PRESSABLE_CLASS
      )}
    >
      <BrandLogo
        name={account.institutionName ?? account.name}
        logoUrl={account.institutionLogoUrl}
        size={44}
      />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate text-foreground">{account.name}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <p className="font-semibold tabular-nums shrink-0 text-foreground">
        {formatFinanceMoney(account.balance, {
          ...display,
          currency: account.currency,
        })}
      </p>
    </button>
  )
}

type CardProductRowProps = {
  card: FinanceCard
  display: FinanceMoneyDisplay
  onPress: () => void
}

export function CardProductRow({
  card,
  display,
  onPress,
}: CardProductRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "flex flex-col gap-4 p-4 w-full text-left text-white rounded-2xl bg-zinc-900 hover:opacity-95",
        PRESSABLE_CLASS
      )}
      style={card.color ? { backgroundColor: card.color } : undefined}
    >
      <div className="flex gap-3 justify-between items-center">
        <p className="text-sm truncate text-white/80">
          {card.name}
        </p>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
          {FINANCE_CARD_TYPE_LABEL[card.type]}
        </span>
      </div>
      <p className="text-lg tracking-[0.2em] text-white/80">
        •••• {card.lastFour ?? "····"}
      </p>
      <div className="flex gap-3 justify-between items-end">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.14em] text-white/55 uppercase">
            {card.type === "CREDIT" ? "Balance disponible" : "Saldo actual"}
          </p>
          {card.balances.length === 0 ? (
            <p className="text-xl font-bold tabular-nums">Sin saldo</p>
          ) : (
            card.balances.map((item) => (
              <p key={item.id} className="text-xl font-bold tabular-nums">
                {formatFinanceMoney(item.balance, {
                  ...display,
                  currency: item.currency,
                })}
              </p>
            ))
          )}
        </div>
        <span className="inline-flex items-center gap-1.5">
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
    </button>
  )
}

type LoanProductRowProps = {
  loan: FinanceLoan
  display: FinanceMoneyDisplay
  logoUrl?: string | null
  onPress: () => void
}

export function LoanProductRow({
  loan,
  display,
  logoUrl,
  onPress,
}: LoanProductRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className={cn(
        "flex gap-3 items-center p-4 w-full text-left rounded-2xl border border-border bg-card hover:bg-muted/40",
        PRESSABLE_CLASS
      )}
    >
      <BrandLogo name={loan.lenderName} logoUrl={logoUrl} size={44} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate text-foreground">
          {loan.lenderName}
        </p>
        <p className="text-sm text-muted-foreground">
          {loan.paidInstallments}/{loan.totalInstallments} cuotas
        </p>
      </div>
      <p className="font-semibold tabular-nums shrink-0 text-foreground">
        {formatFinanceMoney(loan.currentBalance, {
          ...display,
          currency: loan.currency,
        })}
      </p>
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
