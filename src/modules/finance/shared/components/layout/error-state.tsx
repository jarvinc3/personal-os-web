"use client"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import { RefreshCwIcon, TriangleAlertIcon } from "lucide-react"

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
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertTitle>No se pudieron cargar los datos</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
      {onRetry ? (
        <AlertAction>
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
        </AlertAction>
      ) : null}
    </Alert>
  )
}
