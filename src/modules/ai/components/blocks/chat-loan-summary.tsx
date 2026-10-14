"use client"

import { chatMoneyDisplay } from "@/src/modules/ai/components/blocks/chat-money"
import type { ChatBlock } from "@/src/modules/ai/types/chat.types"
import { formatFinanceMoney } from "@/src/modules/finance"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

type ChatLoanSummaryProps = {
  block: Extract<ChatBlock, { type: "loan_summary" }>
}

function formatDueDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "short",
  })
}

export function ChatLoanSummary({ block }: ChatLoanSummaryProps) {
  const display = chatMoneyDisplay(block.currency)
  const installment = block.nextInstallment

  return (
    <Link
      href={APP_ROUTES.app.financeLoan(block.loanId)}
      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-muted/50"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          {block.name ?? "Préstamo"}
        </span>
        <span className="block text-xs text-muted-foreground">
          Saldo {formatFinanceMoney(block.balance, display)}
        </span>
        {installment ? (
          <span className="block text-xs text-muted-foreground">
            Cuota {installment.installmentNo}:{" "}
            {formatFinanceMoney(installment.amount, display)} ·{" "}
            {formatDueDate(installment.dueDate)}
          </span>
        ) : null}
      </span>
      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
