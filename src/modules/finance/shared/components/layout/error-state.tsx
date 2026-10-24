"use client"

import { Button } from "@/src/shared/components/ui/button"
import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/src/shared/components/ui/empty"

type FinanceErrorStateProps = {
  message: string
  onRetry?: () => void
  isRetrying?: boolean
}

export function FinanceErrorState({
  message,
  onRetry,
  isRetrying = false,
}: FinanceErrorStateProps) {
  return (
    <Empty className="rounded-2xl border border-danger bg-card p-2 text-danger">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon className="text-danger" />
        </EmptyMedia>
        <EmptyTitle>No se pudieron cargar los datos</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {onRetry && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isRetrying}
            onClick={onRetry}
          >
            <RefreshCwIcon />
            Reintentar
          </Button>
        )}
      </EmptyContent>
    </Empty>
  )
}
