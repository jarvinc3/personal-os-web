"use client"

import {
  ALERT_SOFT_TONE_CLASS_NAME,
  Alert,
  AlertAction,
  AlertDescription,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import { CheckIcon, SparklesIcon } from "lucide-react"
import type { ReactNode } from "react"

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
    <Alert className={ALERT_SOFT_TONE_CLASS_NAME.success}>
      <SparklesIcon aria-hidden="true" />
      <AlertDescription>{children}</AlertDescription>
      {actionLabel && onAction ? (
        <AlertAction>
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
        </AlertAction>
      ) : null}
    </Alert>
  )
}
