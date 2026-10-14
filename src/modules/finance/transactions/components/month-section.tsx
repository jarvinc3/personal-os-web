"use client"

import { TransactionInstrument } from "@/src/modules/finance/transactions/components/transaction-instrument"
import { TransactionStatusMark } from "@/src/modules/finance/transactions/components/transaction-status-mark"
import { BrandLogo } from "@/src/modules/finance/shared/components/brand-logo"
import type { TimelineMonth } from "@/src/modules/finance/shared/lib/group-transactions-timeline"
import {
  formatFinanceDateTimeLabel,
  formatFinanceTimeLabel,
} from "@/src/modules/finance/shared/lib/ledger-form"
import {
  FINANCE_REVERSAL_PARTIAL_LABEL,
  type ReversalGroup,
} from "@/src/modules/finance/transactions/lib/group-reversals"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  isInactiveTransactionStatus,
  isTransferTransaction,
  movementSign,
  signedAmount,
  transferDirectionLabel,
} from "@/src/modules/finance/shared/lib/transactions-query"
import {
  FINANCE_TRANSACTION_STATUS_LABEL,
  type FinanceCategory,
  type FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { Badge } from "@/src/shared/components/ui/badge"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  ScaleIcon,
  Undo2Icon,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

type FinanceMonthSectionProps = {
  month: TimelineMonth
  categories: FinanceCategory[]
  display: FinanceMoneyDisplay
  isActive: boolean
  stickyOffset: number
}

type ReversalLegProps = {
  leg: FinanceTransaction
  roleLabel: string
  display: FinanceMoneyDisplay
  isLast: boolean
}

function reversalSourceLabel(source: string | null): string {
  if (source === "EMAIL") {
    return "Correo"
  }
  if (source === "AI") {
    return "Asistente"
  }
  return "Manual"
}

function ReversalLeg({ leg, roleLabel, display, isLast }: ReversalLegProps) {
  const detail =
    leg.merchant ??
    leg.description ??
    leg.accountName ??
    leg.cardName ??
    "Movimiento"
  const isInactive = isInactiveTransactionStatus(leg.status)
  return (
    <SummaryItem
      title={roleLabel}
      description={`${detail} · ${formatFinanceDateTimeLabel(leg.transactionDate)} · ${reversalSourceLabel(leg.source)}`}
      value={
        <span
          className={cn(isInactive && "text-muted-foreground line-through")}
        >
          {signedAmount(leg, display)}
        </span>
      }
      href={APP_ROUTES.app.financeTransaction(leg.id)}
      isLast={isLast}
    />
  )
}

export function FinanceMonthSection({
  month,
  categories,
  display,
  isActive,
  stickyOffset,
}: FinanceMonthSectionProps) {
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set())
  const headingId = `month-label-${month.key}`
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const)
  )

  function toggleExpanded(transactionId: string) {
    setExpandedIds((current) => {
      const next = new Set(current)
      if (next.has(transactionId)) {
        next.delete(transactionId)
      } else {
        next.add(transactionId)
      }
      return next
    })
  }

  return (
    <section
      data-month-key={month.key}
      aria-labelledby={headingId}
      style={{ scrollMarginTop: stickyOffset }}
      className="flex flex-col gap-4"
    >
      <div className="relative h-24 overflow-hidden md:rounded-2xl">
        <Image
          src={month.bannerSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 20rem"
          className="object-cover"
          priority={isActive}
        />
        <h2
          id={headingId}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/55 px-4 py-1 text-sm font-medium text-white shadow-sm"
        >
          {month.label}
        </h2>
      </div>

      {month.weeks.map((week, index) => {
        const isLast = index === month.weeks.length - 1
        return (
          <section
            key={week.id}
            aria-label={week.label}
            className="flex flex-col gap-3"
          >
            <h3
              className={cn(
                "text-center text-sm text-muted-foreground",
                !isLast && "border-b border-border pb-2"
              )}
            >
              {week.label}
            </h3>
            {week.days.map((day) => (
              <section
                key={day.dateKey}
                aria-label={day.label}
                className="flex flex-col gap-2"
              >
                <h4 className="flex items-center justify-between gap-3 px-1">
                  <span className="text-xs text-muted-foreground">
                    {day.label}
                  </span>
                  <p
                    className={cn(
                      "text-xs font-medium tabular-nums",
                      day.net > 0 && "text-success",
                      day.net < 0 && "text-destructive",
                      day.net === 0 && "text-muted-foreground"
                    )}
                  >
                    {day.net === 0
                      ? formatFinanceMoney(0, display)
                      : `${day.net > 0 ? "+" : "−"} ${formatFinanceMoney(Math.abs(day.net), display)}`}
                  </p>
                </h4>
                <div className="rounded-2xl border border-border bg-card">
                  {day.rows.map((group: ReversalGroup, index) => {
                    const transaction = group.original
                    const isTransfer = isTransferTransaction(transaction)
                    const isInactive = isInactiveTransactionStatus(
                      transaction.status
                    )
                    const isPair = Boolean(group.reversal)
                    const isReversed = transaction.status === "REVERSED"
                    const isExpanded = expandedIds.has(transaction.id)
                    const isLastRow = index === day.rows.length - 1
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
                      : category?.color?.trim() ||
                        parent?.color?.trim() ||
                        "#64748B"
                    const title = isTransfer
                      ? transferDirectionLabel(transaction)
                      : (transaction.merchantName ??
                        transaction.merchant ??
                        transaction.description ??
                        transaction.accountName ??
                        "Movimiento")
                    const feeLeg = transaction.legs?.find(
                      (leg) => leg.legRole === "FEE"
                    )
                    const instrumentLine =
                      transaction.accountName || transaction.cardName ? (
                        <TransactionInstrument
                          transaction={transaction}
                          suffix={formatFinanceTimeLabel(
                            transaction.transactionDate
                          )}
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
                    const rowBase = {
                      title,
                      description,
                      leading: transaction.merchantLogoUrl ? (
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
                            movementSign(transaction) === "−"
                              ? "text-destructive"
                              : "text-success"
                          )}
                        />
                      ) : null,
                      accentColor: color,
                      className: cn(isInactive && "opacity-50"),
                      value: (
                        <span
                          className={cn(
                            !isTransfer &&
                              movementSign(transaction) === "−" &&
                              "text-destructive",
                            !isTransfer &&
                              movementSign(transaction) === "+" &&
                              "text-success",
                            isInactive && "text-muted-foreground line-through"
                          )}
                        >
                          {signedAmount(transaction, display)}
                        </span>
                      ),
                      trailing: (
                        <span className="flex items-center gap-1.5">
                          {transaction.possibleDuplicateOfId ? (
                            <Badge variant="warning">¿Duplicado?</Badge>
                          ) : null}
                          {group.isPartial ? (
                            <Badge variant="warning">
                              {FINANCE_REVERSAL_PARTIAL_LABEL}
                            </Badge>
                          ) : isPair || isReversed ? (
                            <Badge variant="info">
                              {FINANCE_TRANSACTION_STATUS_LABEL.REVERSED}
                            </Badge>
                          ) : (
                            <TransactionStatusMark
                              status={transaction.status}
                            />
                          )}
                          {group.isOrphan && transaction.linkedTransactionId ? (
                            <Link
                              href={APP_ROUTES.app.financeTransaction(
                                transaction.linkedTransactionId
                              )}
                              className="inline-flex items-center gap-1 text-xs font-medium text-info hover:underline"
                            >
                              <Undo2Icon className="size-3.5" aria-hidden />
                              Ver original
                            </Link>
                          ) : null}
                        </span>
                      ),
                      showChevron: isPair,
                      isLast: true,
                    }
                    return (
                      <div
                        key={transaction.id}
                        className={cn(
                          !isLastRow && "border-b border-border/60"
                        )}
                      >
                        {isPair ? (
                          <SummaryItem
                            {...rowBase}
                            onPress={() => toggleExpanded(transaction.id)}
                          />
                        ) : (
                          <SummaryItem
                            {...rowBase}
                            href={APP_ROUTES.app.financeTransaction(
                              transaction.id
                            )}
                          />
                        )}
                        {isPair && group.reversal && isExpanded ? (
                          <div className="flex flex-col gap-1 px-2 pb-2">
                            <ReversalLeg
                              leg={transaction}
                              roleLabel="Original"
                              display={display}
                              isLast={false}
                            />
                            <ReversalLeg
                              leg={group.reversal}
                              roleLabel="Reversa"
                              display={display}
                              isLast={true}
                            />
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </section>
        )
      })}
    </section>
  )
}
