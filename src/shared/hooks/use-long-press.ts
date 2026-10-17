"use client"

import {
  hasMovedBeyondLongPressSlop,
  LONG_PRESS_MS,
} from "@/src/shared/lib/press-gesture"
import { useCallback, useEffect, useRef } from "react"
import type { DOMAttributes, PointerEvent, MouseEvent } from "react"

type PressOrigin = {
  x: number
  y: number
}

/**
 * Long press over a surface that also navigates: the press fires the action and
 * swallows the click that follows, so a tap still navigates normally.
 *
 * Returns the handlers to spread on the pressable element, or nothing when the
 * surface has no long press. The accessible path to the same action is a button.
 */
export function useLongPress(
  onLongPress?: () => void
): DOMAttributes<HTMLElement> {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const origin = useRef<PressOrigin | null>(null)
  const fired = useRef(false)

  const cancel = useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
    origin.current = null
  }, [])

  useEffect(() => cancel, [cancel])

  if (!onLongPress) {
    return {}
  }

  return {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      if (event.button !== 0) {
        return
      }
      origin.current = { x: event.clientX, y: event.clientY }
      timer.current = setTimeout(() => {
        fired.current = true
        cancel()
        onLongPress()
      }, LONG_PRESS_MS)
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (!origin.current) {
        return
      }
      if (
        hasMovedBeyondLongPressSlop(origin.current, {
          x: event.clientX,
          y: event.clientY,
        })
      ) {
        cancel()
      }
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onClickCapture: (event: MouseEvent<HTMLElement>) => {
      if (!fired.current) {
        return
      }
      fired.current = false
      event.preventDefault()
      event.stopPropagation()
    },
    onContextMenu: (event: MouseEvent<HTMLElement>) => {
      event.preventDefault()
    },
  }
}
