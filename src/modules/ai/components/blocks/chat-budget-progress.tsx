"use client"

import { chatMoneyDisplay } from "@/src/modules/ai/components/blocks/chat-money"
import type { ChatBlock } from "@/src/modules/ai/types/chat.types"
import { formatFinanceMoney } from "@/src/modules/finance"
import { APP_ROUTES } from "@/src/shared/constants/app-routes"
import { cn } from "@/src/shared/lib/utils"
import { LinkPendingOverlay } from "@/src/shared/components/ui/navigation-pending"
import { ChevronRightIcon } from "lucide-react"
import Link from "next/link"

type ChatBudgetProgressProps = {
  block: Extract<ChatBlock, { type: "budget_progress" }>
}

export function ChatBudgetProgress({ block }: ChatBudgetProgressProps) {
  const display = chatMoneyDisplay(block.currency)
  const limit = Number(block.limit)
  const spent = Number(block.spent)
  const rawPct = block.pctUsed ?? (limit > 0 ? (spent / limit) * 100 : 0)
  const clampedPct = Math.min(Math.max(rawPct, 0), 100)

  return (
    <Link
      href={APP_ROUTES.app.financeBudget(block.budgetId)}
      className="relative flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center gap-2">
        {block.icon ? (
          <span className="text-base leading-none">{block.icon}</span>
        ) : null}
        <span className="min-w-0 flex-1 truncate text-sm font-medium">
          {block.name ?? "Presupuesto"}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
          {Math.round(rawPct)}%
        </span>
        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full", !block.color && "bg-primary")}
          style={{
            width: `${clampedPct}%`,
            ...(block.color ? { backgroundColor: block.color } : {}),
          }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {formatFinanceMoney(block.spent, display)} de{" "}
        {formatFinanceMoney(block.limit, display)}
      </p>
      <LinkPendingOverlay />
    </Link>
  )
}
