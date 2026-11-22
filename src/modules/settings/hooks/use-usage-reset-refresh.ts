"use client"

import {
  USAGE_RESET_MAX_RETRIES,
  USAGE_RESET_RETRY_MS,
  usageRefreshDelay,
  usageResetReached,
} from "@/src/modules/intelligence"
import type { EmailUsageSummary } from "@/src/modules/intelligence/types/intelligence.types"
import { useEffect } from "react"

type UseUsageResetRefreshInput = {
  summary: EmailUsageSummary | undefined
  refetch: () => Promise<{ data?: EmailUsageSummary }>
}

/**
 * Los contadores del back se reinician a medianoche UTC; la vista se refresca
 * una vez al cruzar el día para que la pausa y el reinicio no queden viejos.
 * El día sale de la hora del servidor y, si el reloj del navegador va
 * adelantado, se reintenta un minuto después.
 */
export function useUsageResetRefresh({
  summary,
  refetch,
}: UseUsageResetRefreshInput): void {
  useEffect(() => {
    if (!summary) {
      return
    }

    let timer: ReturnType<typeof setTimeout>
    let cancelled = false

    const schedule = (serverNow: string) => {
      const delay = usageRefreshDelay({ serverNow, clientNow: Date.now() })

      const refreshAtReset = async (attempt: number) => {
        const refetchResult = await refetch()

        if (cancelled) {
          return
        }

        const nextServerNow = refetchResult.data?.range.to

        if (
          nextServerNow &&
          usageResetReached({
            previousServerNow: serverNow,
            serverNow: nextServerNow,
          })
        ) {
          schedule(nextServerNow)
          return
        }

        if (attempt >= USAGE_RESET_MAX_RETRIES) {
          return
        }

        timer = setTimeout(
          () => void refreshAtReset(attempt + 1),
          USAGE_RESET_RETRY_MS
        )
      }

      timer = setTimeout(() => void refreshAtReset(1), delay)
    }

    schedule(summary.range.to)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [refetch, summary])
}
