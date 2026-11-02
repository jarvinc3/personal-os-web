import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"

import {
  mergeOptimisticSheetParam,
  readSheetSearch,
  resolveSheetNavigation,
  type OptimisticSheetParam,
  type SheetCloseMode,
  SHEET_QUERY_KEY,
} from "@/src/shared/lib/sheet-navigation"

const sheetPushedByPath = new Map<string, boolean>()

function markSheetPushed(pathname: string) {
  sheetPushedByPath.set(pathname, true)
}

function clearSheetPushed(pathname: string) {
  sheetPushedByPath.delete(pathname)
}

function wasSheetPushed(pathname: string) {
  return sheetPushedByPath.get(pathname) === true
}

type NavigateSheetUrlInput = {
  router: ReturnType<typeof useRouter>
  pathname: string
  searchParams: { get(name: string): string | null; toString(): string }
  sheetKey: string
  open: boolean
  id?: string | null
  closeMode?: SheetCloseMode
}

function navigateSheetUrl({
  router,
  pathname,
  searchParams,
  sheetKey,
  open,
  id,
  closeMode = "back",
}: NavigateSheetUrlInput) {
  const decision = resolveSheetNavigation({
    pathname,
    searchParams,
    key: sheetKey,
    open,
    id,
    wasPushed: wasSheetPushed(pathname),
    closeMode,
  })

  switch (decision.action) {
    case "noop":
      return
    case "push":
      markSheetPushed(pathname)
      router.push(decision.url, { scroll: false })
      return
    case "replace":
      router.replace(decision.url, { scroll: false })
      return
    case "back":
      clearSheetPushed(pathname)
      router.back()
  }
}

export function useSheetParam(
  key: string,
  { closeMode = "back" }: { closeMode?: SheetCloseMode } = {}
) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [optimistic, setOptimistic] = useState<OptimisticSheetParam | null>(
    null
  )

  const url = useMemo(() => readSheetSearch(searchParams), [searchParams])
  const merged = useMemo(
    () => mergeOptimisticSheetParam(key, url, optimistic),
    [key, url, optimistic]
  )

  if (optimistic !== null && merged.dropOptimistic) {
    setOptimistic(null)
  }

  useEffect(() => {
    if (searchParams.get(SHEET_QUERY_KEY) === null) {
      clearSheetPushed(pathname)
    }
  }, [searchParams, pathname])

  const setOpen = useCallback(
    (value: boolean, id?: string | null) => {
      const from = readSheetSearch(searchParams)
      const current = mergeOptimisticSheetParam(key, from, optimistic)
      setOptimistic({
        open: value,
        sheetId: id === undefined ? current.sheetId : id,
        from,
      })
      navigateSheetUrl({
        router,
        pathname,
        searchParams,
        sheetKey: key,
        open: value,
        id,
        closeMode,
      })
    },
    [searchParams, key, router, pathname, optimistic, closeMode]
  )

  return { open: merged.open, sheetId: merged.sheetId, setOpen }
}

export { navigateSheetUrl }
export {
  SHEET_ID_QUERY_KEY,
  SHEET_QUERY_KEY,
} from "@/src/shared/lib/sheet-navigation"
