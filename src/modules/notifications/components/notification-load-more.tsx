"use client"

import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/src/shared/components/ui/alert"
import { Button } from "@/src/shared/components/ui/button"
import { AlertCircleIcon, RotateCcwIcon } from "lucide-react"

type NotificationLoadMoreProps = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  hasError: boolean
  onLoadMore: () => void
}

/**
 * Pie de la bandeja: carga la siguiente tanda al bajar con el centinela
 * compartido y, si la tanda falla, la deja reintentar sin perder lo cargado.
 */
export function NotificationLoadMore({
  hasNextPage,
  isFetchingNextPage,
  hasError,
  onLoadMore,
}: NotificationLoadMoreProps) {
  if (hasError) {
    return (
      <Alert variant="default" role="status">
        <AlertCircleIcon className="size-4 shrink-0" aria-hidden="true" />
        <AlertTitle>No se pudieron cargar más notificaciones</AlertTitle>
        <AlertDescription>
          La lista conserva los avisos que ya tenías.
        </AlertDescription>
        <AlertAction>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onLoadMore}
            disabled={isFetchingNextPage}
          >
            <RotateCcwIcon aria-hidden="true" />
            Reintentar
          </Button>
        </AlertAction>
      </Alert>
    )
  }

  return (
    <InfiniteListSentinel
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      onLoadMore={onLoadMore}
    />
  )
}
