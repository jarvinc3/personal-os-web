"use client"

import { TransactionInstrument } from "@/src/modules/finance/transactions/components/transaction-instrument"
import { TransactionStatusMark } from "@/src/modules/finance/transactions/components/transaction-status-mark"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import { FINANCE_REVERSAL_PARTIAL_LABEL } from "@/src/modules/finance/transactions/lib/group-reversals"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import { transferRateLabel } from "@/src/modules/finance/transactions/lib/transfer-fx"
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
  const rateLabel =
    isTransfer &&
    instrument &&
    transaction.transferToCurrency &&
    transaction.transferToCurrency !== transaction.currency &&
    transaction.exchangeRate
      ? transferRateLabel({
          rate: transaction.exchangeRate,
          sourceCurrency: transaction.currency,
          destinationCurrency: transaction.transferToCurrency,
        })
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

  const row = {
    accentColor: color,
    tintRow: Boolean(color),
    title: isInactive ? <span className="opacity-50">{title}</span> : title,
    description:
      isInactive && description ? (
        <span className="opacity-50">{description}</span>
      ) : (
        description
      ),
    leading: (
      <span
        className={cn(
          "flex items-center justify-center",
          isInactive && "opacity-50"
        )}
      >
        {transaction.merchantLogoUrl ? (
          <BrandLogo
            name={title}
            logoUrl={transaction.merchantLogoUrl}
            size={28}
          />
        ) : icon ? (
          <span>{icon}</span>
        ) : isTransfer ? (
          <ArrowLeftRightIcon className="size-5 text-info" />
        ) : transaction.type === "DEBIT" ? (
          <ArrowDownLeftIcon className="size-5 text-destructive" />
        ) : transaction.type === "CREDIT" ? (
          <ArrowUpRightIcon className="size-5 text-success" />
        ) : transaction.type === "ADJUSTMENT" ? (
          <ScaleIcon
            className={cn(
              "size-5",
              sign === "−" ? "text-destructive" : "text-success"
            )}
          />
        ) : null}
      </span>
    ),
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
