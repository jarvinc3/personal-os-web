"use client"

import { useEffect, useRef } from "react"

import { Button } from "@/src/shared/components/ui/button"

export type InfiniteListSentinelProps = {
  hasNextPage: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  loadingLabel?: string
  idleLabel?: string
}

/**
 * Loads the next cursor page when it enters the viewport, with an explicit
 * button as the accessible fallback when the auto-load does not trigger.
 */
export function InfiniteListSentinel({
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  loadingLabel = "Cargando…",
  idleLabel = "Cargar más",
}: InfiniteListSentinelProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const canLoadMore = hasNextPage && !isFetchingNextPage

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !canLoadMore) {
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        onLoadMore()
      }
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [canLoadMore, onLoadMore])

  if (!hasNextPage) {
    return null
  }

  return (
    <div ref={sentinelRef} className="flex justify-center py-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isFetchingNextPage}
        onClick={onLoadMore}
      >
        {isFetchingNextPage ? loadingLabel : idleLabel}
      </Button>
    </div>
  )
}
