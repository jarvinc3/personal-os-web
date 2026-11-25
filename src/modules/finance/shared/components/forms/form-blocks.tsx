"use client"

import { Button } from "@/src/shared/components/ui/button"
import { CheckIcon, SparklesIcon } from "lucide-react"
import type { ReactNode } from "react"

type FinanceHelpTextProps = {
  children: ReactNode
}

export function FinanceHelpText({ children }: FinanceHelpTextProps) {
  return <p className="text-xs text-muted-foreground">{children}</p>
}

type FinanceSuggestionRowProps = {
  children: ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function FinanceSuggestionRow({
  children,
  actionLabel,
  onAction,
}: FinanceSuggestionRowProps) {
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-success/10 px-3 py-2 text-sm">
      <SparklesIcon className="size-4 shrink-0 text-success" />
      <span className="min-w-0 flex-1">{children}</span>
      {actionLabel && onAction ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-success"
          onClick={onAction}
        >
          <CheckIcon className="size-4 shrink-0" />
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
