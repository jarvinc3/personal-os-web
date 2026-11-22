"use client"

import { InfiniteListErrorFooter } from "@/src/shared/components/feedback/infinite-list-error-footer"
import { InfiniteListSentinel } from "@/src/shared/components/feedback/infinite-list-sentinel"

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
      <InfiniteListErrorFooter
        title="No se pudieron cargar más notificaciones"
        description="La lista conserva los avisos que ya tenías."
        isRetrying={isFetchingNextPage}
        onRetry={onLoadMore}
      />
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
