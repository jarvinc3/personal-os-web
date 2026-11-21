"use client"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import { AlertCircleIcon, RotateCcwIcon } from "lucide-react"

const DEFAULT_DESCRIPTION = "La lista conserva lo que ya cargaste."

type InfiniteListErrorFooterProps = {
  title: string
  description?: string
  isRetrying: boolean
  onRetry: () => void
}

/**
 * Pie de una lista infinita que falló al pedir la siguiente tanda: deja
 * reintentar sin borrar las filas que ya se ven.
 */
export function InfiniteListErrorFooter({
  title,
  description = DEFAULT_DESCRIPTION,
  isRetrying,
  onRetry,
}: InfiniteListErrorFooterProps) {
  return (
    <Alert variant="default" role="status">
      <AlertCircleIcon className="size-4 shrink-0" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <AlertAction>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onRetry}
          disabled={isRetrying}
        >
          <RotateCcwIcon aria-hidden="true" />
          Reintentar
        </Button>
      </AlertAction>
    </Alert>
  )
}
