"use client"

import { Spinner } from "@/src/shared/components/ui/spinner"
import type { ReactNode } from "react"

type SheetBodyProps = {
  pending?: boolean
  children: ReactNode
}

export function SheetBody({ pending = false, children }: SheetBodyProps) {
  return (
    <div
      data-base-ui-swipe-ignore=""
      className="scrollbar-hide flex flex-col gap-4 overflow-y-auto p-4"
    >
      {pending ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        children
      )}
    </div>
  )
}
