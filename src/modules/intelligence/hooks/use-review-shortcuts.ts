"use client"

import { useEffect, useRef } from "react"
import {
  resolveReviewShortcut,
  type ReviewShortcut,
} from "@/src/modules/intelligence/review-shortcuts"

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

const OPEN_SELECTOR_SELECTORS = [
  '[data-slot="select-content"]',
  '[data-slot="popover-content"]',
  '[role="listbox"]',
]

/** Un campo de texto o un selector abierto se queda con las teclas. */
export function isShortcutBlockedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }
  if (target.isContentEditable || TYPING_TAGS.has(target.tagName)) {
    return true
  }
  return OPEN_SELECTOR_SELECTORS.some(
    (selector) => target.closest(selector) !== null
  )
}

type ReviewShortcutListener = {
  enabled: boolean
  onShortcut: (shortcut: ReviewShortcut) => void
}

export function useReviewShortcutListener({
  enabled,
  onShortcut,
}: ReviewShortcutListener) {
  const onShortcutRef = useRef(onShortcut)

  useEffect(() => {
    onShortcutRef.current = onShortcut
  })

  useEffect(() => {
    if (!enabled) {
      return
    }
    function handleKeyDown(event: KeyboardEvent) {
      const shortcut = resolveReviewShortcut({
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        isBlockedTarget: isShortcutBlockedTarget(event.target),
      })
      if (!shortcut) {
        return
      }
      event.preventDefault()
      onShortcutRef.current(shortcut)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled])
}
