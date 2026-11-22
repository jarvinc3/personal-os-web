"use client"

import {
  ModuleFabProvider,
  useModuleFabRegistration,
} from "@/src/shared/components/fab/module-fab-context"
import { ModuleTabBar } from "@/src/shared/components/shell/module-tab-bar"
import { useHeaderContext } from "@/src/shared/context/header-context"
import { useRegisterTabBarVisible } from "@/src/shared/context/tab-bar-context"
import { cn } from "@/src/shared/lib/utils"
import type { ModuleNavItem } from "@/src/shared/types/module-nav"
import type { ReactNode } from "react"

type ModuleSectionLayoutProps = {
  children: ReactNode
  items: ModuleNavItem[]
  ariaLabel: string
  onItemPrefetch?: (href: string) => void
}

export function ModuleSectionLayout({
  children,
  items,
  ariaLabel,
  onItemPrefetch,
}: ModuleSectionLayoutProps) {
  const { config } = useHeaderContext()
  const hideTabBar = config.variant === "secondary"
  useRegisterTabBarVisible(!hideTabBar)

  return (
    <ModuleFabProvider tabBarVisible={!hideTabBar}>
      <ModuleSectionContent
        items={items}
        ariaLabel={ariaLabel}
        onItemPrefetch={onItemPrefetch}
        hideTabBar={hideTabBar}
      >
        {children}
      </ModuleSectionContent>
    </ModuleFabProvider>
  )
}

type ModuleSectionContentProps = ModuleSectionLayoutProps & {
  hideTabBar: boolean
}

/** Relleno inferior del contenido: deja aire para el tab bar y para el botón flotante. */
function contentBottomPadding({
  hideTabBar,
  needsMobileFabSpace,
}: {
  hideTabBar: boolean
  needsMobileFabSpace: boolean
}): string {
  if (hideTabBar) {
    return "pb-4"
  }
  if (needsMobileFabSpace) {
    return "pb-[calc(9rem+env(safe-area-inset-bottom))]"
  }
  return "pb-[calc(6rem+env(safe-area-inset-bottom))]"
}

function ModuleSectionContent({
  children,
  items,
  ariaLabel,
  onItemPrefetch,
  hideTabBar,
}: ModuleSectionContentProps) {
  // El botón flotante vive en la esquina inferior derecha: sin su carril tapa
  // badges y contadores de las filas que pasan por debajo.
  const fab = useModuleFabRegistration()
  const hasFab = fab !== null
  const needsMobileFabSpace = !hideTabBar && fab?.mobileVisible === true

  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:pb-16",
        hasFab ? "md:pr-20 md:pl-6" : "md:px-6",
        contentBottomPadding({ hideTabBar, needsMobileFabSpace })
      )}
    >
      {children}
      {hideTabBar ? null : (
        <ModuleTabBar
          items={items}
          ariaLabel={ariaLabel}
          onItemPrefetch={onItemPrefetch}
        />
      )}
    </div>
  )
}
