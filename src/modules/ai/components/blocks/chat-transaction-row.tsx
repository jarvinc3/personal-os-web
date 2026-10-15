"use client"

import { chatMoneyDisplay } from "@/src/modules/ai/components/blocks/chat-money"
import type { ChatTransactionSnapshot } from "@/src/modules/ai/types/chat.types"
import {
  formatFinanceDateTimeLabel,
  formatFinanceMoney,
} from "@/src/modules/finance"
import { SummaryItem } from "@/src/shared/components/ui/summary"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"
import {
  ArrowDownLeftIcon,
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  ScaleIcon,
} from "lucide-react"
import type { ReactNode } from "react"

function movementSign(snapshot: ChatTransactionSnapshot): "-" | "+" | null {
  if (snapshot.type === "DEBIT") {
    return "-"
  }
  if (snapshot.type === "CREDIT") {
    return "+"
  }
  return null
}

function rowIcon(snapshot: ChatTransactionSnapshot): ReactNode {
  switch (snapshot.type) {
    case "TRANSFER":
      return <ArrowLeftRightIcon className="size-5 text-info" />
    case "DEBIT":
      return <ArrowDownLeftIcon className="size-5 text-destructive" />
    case "CREDIT":
      return <ArrowUpRightIcon className="size-5 text-success" />
    case "ADJUSTMENT":
      return <ScaleIcon className="size-5 text-muted-foreground" />
    default:
      return null
  }
}

type ChatTransactionRowProps = {
  snapshot: ChatTransactionSnapshot
  isLast: boolean
}

export function ChatTransactionRow({
  snapshot,
  isLast,
}: ChatTransactionRowProps) {
  const sign = movementSign(snapshot)
  const instrument = snapshot.cardName ?? snapshot.accountName
  const description = [
    instrument,
    formatFinanceDateTimeLabel(snapshot.transactionDate),
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <SummaryItem
      title={
        snapshot.merchant ?? snapshot.description ?? instrument ?? "Movimiento"
      }
      description={description}
      leading={rowIcon(snapshot)}
      value={
        <span
          className={cn(
            sign === "-" && "text-destructive",
            sign === "+" && "text-success"
          )}
        >
          {sign ? `${sign} ` : null}
          {formatFinanceMoney(
            snapshot.amount,
            chatMoneyDisplay(snapshot.currency)
          )}
        </span>
      }
      href={APP_ROUTES.app.financeTransaction(snapshot.id)}
      isLast={isLast}
    />
  )
}
