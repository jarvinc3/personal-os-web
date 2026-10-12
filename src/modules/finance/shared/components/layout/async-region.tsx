import type { ReactNode } from "react"

type AsyncRegionProps = {
  pending: boolean
  pendingFallback: ReactNode
  empty: boolean
  emptyFallback: ReactNode
  children: ReactNode
}

export function AsyncRegion({
  pending,
  pendingFallback,
  empty,
  emptyFallback,
  children,
}: AsyncRegionProps) {
  if (pending) {
    return pendingFallback
  }
  if (empty) {
    return emptyFallback
  }
  return children
}
