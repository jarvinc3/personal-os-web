"use client"

import { useEffect } from "react"

export function useSheetListEntity<T extends { id: string }>(
  open: boolean,
  sheetId: string | null,
  items: T[] | undefined,
  isPending: boolean,
  setOpen: (open: boolean) => void,
  requireId = false
): T | null {
  const item = sheetId
    ? (items?.find((entry) => entry.id === sheetId) ?? null)
    : null

  useEffect(() => {
    if (!open) {
      return
    }
    if (!sheetId) {
      if (requireId) {
        setOpen(false)
      }
      return
    }
    if (isPending) {
      return
    }
    if (!item) {
      setOpen(false)
    }
  }, [open, sheetId, isPending, item, requireId, setOpen])

  return item
}

export function useSheetQueryEntity<T>(
  open: boolean,
  sheetId: string | null,
  query: {
    data: T | undefined
    isPending: boolean
    isError: boolean
  },
  setOpen: (open: boolean) => void,
  requireId = false
): T | null {
  useEffect(() => {
    if (!open) {
      return
    }
    if (!sheetId) {
      if (requireId) {
        setOpen(false)
      }
      return
    }
    if (query.isPending) {
      return
    }
    if (query.isError || query.data == null) {
      setOpen(false)
    }
  }, [
    open,
    sheetId,
    query.isPending,
    query.isError,
    query.data,
    requireId,
    setOpen,
  ])

  return query.data ?? null
}
