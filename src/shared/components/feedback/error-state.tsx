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

type ErrorStateProps = {
  message: string
  onRetry?: () => void
  isRetrying?: boolean
}

export function ErrorState({
  message,
  onRetry,
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <Empty className="rounded-2xl border border-destructive bg-card p-2 text-destructive">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlertIcon className="text-destructive" />
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
