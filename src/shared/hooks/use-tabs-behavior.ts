"use client"

import type { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { getTabSwipeDirection } from "@/src/shared/lib/tab-swipe"
import { withTabQuery } from "@/src/shared/lib/tab-query"

export const TAB_QUERY_KEY = "tab"
const TAB_MEMORY_PREFIX = "personal-os:tab:"

type TabsRootProps = TabsPrimitive.Root.Props

type TabsBehaviorOptions = Pick<
  TabsRootProps,
  | "defaultValue"
  | "onPointerCancel"
  | "onPointerDown"
  | "onPointerUp"
  | "onValueChange"
  | "orientation"
  | "value"
> & {
  persist?: boolean
  persistKey?: string
}

type TabMemoryInput = {
  pathname: string
  persistKey: string
}

type TabMemoryWriteInput = TabMemoryInput & {
  value: string
}

type PersistTabInput = {
  pathname: string
  key: string
  value: string
  searchParams: ReturnType<typeof useSearchParams>
  router: ReturnType<typeof useRouter>
}

type SwipeStart = {
  x: number
  y: number
  pointerId: number
}

function tabMemoryKey({ pathname, persistKey }: TabMemoryInput): string {
  return `${TAB_MEMORY_PREFIX}${pathname}:${persistKey}`
}

function reportTabStorageFailure(
  action: "read" | "write",
  error: unknown
): void {
  if (process.env.NODE_ENV !== "development") {
    return
  }
  console.warn(`[tabs] sessionStorage ${action} failed: ${String(error)}`)
}

function readTabMemory({
  pathname,
  persistKey,
}: TabMemoryInput): string | null {
  try {
    return sessionStorage.getItem(tabMemoryKey({ pathname, persistKey }))
  } catch (error) {
    reportTabStorageFailure("read", error)
    return null
  }
}

function writeTabMemory({
  pathname,
  persistKey,
  value,
}: TabMemoryWriteInput): void {
  try {
    sessionStorage.setItem(tabMemoryKey({ pathname, persistKey }), value)
  } catch (error) {
    reportTabStorageFailure("write", error)
  }
}

function persistTab({
  pathname,
  key,
  value,
  searchParams,
  router,
}: PersistTabInput): void {
  writeTabMemory({ pathname, persistKey: key, value })
  const nextUrl = withTabQuery(pathname, searchParams.toString(), key, value)
  if (!nextUrl) {
    return
  }
  router.replace(nextUrl, { scroll: false })
}

function changeTabBy(root: HTMLElement, direction: -1 | 1): void {
  const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')]
  const index = tabs.findIndex(
    (tab) => tab.getAttribute("aria-selected") === "true"
  )
  const nextTab = tabs[index + direction]
  if (!nextTab || nextTab.getAttribute("aria-disabled") === "true") {
    return
  }
  nextTab.click()
}

export function useTabsBehavior({
  defaultValue,
  onPointerCancel,
  onPointerDown,
  onPointerUp,
  onValueChange,
  orientation = "horizontal",
  persist = true,
  persistKey = TAB_QUERY_KEY,
  value,
}: TabsBehaviorOptions) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const swipeStartRef = useRef<SwipeStart | null>(null)
  const urlValue = persist ? searchParams.get(persistKey) : null
  const [initialUrlValue] = useState(urlValue)
  const urlAppliedRef = useRef(false)
  const [urlApplied, setUrlApplied] = useState(false)
  const skipQueryWrite = useRef(true)
  const isControlled = value !== undefined
  const resolvedValue =
    !urlApplied && initialUrlValue != null ? initialUrlValue : value

  useLayoutEffect(() => {
    if (urlAppliedRef.current) {
      return
    }
    urlAppliedRef.current = true
    const remembered =
      initialUrlValue ??
      (persist ? readTabMemory({ pathname, persistKey }) : null)
    if (persist && remembered != null && remembered !== String(value ?? "")) {
      onValueChange?.(remembered, undefined as never)
    }
    setUrlApplied(true)
  }, [initialUrlValue, onValueChange, pathname, persist, persistKey, value])

  useEffect(() => {
    if (!persist || value == null) {
      return
    }
    if (skipQueryWrite.current) {
      skipQueryWrite.current = false
      return
    }
    persistTab({
      pathname,
      key: persistKey,
      value: String(value),
      searchParams,
      router,
    })
  }, [pathname, persist, persistKey, router, searchParams, value])

  function handleValueChange(
    next: Parameters<NonNullable<TabsRootProps["onValueChange"]>>[0],
    details: Parameters<NonNullable<TabsRootProps["onValueChange"]>>[1]
  ): void {
    onValueChange?.(next, details)
    if (!persist || details.reason !== "none" || next == null) {
      return
    }
    persistTab({
      pathname,
      key: persistKey,
      value: String(next),
      searchParams,
      router,
    })
  }

  function handlePointerDown(
    event: Parameters<NonNullable<TabsRootProps["onPointerDown"]>>[0]
  ): void {
    onPointerDown?.(event)
    if (orientation !== "horizontal" || event.button !== 0) {
      return
    }
    const target = event.target
    if (!(target instanceof Element)) {
      return
    }
    if (target.closest('[data-slot="tabs-list"]')) {
      return
    }
    if (event.clientX < 24) {
      return
    }
    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
    }
  }

  function handlePointerUp(
    event: Parameters<NonNullable<TabsRootProps["onPointerUp"]>>[0]
  ): void {
    onPointerUp?.(event)
    const swipeStart = swipeStartRef.current
    swipeStartRef.current = null
    if (!swipeStart || swipeStart.pointerId !== event.pointerId) {
      return
    }
    const direction = getTabSwipeDirection({
      deltaX: event.clientX - swipeStart.x,
      deltaY: event.clientY - swipeStart.y,
    })
    if (direction == null) {
      return
    }
    changeTabBy(event.currentTarget, direction)
  }

  function handlePointerCancel(
    event: Parameters<NonNullable<TabsRootProps["onPointerCancel"]>>[0]
  ): void {
    onPointerCancel?.(event)
    swipeStartRef.current = null
  }

  return {
    defaultValue: isControlled ? undefined : (initialUrlValue ?? defaultValue),
    value: isControlled ? resolvedValue : undefined,
    onValueChange: handleValueChange,
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerCancel: handlePointerCancel,
  }
}
