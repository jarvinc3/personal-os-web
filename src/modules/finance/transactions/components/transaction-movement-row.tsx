"use client"

import { TransactionInstrument } from "@/src/modules/finance/transactions/components/transaction-instrument"
import { TransactionStatusMark } from "@/src/modules/finance/transactions/components/transaction-status-mark"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { FINANCE_REVERSAL_PARTIAL_LABEL } from "@/src/modules/finance/transactions/lib/group-reversals"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  crossCurrencyRate,
  transferRateLabel,
} from "@/src/modules/finance/transactions/lib/transfer-fx"
import { formatFinanceTimeLabel } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  displayedMovementSign,
  isInactiveTransactionStatus,
  isTransferTransaction,
  OPERATION_LEG_ROLE,
  signedAmount,
  transferDirectionLabel,
  type FinanceInstrumentRef,
} from "@/src/modules/finance/shared/lib/transactions-query"
import {
  FINANCE_TRANSACTION_STATUS_LABEL,
  type FinanceCategory,
  type FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { Badge } from "@/src/shared/components/ui/badge"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { cn } from "@/src/shared/lib/utils"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  ScaleIcon,
} from "lucide-react"
import type { ReactNode } from "react"
import Link from "next/link"

type TransactionMovementRowProps = {
  transaction: FinanceTransaction
  categories: readonly FinanceCategory[]
  display: FinanceMoneyDisplay
  partial?: boolean
  paired?: boolean
  showChevron?: boolean
  trailing?: ReactNode
  onPress?: () => void
  href?: string
  /** Account or card the movement is read from; signs transfers from its side. */
  instrument?: FinanceInstrumentRef
  /** Variante de la card; la galería /dev/cards la pinta (#272). */
  variant?: "default" | "compact" | "inline"
}

function MovementLeading({
  transaction,
  icon,
  isTransfer,
  sign,
  title,
  size,
}: {
  transaction: FinanceTransaction
  icon: string | undefined
  isTransfer: boolean
  sign: "+" | "−" | null
  title: string
  size: number
}) {
  const iconClassName = size > 22 ? "size-5" : "size-4"
  const emojiClassName = size >= 22 ? "text-base" : "text-sm"

  if (transaction.merchantLogoUrl) {
    return (
      <BrandLogo
        name={title}
        logoUrl={transaction.merchantLogoUrl}
        size={size}
      />
    )
  }
  if (icon) {
    return (
      <span className={emojiClassName} aria-hidden>
        {icon}
      </span>
    )
  }
  if (isTransfer) {
    return (
      <ArrowLeftRightIcon
        className={cn(iconClassName, "text-info")}
        aria-hidden
      />
    )
  }
  if (transaction.type === "DEBIT") {
    return (
      <ArrowDownLeftIcon
        className={cn(iconClassName, "text-destructive")}
        aria-hidden
      />
    )
  }
  if (transaction.type === "CREDIT") {
    return (
      <ArrowUpRightIcon
        className={cn(iconClassName, "text-success")}
        aria-hidden
      />
    )
  }
  if (transaction.type === "ADJUSTMENT") {
    return (
      <ScaleIcon
        className={cn(
          iconClassName,
          sign === "−" ? "text-destructive" : "text-success"
        )}
        aria-hidden
      />
    )
  }
  return null
}

export function TransactionMovementRow({
  transaction,
  categories,
  display,
  partial = false,
  paired = false,
  showChevron = false,
  trailing,
  onPress,
  href,
  instrument,
  variant = "default",
}: TransactionMovementRowProps) {
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const)
  )
  const isTransfer = isTransferTransaction(transaction)
  const isInactive = isInactiveTransactionStatus(transaction.status)
  const isReversed = transaction.status === "REVERSED"
  const category = transaction.categoryId
    ? categoryById.get(transaction.categoryId)
    : undefined
  const parent = category?.parentId
    ? categoryById.get(category.parentId)
    : undefined
  const icon = isTransfer
    ? undefined
    : category?.icon?.trim() || parent?.icon?.trim()
  const color = isTransfer
    ? "#3B82F6"
    : category?.color?.trim() || parent?.color?.trim() || "#64748B"
  const sign = displayedMovementSign(transaction, instrument)
  const crossRate =
    isTransfer && instrument ? crossCurrencyRate(transaction) : null
  const rateLabel = crossRate
    ? transferRateLabel({ ...crossRate, locale: display.locale })
    : null
  const title = isTransfer
    ? transferDirectionLabel(transaction)
    : (transaction.merchantName ??
      transaction.merchant ??
      transaction.description ??
      transaction.accountName ??
      "Movimiento")
  const feeLeg = transaction.legs?.find(
    (leg) => leg.legRole === OPERATION_LEG_ROLE.FEE
  )
  const instrumentLine =
    transaction.accountName || transaction.cardName ? (
      <TransactionInstrument
        transaction={transaction}
        suffix={formatFinanceTimeLabel(transaction.transactionDate)}
      />
    ) : null
  const description =
    instrumentLine || feeLeg ? (
      <span className="flex flex-col gap-0.5">
        {instrumentLine}
        {feeLeg ? (
          <span className="text-xs text-muted-foreground">
            Comisión{" "}
            {formatFinanceMoney(feeLeg.amount, {
              ...display,
              currency: feeLeg.currency,
            })}
          </span>
        ) : null}
      </span>
    ) : undefined
  const hasStatusBadge =
    Boolean(transaction.possibleDuplicateOfId) ||
    partial ||
    paired ||
    isReversed

  if (variant === "inline") {
    const mention = (
      <>
        <MovementLeading
          transaction={transaction}
          icon={icon}
          isTransfer={isTransfer}
          sign={sign}
          title={title}
          size={16}
        />
        <span className="min-w-0 truncate text-sm font-medium">{title}</span>
      </>
    )
    const inlineClassName = cn(
      "inline-flex max-w-full min-w-0 items-center gap-1.5 align-middle",
      isInactive && "opacity-50"
    )

    if (onPress) {
      return (
        <button type="button" onClick={onPress} className={inlineClassName}>
          {mention}
        </button>
      )
    }

    if (href) {
      return (
        <Link href={href} className={inlineClassName}>
          {mention}
        </Link>
      )
    }

    return <span className={inlineClassName}>{mention}</span>
  }

  const leadingMark = (size: number) => (
    <span
      className={cn(
        "flex items-center justify-center",
        isInactive && "opacity-50"
      )}
    >
      <MovementLeading
        transaction={transaction}
        icon={icon}
        isTransfer={isTransfer}
        sign={sign}
        title={title}
        size={size}
      />
    </span>
  )

  const row = {
    accentColor: color,
    tintRow: Boolean(color),
    title: isInactive ? <span className="opacity-50">{title}</span> : title,
    description:
      variant === "compact" ? undefined : isInactive && description ? (
        <span className="opacity-50">{description}</span>
      ) : (
        description
      ),
    leading: leadingMark(variant === "compact" ? 22 : 28),
    className: variant === "compact" ? "gap-2 p-1.5 pl-2" : undefined,
    value: (
      <div className="flex items-center justify-end gap-1">
        <div className="flex flex-col items-end">
          <span
            className={cn(
              sign === "−" && "text-destructive",
              sign === "+" && "text-success",
              isInactive && "text-muted-foreground line-through opacity-50"
            )}
          >
            {signedAmount({ transaction, display, instrument })}
          </span>
          {rateLabel ? (
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {rateLabel}
            </span>
          ) : null}
          {hasStatusBadge ? (
            <span className="flex flex-col items-end gap-1 font-normal">
              {transaction.possibleDuplicateOfId ? (
                <Badge variant="warning">¿Duplicado?</Badge>
              ) : null}
              {partial ? (
                <Badge variant="warning">
                  {FINANCE_REVERSAL_PARTIAL_LABEL}
                </Badge>
              ) : paired || isReversed ? (
                <Badge variant="info">
                  {FINANCE_TRANSACTION_STATUS_LABEL.REVERSED}
                </Badge>
              ) : null}
            </span>
          ) : null}
        </div>
        <TransactionStatusMark
          status={isReversed || paired ? "REVERSED" : transaction.status}
        />
      </div>
    ),
    trailing,
    showChevron,
    isLast: true as const,
  }

  if (onPress) {
    return <SummaryItem {...row} onPress={onPress} />
  }

  if (href) {
    return <SummaryItem {...row} href={href} />
  }

  return <SummaryItem {...row} />
}
