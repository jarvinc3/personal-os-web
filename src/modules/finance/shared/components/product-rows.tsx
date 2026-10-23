"use client"

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
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { LockIcon } from "lucide-react"
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
  /** PROVISIONAL (#272): draft for the card gallery; #290 retires the gallery. */
  variant?: "full" | "compact" | "inline"
}

export function AccountProductRow({
  account,
  display,
  onPress,
  href,
  disabled = false,
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
    disabled ? "cursor-not-allowed" : PRESSABLE_CLASS
  )
  const style = tint ? { backgroundColor: tint } : undefined
  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          disabled && "opacity-45"
        )}
      >
        <span className="absolute -top-10 -right-8 size-28 rounded-full bg-white/25" />
        <span className="absolute right-10 -bottom-12 size-24 rounded-full bg-black/15" />
      </span>

      <BrandLogo
        name={account.institutionName ?? account.name}
        logoUrl={account.institutionLogoUrl}
        size={compact ? 28 : 44}
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
  /** PROVISIONAL (#272): draft for the card gallery; #290 retires the gallery. */
  variant?: "full" | "compact" | "inline"
}

export function CardProductRow({
  card,
  accounts,
  display,
  onPress,
  href,
  disabled = false,
  variant = "full",
}: CardProductRowProps) {
  const balances = resolveCardDisplayBalances(card, accounts)
  const compact = variant === "compact"

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

  const className = cn(
    "relative flex w-full flex-col overflow-hidden text-left text-white",
    compact ? "gap-2 rounded-xl p-2.5" : "gap-4 rounded-2xl bg-zinc-900 p-4",
    compact && !card.color && "bg-zinc-900",
    disabled ? "cursor-not-allowed" : cn("hover:opacity-95", PRESSABLE_CLASS)
  )
  const style = card.color ? { backgroundColor: card.color } : undefined
  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0",
          disabled && "opacity-45"
        )}
      >
        <span className="absolute top-[-45%] right-[-12%] h-[190%] w-[38%] rotate-22 bg-black/20" />
        <span className="absolute bottom-[-55%] left-[-18%] h-28 w-[62%] -rotate-6 rounded-4xl bg-white/15" />
      </span>

      <div
        className={cn(
          "relative z-10 flex items-center justify-between gap-3",
          disabled && "opacity-45"
        )}
      >
        <p
          className={cn(
            "truncate font-semibold text-white",
            compact ? "text-sm" : "text-sm"
          )}
        >
          {card.name}
        </p>
        <span
          className={cn(
            "shrink-0 rounded-full bg-white/15 font-semibold",
            compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-xs"
          )}
        >
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
            compact ? "text-[9px]" : "text-[10px]"
          )}
        >
          {card.type === "CREDIT" ? "Balance disponible" : "Saldo actual"}
        </p>
        {balances.length === 0 ? (
          <p
            className={cn(
              "font-bold tabular-nums",
              compact ? "text-base" : "text-xl"
            )}
          >
            Sin saldo
          </p>
        ) : (
          balances.map((balance) => (
            <p
              key={balance.id}
              className={cn(
                "font-bold tabular-nums",
                compact ? "text-base leading-tight" : "text-xl"
              )}
            >
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
        <p
          className={cn("tracking-[0.2em] text-white/80", compact && "text-xs")}
        >
          •••• {card.lastFour ?? "····"}
        </p>
        <span className="inline-flex items-center gap-1">
          <BrandLogo
            name={card.institutionName}
            logoUrl={card.institutionLogoUrl}
            size={compact ? 22 : 28}
          />
          <CardNetworkMark
            network={card.network}
            logoUrl={card.networkLogoUrl}
            size={compact ? 22 : 28}
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
