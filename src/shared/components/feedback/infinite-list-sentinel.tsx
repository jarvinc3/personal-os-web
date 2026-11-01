"use client"

import { ChevronDownIcon } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"

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
  const requestedRef = useRef(false)
  const canLoadMore = hasNextPage && !isFetchingNextPage

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !canLoadMore) {
      requestedRef.current = false
      return
    }
    const observer = new IntersectionObserver((entries) => {
      if (
        entries.some((entry) => entry.isIntersecting) &&
        !requestedRef.current
      ) {
        requestedRef.current = true
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
        onClick={() => {
          if (requestedRef.current) {
            return
          }
          requestedRef.current = true
          onLoadMore()
        }}
      >
        {isFetchingNextPage ? (
          <Spinner className="size-4" />
        ) : (
          <ChevronDownIcon className="size-4 shrink-0" />
        )}
        {isFetchingNextPage ? loadingLabel : idleLabel}
      </Button>
    </div>
  )
}
