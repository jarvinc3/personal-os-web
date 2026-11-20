"use client"

import {
  hasMovedBeyondLongPressSlop,
  LONG_PRESS_MS,
} from "@/src/shared/lib/press-gesture"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react"

type HoldProgressHandlers = {
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerUp: () => void
  onPointerLeave: () => void
  onPointerCancel: () => void
  onContextMenu: (event: ReactMouseEvent<HTMLElement>) => void
}

/**
 * Pulsación larga con anillo de progreso. Un clic normal sigue su curso; el
 * clic que el navegador emite después de una pulsación larga se descarta.
 */
export function useHoldProgress({
  onLongPress,
  disabled = false,
}: {
  onLongPress: () => void
  disabled?: boolean
}): {
  handlers: HoldProgressHandlers
  progress: number
  consumeSuppressedClick: () => boolean
} {
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef<{ x: number; y: number; at: number } | null>(null)
  const firedRef = useRef(false)
  const suppressClickRef = useRef(false)

  const clearTimers = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    startRef.current = null
    setProgress(0)
  }, [clearTimers])

  const fire = useCallback(() => {
    clearTimers()
    firedRef.current = true
    setProgress(100)
    onLongPress()
  }, [clearTimers, onLongPress])

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (disabled || event.button !== 0) {
        return
      }
      reset()
      firedRef.current = false
      suppressClickRef.current = false
      startRef.current = {
        x: event.clientX,
        y: event.clientY,
        at: performance.now(),
      }
      const step = () => {
        const start = startRef.current
        if (!start || firedRef.current) {
          return
        }
        const elapsed = performance.now() - start.at
        const next = Math.min(100, Math.round((elapsed / LONG_PRESS_MS) * 100))
        setProgress(next)
        if (next < 100) {
          frameRef.current = requestAnimationFrame(step)
        }
      }
      frameRef.current = requestAnimationFrame(step)
      timerRef.current = window.setTimeout(fire, LONG_PRESS_MS)
    },
    [disabled, fire, reset]
  )

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const start = startRef.current
      if (!start || firedRef.current) {
        return
      }
      if (
        hasMovedBeyondLongPressSlop(start, {
          x: event.clientX,
          y: event.clientY,
        })
      ) {
        reset()
      }
    },
    [reset]
  )

  const onPointerUp = useCallback(() => {
    if (firedRef.current) {
      suppressClickRef.current = true
    }
    reset()
  }, [reset])

  const onContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLElement>) => {
      if (disabled) {
        return
      }
      event.preventDefault()
      reset()
      firedRef.current = true
      suppressClickRef.current = true
      onLongPress()
    },
    [disabled, onLongPress, reset]
  )

  const consumeSuppressedClick = useCallback(() => {
    const suppressed = suppressClickRef.current
    suppressClickRef.current = false
    return suppressed
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  return {
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerLeave: reset,
      onPointerCancel: reset,
      onContextMenu,
    },
    progress,
    consumeSuppressedClick,
  }
}
