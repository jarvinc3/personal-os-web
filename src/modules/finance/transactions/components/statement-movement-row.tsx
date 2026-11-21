"use client"

import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import { movementSign } from "@/src/modules/finance/shared/lib/transactions-query"
import { Money } from "@/src/modules/finance/shared/components/money"
import {
  MovementRow,
  MovementTypeMark,
} from "@/src/modules/finance/transactions/components/transaction-movement-row"
import type { StatementMovementRowModel } from "@/src/modules/finance/transactions/lib/statement-movement"

type StatementMovementRowProps = {
  movement: StatementMovementRowModel
  display: FinanceMoneyDisplay
  isLast?: boolean
}

/** Bank line or leftover movement in the canonical row; it never navigates (#284). */
export function StatementMovementRow({
  movement,
  display,
  isLast = true,
}: StatementMovementRowProps) {
  const sign =
    movement.amount === null
      ? null
      : movementSign({
          type: movement.type,
          ledgerAmount: movement.amount,
        })

  return (
    <MovementRow
      title={movement.title}
      description={formatCalendarDate(movement.date, display.locale)}
      leading={
        <MovementTypeMark
          type={movement.type}
          isTransfer={movement.type === "TRANSFER"}
          sign={sign}
        />
      }
      value={
        <Money
          value={movement.amount}
          display={{ ...display, currency: movement.currency }}
          sign={sign ?? undefined}
          tone="auto"
        />
      }
      isLast={isLast}
    />
  )
}
