"use client"

import {
  FINANCE_ACCOUNT_TYPE_LABEL,
  FINANCE_CARD_NETWORK_LABEL,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";
import {
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  PiggyBankIcon,
  PlusIcon,
} from "lucide-react";

export type InstitutionDetailTab = "accounts" | "cards" | "loans"

type InstitutionDetailTabsProps = {
  value: InstitutionDetailTab
  onChange: (tab: InstitutionDetailTab) => void
  accentColor?: string
}

export function InstitutionDetailTabs({
  value,
  onChange,
}: InstitutionDetailTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => {
        if (next === "accounts" || next === "cards" || next === "loans") {
          onChange(next)
        }
      }}
      className="w-full gap-0"
    >
      <TabsList className="h-auto w-full rounded-2xl p-1" variant="default">
        <TabsTrigger value="accounts" className="rounded-xl px-3 py-2">
          Cuentas
        </TabsTrigger>
        <TabsTrigger value="cards" className="rounded-xl px-3 py-2">
          Tarjetas
        </TabsTrigger>
        <TabsTrigger value="loans" className="rounded-xl px-3 py-2">
          Préstamos
        </TabsTrigger>
      </TabsList>
      {/* Panels are rendered by the parent for layout control */}
      <TabsContent value="accounts" className="hidden" />
      <TabsContent value="cards" className="hidden" />
      <TabsContent value="loans" className="hidden" />
    </Tabs>
  )
}

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
  const Icon = account.type === "SAVINGS" ? PiggyBankIcon : LandmarkIcon
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
        <Icon className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{account.name}</p>
        <p className="text-sm text-muted-foreground">
          {FINANCE_ACCOUNT_TYPE_LABEL[account.type]} · {account.currency}
        </p>
      </div>
      <p className="shrink-0 font-semibold tabular-nums text-foreground">
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
  const primary = card.balances[0]
  const amount = primary
    ? formatFinanceMoney(primary.balance, {
      ...display,
      currency: primary.currency,
    })
    : "Sin saldo"
  const network = card.network
    ? FINANCE_CARD_NETWORK_LABEL[card.network]
    : null

  return (
    <button
      type="button"
      onClick={onPress}
      className="flex w-full flex-col gap-4 rounded-2xl bg-zinc-900 p-4 text-left text-white transition-opacity hover:opacity-95"
      style={card.color ? { backgroundColor: card.color } : undefined}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold tracking-wide">
          {network?.toUpperCase() ?? "TARJETA"}
        </span>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium">
          {FINANCE_CARD_TYPE_LABEL[card.type]}
        </span>
      </div>
      <p className="text-lg tracking-[0.2em] text-white/80">
        •••• {card.lastFour ?? "····"}
      </p>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-white/55">
            Balance
          </p>
          <p className="text-xl font-bold tabular-nums">{amount}</p>
        </div>
        <p className="truncate text-sm text-white/75">{card.name}</p>
      </div>
    </button>
  )
}

type LoanProductRowProps = {
  loan: FinanceLoan
  display: FinanceMoneyDisplay
  onPress: () => void
}

export function LoanProductRow({
  loan,
  display,
  onPress,
}: LoanProductRowProps) {
  return (
    <button
      type="button"
      onClick={onPress}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-muted">
        <HandCoinsIcon className="size-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{loan.lenderName}</p>
        <p className="text-sm text-muted-foreground">
          {loan.paidInstallments}/{loan.totalInstallments} cuotas
        </p>
      </div>
      <p className="shrink-0 font-semibold tabular-nums text-foreground">
        {formatFinanceMoney(loan.currentBalance, {
          ...display,
          currency: loan.currency,
        })}
      </p>
    </button>
  )
}

type ProductEmptyProps = {
  tab: InstitutionDetailTab
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
