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
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  LockIcon,
  PlusIcon,
} from "lucide-react";

function InUseLock({ onLightSurface }: { onLightSurface: boolean }) {
  return (
    <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <LockIcon
        className={cn("size-7", onLightSurface ? "text-foreground" : "text-white")}
        aria-hidden
      />
      <span className="sr-only">En uso</span>
    </span>
  )
}

type AccountProductRowProps = {
  account: FinanceAccount
  display: FinanceMoneyDisplay
  onPress: () => void
  disabled?: boolean
}

export function AccountProductRow({
  account,
  display,
  onPress,
  disabled = false,
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
      disabled={disabled}
      className={cn(
        "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border p-2 pl-4 text-left",
        tint ? "border-transparent text-white" : "border-border bg-card text-foreground",
        disabled ? "cursor-not-allowed" : PRESSABLE_CLASS
      )}
      style={tint ? { backgroundColor: tint } : undefined}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          disabled && "opacity-45",
        )}
      >
        <span className="absolute -top-10 -right-8 size-28 rounded-full bg-white/25" />
        <span className="absolute -bottom-12 right-10 size-24 rounded-full bg-black/15" />
      </span>

      <BrandLogo
        name={account.institutionName ?? account.name}
        logoUrl={account.institutionLogoUrl}
        size={44}
        className={cn("relative z-10", disabled && "opacity-45")}
      />

      <div className={cn("relative z-10 flex min-w-0 flex-1 flex-col gap-1", disabled && "opacity-45")}>
        <div className="flex flex-col">
          <p className="truncate font-semibold">{account.name}</p>
          <p className={cn("text-sm", tint ? "text-white/70" : "text-muted-foreground")}>
            {subtitle}
          </p>
        </div>
        <p className="font-semibold tabular-nums">
          {formatFinanceMoney(account.balance, {
            ...display,
            currency: account.currency,
          })}
        </p>
      </div>
      {disabled ? <InUseLock onLightSurface={!tint} /> : null}
    </button>
  )
}

type CardProductRowProps = {
  card: FinanceCard
  accounts: readonly FinanceAccount[]
  display: FinanceMoneyDisplay
  onPress: () => void
  disabled?: boolean
}

export function CardProductRow({
  card,
  accounts,
  display,
  onPress,
  disabled = false,
}: CardProductRowProps) {
  const balances = resolveCardDisplayBalances(card, accounts)

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className={cn(
        "relative flex w-full flex-col gap-4 overflow-hidden rounded-2xl bg-zinc-900 p-4 text-left text-white",
        disabled ? "cursor-not-allowed" : cn("hover:opacity-95", PRESSABLE_CLASS)
      )}
      style={card.color ? { backgroundColor: card.color } : undefined}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          disabled && "opacity-45",
        )}
      >
        <span className="absolute top-[-45%] right-[-12%] h-[190%] w-[38%] rotate-22 bg-black/20" />
        <span className="absolute bottom-[-55%] left-[-18%] h-28 w-[62%] -rotate-6 rounded-4xl bg-white/15" />
      </span>

      <div className={cn("relative z-10 flex gap-3 justify-between items-center", disabled && "opacity-45")}>
        <p className="text-sm truncate text-white font-semibold">
          {card.name}
        </p>
        <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
          {FINANCE_CARD_TYPE_LABEL[card.type]}
        </span>
      </div>

      <div className={cn("relative z-10 flex min-w-0 flex-col", disabled && "opacity-45")}>
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

      <div className={cn("relative z-10 flex gap-3 justify-between items-end", disabled && "opacity-45")}>
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
      {disabled ? <InUseLock onLightSurface={false} /> : null}
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
