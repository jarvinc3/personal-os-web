"use client"

import { TransactionInstrument } from "@/src/modules/finance/transactions/components/transaction-instrument"
import { TransactionStatusMark } from "@/src/modules/finance/transactions/components/transaction-status-mark"
import type { TimelineMonth } from "@/src/modules/finance/shared/lib/group-transactions-timeline"
import { formatFinanceTimeLabel } from "@/src/modules/finance/shared/lib/ledger-form"
import {
  formatFinanceMoney,
  type FinanceMoneyDisplay,
} from "@/src/modules/finance/shared/lib/money"
import {
  isTransferTransaction,
  movementSign,
  signedAmount,
  transferDirectionLabel,
} from "@/src/modules/finance/shared/lib/transactions-query"
import type { FinanceCategory } from "@/src/modules/finance/shared/types/entities"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  ScaleIcon,
} from "lucide-react"
import Image from "next/image"

type FinanceMonthSectionProps = {
  month: TimelineMonth
  categories: FinanceCategory[]
  display: FinanceMoneyDisplay
  isActive: boolean
  stickyOffset: number
}

export function FinanceMonthSection({
  month,
  categories,
  display,
  isActive,
  stickyOffset,
}: FinanceMonthSectionProps) {
  const headingId = `month-label-${month.key}`
  const categoryById = new Map(
    categories.map((category) => [category.id, category] as const)
  )

  return (
    <section
      data-month-key={month.key}
      aria-labelledby={headingId}
      style={{ scrollMarginTop: stickyOffset }}
      className="flex flex-col gap-4"
    >
      <div className="relative h-40 overflow-hidden rounded-2xl">
        <Image
          src={month.bannerSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, 64rem"
          className="object-cover"
          priority={isActive}
        />
        <div className="absolute inset-0 bg-black/15" />
        <h2
          id={headingId}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/55 px-4 py-1.5 text-sm font-medium text-white"
        >
          {month.label}
        </h2>
      </div>

      {month.weeks.map((week) => (
        <div key={week.id} className="flex flex-col gap-3">
          <p className="text-center text-sm text-muted-foreground">
            {week.label}
          </p>
          {week.days.map((day) => (
            <div key={day.dateKey} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3 px-1">
                <p className="text-xs text-muted-foreground">{day.label}</p>
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
              </div>
              <div className="rounded-2xl border border-border bg-card">
                {day.items.map((transaction, index) => {
                  const isTransfer = isTransferTransaction(transaction)
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
                    : (transaction.merchant ??
                      transaction.description ??
                      transaction.accountName ??
                      "Movimiento")
                  return (
                    <SummaryItem
                      key={transaction.id}
                      title={title}
                      description={
                        transaction.accountName || transaction.cardName ? (
                          <TransactionInstrument
                            transaction={transaction}
                            suffix={formatFinanceTimeLabel(
                              transaction.transactionDate
                            )}
                          />
                        ) : undefined
                      }
                      leading={
                        icon ? (
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
                        ) : null
                      }
                      accentColor={color}
                      value={
                        <span
                          className={cn(
                            !isTransfer &&
                              movementSign(transaction) === "−" &&
                              "text-destructive",
                            !isTransfer &&
                              movementSign(transaction) === "+" &&
                              "text-success"
                          )}
                        >
                          {signedAmount(transaction, display)}
                        </span>
                      }
                      trailing={
                        <TransactionStatusMark status={transaction.status} />
                      }
                      showChevron={false}
                      href={APP_ROUTES.app.financeTransaction(transaction.id)}
                      isLast={index === day.items.length - 1}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
