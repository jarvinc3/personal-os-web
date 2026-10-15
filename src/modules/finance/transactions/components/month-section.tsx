"use client"

import { TransactionMovementRow } from "@/src/modules/finance/transactions/components/transaction-movement-row"
import type { TimelineMonth } from "@/src/modules/finance/shared/lib/group-transactions-timeline"
import { formatFinanceDateTimeLabel } from "@/src/modules/finance/shared/lib/ledger-form"
import type { ReversalGroup } from "@/src/modules/finance/transactions/lib/group-reversals"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  isInactiveTransactionStatus,
  isTransferTransaction,
  signedAmount,
} from "@/src/modules/finance/shared/lib/transactions-query"
import type {
  FinanceCategory,
  FinanceTransaction,
} from "@/src/modules/finance/shared/types/entities"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"
import { Undo2Icon } from "lucide-react"
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

/** Purchases stand alone. Legs of the same transfer stay in one card. */
function clusterDayRows(rows: readonly ReversalGroup[]): ReversalGroup[][] {
  const clusters: ReversalGroup[][] = []
  for (const row of rows) {
    const groupId = row.original.transferGroupId
    const current = clusters[clusters.length - 1]
    const currentId = current?.[0]?.original.transferGroupId
    if (
      groupId &&
      current &&
      currentId === groupId &&
      isTransferTransaction(row.original) &&
      current.every((item) => isTransferTransaction(item.original))
    ) {
      current.push(row)
      continue
    }
    clusters.push([row])
  }
  return clusters
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
      className="flex flex-col"
    >
      <div className="relative h-24 overflow-hidden md:rounded-t-2xl">
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

      {month.weeks.map((week) => {
        return (
          <section
            key={week.id}
            aria-label={week.label}
            className="flex flex-col gap-2"
          >
            <h3
              className={cn(
                "bg-input/30 py-2 text-center text-sm text-muted-foreground"
              )}
            >
              {week.label}
            </h3>
            {week.days.map((day) => (
              <section
                key={day.dateKey}
                data-day-key={day.dateKey}
                aria-label={day.label}
                className="flex flex-col gap-2 px-2 pb-3 md:px-0"
              >
                <h4 className="flex items-center justify-between gap-3 px-2">
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
                <div className="flex flex-col gap-2">
                  {clusterDayRows(day.rows).map((cluster) => (
                    <div
                      key={cluster[0]?.original.id}
                      className="overflow-hidden rounded-2xl border border-border"
                    >
                      {cluster.map((group: ReversalGroup, index) => {
                        const transaction = group.original
                        const isPair = Boolean(group.reversal)
                        const isExpanded = expandedIds.has(transaction.id)
                        const isLastRow = index === cluster.length - 1
                        return (
                          <div
                            key={transaction.id}
                            className={cn(
                              !isLastRow && "border-b border-border/60"
                            )}
                          >
                            <TransactionMovementRow
                              transaction={transaction}
                              categories={categories}
                              display={display}
                              partial={group.isPartial}
                              paired={isPair}
                              showChevron={isPair}
                              trailing={
                                group.isOrphan &&
                                transaction.linkedTransactionId ? (
                                  <Link
                                    href={APP_ROUTES.app.financeTransaction(
                                      transaction.linkedTransactionId
                                    )}
                                    className="relative inline-flex items-center gap-1 text-xs font-medium text-info hover:underline"
                                  >
                                    <Undo2Icon
                                      className="size-3.5"
                                      aria-hidden
                                    />
                                    Ver original
                                    <LinkPendingOverlay spinnerClassName="size-3" />
                                  </Link>
                                ) : undefined
                              }
                              onPress={
                                isPair
                                  ? () => toggleExpanded(transaction.id)
                                  : undefined
                              }
                              href={
                                isPair
                                  ? undefined
                                  : APP_ROUTES.app.financeTransaction(
                                      transaction.id
                                    )
                              }
                            />
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
                  ))}
                </div>
              </section>
            ))}
          </section>
        )
      })}
    </section>
  )
}
