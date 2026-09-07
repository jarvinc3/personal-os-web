"use client"

import { ModuleTabBar } from "@/src/shared/components/layout/module-tab-bar"
import { useHeaderContext } from "@/src/shared/context/header-context"
import { cn } from "@/src/shared/lib/utils"
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
  const { config } = useHeaderContext()
  const hideTabBar = config.variant === "secondary"

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:px-6 md:pb-16",
        hideTabBar
          ? "pb-4"
          : "pb-[calc(6rem+env(safe-area-inset-bottom))]",
      )}
    >
      {children}
      {hideTabBar ? null : (
        <ModuleTabBar items={items} ariaLabel={ariaLabel} />
      )}
    </div>
  )
}
