"use client"

import { formatCalendarDate } from "@/src/modules/finance/shared/lib/ledger-form"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import {
  MOVEMENT_SIGN_TONE,
  movementSign,
  signedMoneyLabel,
} from "@/src/modules/finance/shared/lib/transactions-query"
import {
  MovementRow,
  MovementTypeMark,
} from "@/src/modules/finance/transactions/components/transaction-movement-row"
import type { StatementMovementRowModel } from "@/src/modules/finance/transactions/lib/statement-movement"
import { cn } from "@/src/shared/lib/utils"

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
  const sign = movementSign({
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
        <span className={cn(sign && MOVEMENT_SIGN_TONE[sign])}>
          {signedMoneyLabel({
            amount: movement.amount,
            currency: movement.currency,
            display,
            sign,
          })}
        </span>
      }
      isLast={isLast}
    />
  )
}
