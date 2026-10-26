"use client"

import { useSidebar } from "@/src/shared/components/ui/sidebar"
import {
  hasSidebarSwipeBacktracked,
  opensSidebarOnRelease,
  resolveSidebarSwipeDecision,
  startsInsideSidebarEdge,
} from "@/src/shared/lib/sidebar-edge-swipe"
import { useEffect, useRef } from "react"

/**
 * Components that own a horizontal drag mark themselves with this attribute:
 * the menu never takes the gesture they handle.
 */
const SIDEBAR_SWIPE_IGNORE_ATTRIBUTE = "data-sidebar-swipe-ignore"

/**
 * Sheets, dialogs, pickers and menus unmount when they close, so any match here
 * means something is open over the page and the edge belongs to it.
 */
const OPEN_OVERLAY_SELECTOR = [
  '[data-slot="drawer-content"]',
  '[data-slot="alert-dialog-content"]',
  '[data-slot="select-content"]',
  '[data-slot="popover-content"]',
  '[data-slot="dropdown-menu-content"]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  '[role="menu"]',
  '[role="listbox"]',
].join(",")

/** A click may arrive a frame or two after the gesture opened the menu. */
const CLICK_SUPPRESSION_MS = 400

type SwipePhase = "pending" | "swipe"

type SwipeGesture = {
  pointerId: number
  startX: number
  startY: number
  startedAt: number
  furthestX: number
  phase: SwipePhase
}

function hasOpenOverlay(): boolean {
  return document.querySelector(OPEN_OVERLAY_SELECTOR) !== null
}

function scrollsInsideHorizontalSurface(target: Element): boolean {
  for (let node: Element | null = target; node; node = node.parentElement) {
    if (node.scrollLeft > 0 && node.scrollWidth > node.clientWidth) {
      return true
    }
  }
  return false
}

function keepsItsOwnDrag(target: Element): boolean {
  if (target.closest(`[${SIDEBAR_SWIPE_IGNORE_ATTRIBUTE}]`)) {
    return true
  }
  return scrollsInsideHorizontalSurface(target)
}

/**
 * Opens the mobile menu with a rightward drag that starts on the left edge.
 * The gesture is a shortcut: the header button and Ctrl/Cmd + B stay the
 * accessible path, so this hook only moves the panel's state.
 */
export function useSidebarEdgeSwipe(enabled: boolean) {
  const { isMobile, openMobile, setOpenMobile } = useSidebar()
  const gestureRef = useRef<SwipeGesture | null>(null)
  const swallowClickRef = useRef(false)

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!swallowClickRef.current) {
        return
      }
      swallowClickRef.current = false
      event.preventDefault()
      event.stopPropagation()
    }

    document.addEventListener("click", handleClick, true)
    return () => document.removeEventListener("click", handleClick, true)
  }, [])

  useEffect(() => {
    const listening = enabled && isMobile && !openMobile
    if (!listening) {
      return
    }

    const forgetGesture = () => {
      gestureRef.current = null
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !event.isPrimary) {
        return
      }
      if (!startsInsideSidebarEdge(event.clientX) || hasOpenOverlay()) {
        return
      }
      const surface = event.target
      if (surface instanceof Element && keepsItsOwnDrag(surface)) {
        return
      }
      gestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startedAt: event.timeStamp,
        furthestX: 0,
        phase: "pending",
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      const gesture = gestureRef.current
      if (!gesture || gesture.pointerId !== event.pointerId) {
        return
      }

      const offsetX = event.clientX - gesture.startX
      const offsetY = event.clientY - gesture.startY

      if (gesture.phase === "pending") {
        const decision = resolveSidebarSwipeDecision(offsetX, offsetY)
        if (decision === "reject") {
          forgetGesture()
          return
        }
        if (decision === "pending") {
          return
        }
        gesture.phase = "swipe"
      }

      gesture.furthestX = Math.max(gesture.furthestX, offsetX)
      if (hasSidebarSwipeBacktracked(gesture.furthestX, offsetX)) {
        forgetGesture()
      }
    }

    const handlePointerUp = (event: PointerEvent) => {
      const gesture = gestureRef.current
      forgetGesture()
      if (
        !gesture ||
        gesture.pointerId !== event.pointerId ||
        gesture.phase !== "swipe"
      ) {
        return
      }
      const opened = opensSidebarOnRelease({
        offsetX: event.clientX - gesture.startX,
        elapsedMs: event.timeStamp - gesture.startedAt,
      })
      if (!opened) {
        return
      }
      swallowClickRef.current = true
      window.setTimeout(() => {
        swallowClickRef.current = false
      }, CLICK_SUPPRESSION_MS)
      setOpenMobile(true)
    }

    document.addEventListener("pointerdown", handlePointerDown, true)
    document.addEventListener("pointermove", handlePointerMove, true)
    document.addEventListener("pointerup", handlePointerUp, true)
    document.addEventListener("pointercancel", forgetGesture, true)
    return () => {
      forgetGesture()
      document.removeEventListener("pointerdown", handlePointerDown, true)
      document.removeEventListener("pointermove", handlePointerMove, true)
      document.removeEventListener("pointerup", handlePointerUp, true)
      document.removeEventListener("pointercancel", forgetGesture, true)
    }
  }, [enabled, isMobile, openMobile, setOpenMobile])
}
