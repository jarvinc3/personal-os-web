"use client"

import { withTabQuery } from "@/src/shared/lib/tab-query"
import { cn } from "@/src/shared/lib/utils"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"

const TAB_QUERY_KEY = "tab"
const SWIPE_DISTANCE_PX = 56

function subscribeToNothing() {
  return () => {}
}

/**
 * The server cannot measure the active tab, so the first render puts the
 * indicator in the corner. Transitions wait for hydration to move it.
 */
function useHasHydrated() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  )
}

function tabMemoryKey(pathname: string, key: string) {
  return `personal-os:tab:${pathname}:${key}`
}

/**
 * Storage is optional: private mode rejects it, and the query string still
 * records the tab, so the failure is reported and the tab keeps working.
 */
function reportTabStorageFailure(action: "read" | "write", error: unknown) {
  if (process.env.NODE_ENV !== "development") {
    return
  }
  console.warn(`[tabs] sessionStorage ${action} failed: ${String(error)}`)
}

function readTabMemory(pathname: string, key: string): string | null {
  try {
    return sessionStorage.getItem(tabMemoryKey(pathname, key))
  } catch (error) {
    reportTabStorageFailure("read", error)
    return null
  }
}

function writeTabMemory(pathname: string, key: string, value: string) {
  try {
    sessionStorage.setItem(tabMemoryKey(pathname, key), value)
  } catch (error) {
    reportTabStorageFailure("write", error)
  }
}

function persistTab(
  pathname: string,
  key: string,
  value: string,
  searchParams: ReturnType<typeof useSearchParams>,
  router: ReturnType<typeof useRouter>
) {
  writeTabMemory(pathname, key, value)
  const nextUrl = withTabQuery(pathname, searchParams.toString(), key, value)
  if (!nextUrl) {
    return
  }
  router.replace(nextUrl, { scroll: false })
}

type TabsProps = TabsPrimitive.Root.Props & {
  /**
   * Stores the active tab in the query string so Back restores it.
   * Sheets that reset their own tab should pass false.
   */
  persist?: boolean
  /** Query key used when `persist` is on. */
  persistKey?: string
}

function Tabs({
  className,
  orientation = "horizontal",
  persist = true,
  persistKey = TAB_QUERY_KEY,
  value,
  defaultValue,
  onValueChange,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  ...props
}: TabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const rootRef = useRef<HTMLDivElement>(null)
  const swipeRef = useRef<{ x: number; y: number; pointerId: number } | null>(
    null
  )
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
    const fromUrl = initialUrlValue
    const remembered =
      fromUrl ?? (persist ? readTabMemory(pathname, persistKey) : null)
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
    persistTab(pathname, persistKey, String(value), searchParams, router)
  }, [pathname, persist, persistKey, router, searchParams, value])

  function changeTabBy(direction: 1 | -1) {
    const root = rootRef.current
    if (!root) {
      return
    }
    const tabs = [...root.querySelectorAll<HTMLElement>('[role="tab"]')]
    const index = tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true"
    )
    const next = tabs[index + direction]
    if (!next || next.getAttribute("aria-disabled") === "true") {
      return
    }
    next.click()
  }

  return (
    <TabsPrimitive.Root
      {...props}
      ref={rootRef}
      data-slot="tabs"
      data-sidebar-swipe-ignore=""
      data-orientation={orientation}
      orientation={orientation}
      value={isControlled ? resolvedValue : undefined}
      defaultValue={
        isControlled ? undefined : (initialUrlValue ?? defaultValue)
      }
      onValueChange={(next, details) => {
        onValueChange?.(next, details)
        if (!persist || details.reason !== "none" || next == null) {
          return
        }
        persistTab(pathname, persistKey, String(next), searchParams, router)
      }}
      className={cn(
        "group/tabs relative flex touch-pan-y gap-2 data-horizontal:grid! data-horizontal:grid-cols-1",
        className
      )}
      onPointerDown={(event) => {
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
        swipeRef.current = {
          x: event.clientX,
          y: event.clientY,
          pointerId: event.pointerId,
        }
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event)
        const start = swipeRef.current
        swipeRef.current = null
        if (!start || start.pointerId !== event.pointerId) {
          return
        }
        const deltaX = event.clientX - start.x
        const deltaY = event.clientY - start.y
        if (
          Math.abs(deltaX) < SWIPE_DISTANCE_PX ||
          Math.abs(deltaX) < Math.abs(deltaY)
        ) {
          return
        }
        changeTabBy(deltaX < 0 ? 1 : -1)
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event)
        swipeRef.current = null
      }}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex w-fit items-center justify-center rounded-4xl p-[3px] text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col group-data-vertical/tabs:rounded-2xl data-[variant=line]:rounded-none",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  children,
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  const ready = useHasHydrated()

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    >
      {variant === "default" ? (
        <TabsPrimitive.Indicator
          data-slot="tabs-indicator"
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-0 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) translate-y-(--active-tab-top) rounded-[inherit] bg-background dark:border dark:border-input dark:bg-input/30",
            ready
              ? "transition-[translate,width,height] duration-300 ease-out motion-reduce:transition-none"
              : "transition-none"
          )}
        />
      ) : null}
      {children}
    </TabsPrimitive.List>
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "relative z-10 inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-xl border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:px-2.5 group-data-vertical/tabs:py-1.5 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:text-foreground dark:data-active:text-foreground",
        "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:-bottom-1.25 group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "relative z-10 flex-1 text-sm outline-none group-data-horizontal/tabs:col-start-1 group-data-horizontal/tabs:row-start-2",
        "transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
        "data-ending-style:pointer-events-none data-ending-style:z-0 data-ending-style:opacity-0 data-starting-style:opacity-0",
        "data-[activation-direction=left]:data-starting-style:-translate-x-4 data-[activation-direction=right]:data-starting-style:translate-x-4",
        "data-[activation-direction=left]:data-ending-style:translate-x-4 data-[activation-direction=right]:data-ending-style:-translate-x-4",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger }
