"use client"

import { ModuleTabBar } from "@/src/shared/components/layout/module-tab-bar"
import type { ModuleNavItem } from "@/src/shared/types/module-nav"
import type { ReactNode } from "react"

type ModuleSectionLayoutProps = {
  children: ReactNode
  items: ModuleNavItem[]
  ariaLabel: string
}

export function ModuleSectionLayout({
  children,
  items,
  ariaLabel,
}: ModuleSectionLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:px-6 md:pb-16">
      {children}
      <ModuleTabBar items={items} ariaLabel={ariaLabel} />
    </div>
  )
}
