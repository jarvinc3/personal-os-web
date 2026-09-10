"use client"

import type { ReactNode } from "react"

export function KeepAwakeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-16 md:px-6">
      {children}
    </div>
  )
}
