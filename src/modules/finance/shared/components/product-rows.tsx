"use client"

import { EntitySurface } from "@/src/modules/finance/shared/components/entity-surface"
import {
  BrandLogo,
  CardNetworkMark,
} from "@/src/modules/finance/shared/components/brand-logo"
import {
  FINANCE_ACCOUNT_TYPE_LABEL,
  FINANCE_CARD_TYPE_LABEL,
} from "@/src/modules/finance/shared/constants/catalog"
import { resolveCardDisplayBalances } from "@/src/modules/finance/shared/lib/card-balances"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { formatFinanceMoney } from "@/src/modules/finance/shared/lib/money"
import type {
  FinanceAccount,
  FinanceCard,
} from "@/src/modules/finance/shared/types/entities"
import { cn, PRESSABLE_CLASS } from "@/src/shared/lib/utils"
import { LinkPendingOverlay } from "@/src/shared/components/shell/navigation-pending"
import { CheckIcon, LockIcon } from "lucide-react"
import Link from "next/link"

function InUseLock({ onLightSurface }: { onLightSurface: boolean }) {
  return (
    <span className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <LockIcon
        className={cn(
          "size-7",
          onLightSurface ? "text-foreground" : "text-white"
        )}
        aria-hidden
      />
      <span className="sr-only">En uso</span>
    </span>
  )
}

type AccountProductRowProps = {
  account: FinanceAccount
  display: FinanceMoneyDisplay
  onPress?: () => void
  href?: string
  disabled?: boolean
  /** Ring and check mark while the card is picked in a selector. */
  selected?: boolean
  /** Variante de la card; la galería /dev/cards la pinta (#272). */
  variant?: "full" | "compact" | "inline"
}

export function AccountProductRow({
  account,
  display,
  onPress,
  href,
  disabled = false,
  selected = false,
  variant = "full",
}: AccountProductRowProps) {
  const lastFour = account.accountNumberLast4
  const subtitle = lastFour
    ? `${FINANCE_ACCOUNT_TYPE_LABEL[account.type]} · •••• ${lastFour}`
    : `${FINANCE_ACCOUNT_TYPE_LABEL[account.type]} · ${account.currency}`
  const tint = account.color
  const compact = variant === "compact"
  const inline = variant === "inline"

  if (inline) {
    const mention = (
      <>
        <BrandLogo
          name={account.institutionName ?? account.name}
          logoUrl={account.institutionLogoUrl}
          size={20}
          className="shrink-0"
        />
        <span className="min-w-0 truncate text-sm font-medium">
          {account.name}
        </span>
      </>
    )
    const inlineClassName = cn(
      "inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle",
      disabled ? "cursor-not-allowed opacity-50" : PRESSABLE_CLASS
    )

    if (href && !disabled) {
      return (
        <Link href={href} className={inlineClassName}>
          {mention}
        </Link>
      )
    }

    if (onPress) {
      return (
        <button
          type="button"
          onClick={onPress}
          disabled={disabled}
          className={inlineClassName}
        >
          {mention}
        </button>
      )
    }

    return (
      <span
        className={cn(
          "inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle",
          disabled && "opacity-50"
        )}
      >
        {mention}
      </span>
    )
  }

  const className = cn(
    "group relative flex w-full items-center overflow-hidden text-left",
    compact
      ? "gap-2 rounded-xl border p-2 pl-3"
      : "gap-3 rounded-2xl border p-2 pl-4",
    tint
      ? "border-transparent text-white"
      : "border-border bg-card text-foreground",
    disabled ? "cursor-not-allowed" : PRESSABLE_CLASS,
    selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
  )
  const style = tint ? { backgroundColor: tint } : undefined
  const content = (
    <>
      <EntitySurface className={cn(disabled && "opacity-45")} />

      <BrandLogo
        name={account.institutionName ?? account.name}
        logoUrl={account.institutionLogoUrl}
        size={compact ? 32 : 44}
        className={cn("relative z-10 shrink-0", disabled && "opacity-45")}
      />

      <div
        className={cn(
          "relative z-10 flex min-w-0 flex-1 flex-col",
          compact ? "gap-0.5" : "gap-1",
          disabled && "opacity-45"
        )}
      >
        <div
          className={cn(
            "flex min-w-0",
            compact ? "items-baseline justify-between gap-2" : "flex-col"
          )}
        >
          <p
            className={cn(
              "truncate font-semibold",
              compact && "text-sm leading-tight"
            )}
          >
            {account.name}
          </p>
          {compact ? (
            <p className="shrink-0 text-[13px] leading-tight font-semibold tabular-nums">
              {formatFinanceMoney(account.balance, {
                ...display,
                currency: account.currency,
              })}
            </p>
          ) : null}
          {!compact ? (
            <p
              className={cn(
                "truncate",
                "text-sm",
                tint ? "text-white/70" : "text-muted-foreground"
              )}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {compact ? (
          <p
            className={cn(
              "truncate text-[11px] leading-tight",
              tint ? "text-white/70" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </p>
        ) : (
          <p className="font-semibold tabular-nums">
            {formatFinanceMoney(account.balance, {
              ...display,
              currency: account.currency,
            })}
          </p>
        )}
      </div>
      {disabled ? <InUseLock onLightSurface={!tint} /> : null}
      {selected && !disabled ? (
        <span className="relative z-10 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon className="size-3.5" aria-hidden />
        </span>
      ) : null}
    </>
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={className} style={style}>
        {content}
        <LinkPendingOverlay />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className={className}
      style={style}
    >
      {content}
    </button>
  )
}

type CardProductRowProps = {
  card: FinanceCard
  accounts: readonly FinanceAccount[]
  display: FinanceMoneyDisplay
  onPress?: () => void
  href?: string
  disabled?: boolean
  /** Ring and check mark while the card is picked in a selector. */
  selected?: boolean
  /** Extra line under the type, such as the billing day. */
  trailingNote?: string
  /** Proyección: reemplaza el monto y su etiqueta en la compacta. */
  balance?: { amount: string; label: string }
  /** Variante de la card; la galería /dev/cards la pinta (#272). */
  variant?: "full" | "compact" | "inline"
}

export function CardProductRow({
  card,
  accounts,
  display,
  onPress,
  href,
  disabled = false,
  selected = false,
  trailingNote,
  balance,
  variant = "full",
}: CardProductRowProps) {
  const balances = resolveCardDisplayBalances(card, accounts)
  const compact = variant === "compact"
  const style = card.color ? { backgroundColor: card.color } : undefined

  if (variant === "inline") {
    const mention = (
      <>
        <BrandLogo
          name={card.institutionName}
          logoUrl={card.institutionLogoUrl}
          size={20}
          className="shrink-0"
        />
        <span className="min-w-0 truncate text-sm font-medium">
          {card.name}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          •••• {card.lastFour ?? "····"}
        </span>
      </>
    )
    const inlineClassName = cn(
      "inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle",
      disabled ? "cursor-not-allowed opacity-50" : PRESSABLE_CLASS
    )

    if (href && !disabled) {
      return (
        <Link href={href} className={inlineClassName}>
          {mention}
        </Link>
      )
    }

    if (onPress) {
      return (
        <button
          type="button"
          onClick={onPress}
          disabled={disabled}
          className={inlineClassName}
        >
          {mention}
        </button>
      )
    }

    return (
      <span
        className={cn(
          "inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle",
          disabled && "opacity-50"
        )}
      >
        {mention}
      </span>
    )
  }

  if (compact) {
    const [firstBalance] = balances
    const extraCurrencies = balance ? 0 : balances.length - 1
    const balanceLabel =
      balance?.label ?? (card.type === "CREDIT" ? "Disponible" : "Saldo")
    const amount =
      balance?.amount ??
      (firstBalance
        ? formatFinanceMoney(
            firstBalance.availableCredit ?? firstBalance.balance,
            {
              ...display,
              currency: firstBalance.currency,
            }
          )
        : "Sin saldo")
    const compactClassName = cn(
      "relative flex w-full items-center gap-2.5 overflow-hidden rounded-xl p-2.5 text-left text-white",
      !card.color && "bg-zinc-900",
      disabled ? "cursor-not-allowed" : cn("hover:opacity-95", PRESSABLE_CLASS),
      selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
    )
    const compactContent = (
      <>
        <EntitySurface
          shape="slashes"
          className={cn(disabled && "opacity-45")}
        />
        <BrandLogo
          name={card.institutionName}
          logoUrl={card.institutionLogoUrl}
          size={22}
          className="relative z-10 shrink-0"
        />
        <CardNetworkMark
          network={card.network}
          logoUrl={card.networkLogoUrl}
          size={22}
          className="relative z-10 shrink-0"
        />
        <span
          className={cn(
            "relative z-10 flex min-w-0 flex-1 flex-col gap-0.5",
            disabled && "opacity-45"
          )}
        >
          <span className="truncate text-sm font-semibold">{card.name}</span>
          <span className="truncate text-[11px] text-white/70">
            {FINANCE_CARD_TYPE_LABEL[card.type]} · ••••{" "}
            {card.lastFour ?? "····"}
          </span>
          {trailingNote ? (
            <span className="truncate text-[11px] text-white/60">
              {trailingNote}
            </span>
          ) : null}
        </span>
        <span
          className={cn(
            "relative z-10 flex shrink-0 flex-col items-end",
            disabled && "opacity-45"
          )}
        >
          <span className="text-[9px] tracking-[0.14em] text-white/55 uppercase">
            {balanceLabel}
          </span>
          <span className="text-sm font-bold tabular-nums">
            {amount}
            {extraCurrencies > 0 ? (
              <span className="text-[10px] font-medium text-white/60">
                {" "}
                +{extraCurrencies}
              </span>
            ) : null}
          </span>
        </span>
        {selected ? (
          <span className="relative z-10 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <CheckIcon className="size-3.5" aria-hidden />
          </span>
        ) : null}
        {disabled ? <InUseLock onLightSurface={false} /> : null}
      </>
    )

    if (href && !disabled) {
      return (
        <Link
          href={href}
          className={compactClassName}
          style={style}
          aria-label={`Abrir ${card.name}`}
        >
          {compactContent}
          <LinkPendingOverlay />
        </Link>
      )
    }

    return (
      <button
        type="button"
        onClick={onPress}
        disabled={disabled}
        className={compactClassName}
        style={style}
        aria-label={`Abrir ${card.name}`}
      >
        {compactContent}
      </button>
    )
  }

  const className = cn(
    "relative flex w-full flex-col gap-4 overflow-hidden rounded-2xl bg-zinc-900 p-4 text-left text-white",
    disabled ? "cursor-not-allowed" : cn("hover:opacity-95", PRESSABLE_CLASS)
  )
  const content = (
    <>
      <EntitySurface shape="slashes" className={cn(disabled && "opacity-45")} />

      <div
        className={cn(
          "relative z-10 flex items-center justify-between gap-3",
          disabled && "opacity-45"
        )}
      >
        <p className="truncate text-sm font-semibold text-white">{card.name}</p>
        <span className="shrink-0 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
          {FINANCE_CARD_TYPE_LABEL[card.type]}
        </span>
      </div>

      <div
        className={cn(
          "relative z-10 flex min-w-0 flex-col",
          disabled && "opacity-45"
        )}
      >
        <p
          className={cn(
            "tracking-[0.14em] text-white/55 uppercase",
            "text-[10px]"
          )}
        >
          {card.type === "CREDIT" ? "Balance disponible" : "Saldo actual"}
        </p>
        {balances.length === 0 ? (
          <p className="text-xl font-bold tabular-nums">Sin saldo</p>
        ) : (
          balances.map((balance) => (
            <p key={balance.id} className="text-xl font-bold tabular-nums">
              {formatFinanceMoney(balance.availableCredit ?? balance.balance, {
                ...display,
                currency: balance.currency,
              })}
            </p>
          ))
        )}
      </div>

      <div
        className={cn(
          "relative z-10 flex items-end justify-between gap-3",
          disabled && "opacity-45"
        )}
      >
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
    </>
  )

  if (href && !disabled) {
    return (
      <Link href={href} className={className} style={style}>
        {content}
        <LinkPendingOverlay />
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={onPress}
      disabled={disabled}
      className={className}
      style={style}
    >
      {content}
    </button>
  )
}
