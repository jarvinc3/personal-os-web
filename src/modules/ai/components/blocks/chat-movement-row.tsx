"use client"

import { chatMoneyDisplay } from "@/src/modules/ai/components/blocks/chat-money"
import { useFormatLocale } from "@/src/modules/settings/hooks/use-format-locale"
import type { ChatTransactionSnapshot } from "@/src/modules/ai/types/chat.types"
import {
  formatFinanceDateTimeLabel,
  formatFinanceMoney,
} from "@/src/modules/finance"
import { MovementRow } from "@/src/modules/finance"
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

type ChatMovementRowProps = {
  snapshot: ChatTransactionSnapshot
  isLast: boolean
}

/** Adaptador del chat a la fila canónica de movimiento (#282). */
export function ChatMovementRow({ snapshot, isLast }: ChatMovementRowProps) {
  const locale = useFormatLocale()
  const sign = movementSign(snapshot)
  const instrument = snapshot.cardName ?? snapshot.accountName
  const description = [
    instrument,
    formatFinanceDateTimeLabel(snapshot.transactionDate, locale),
  ]
    .filter(Boolean)
    .join(" · ")

  return (
    <MovementRow
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
            chatMoneyDisplay(snapshot.currency, locale)
          )}
        </span>
      }
      href={APP_ROUTES.app.financeTransaction(snapshot.id)}
      isLast={isLast}
    />
  )
}
