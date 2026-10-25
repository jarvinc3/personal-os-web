"use client"

import { HeaderTitle } from "@/src/shared/components/shell/header/header-title"
import { PrimaryHeader } from "@/src/shared/components/shell/header/primary-header"
import { SecondaryHeader } from "@/src/shared/components/shell/header/secondary-header"
import { resolvePageTitle } from "@/src/shared/components/shell/header/page-title"
import { useHeaderContext } from "@/src/shared/context/header-context"
import { cn } from "@/src/shared/lib/utils"
import { usePathname, useRouter } from "next/navigation"
import { useTransition } from "react"

export function AppHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { config } = useHeaderContext()
  const [isBackPending, startBackTransition] = useTransition()

  const fallbackTitle = resolvePageTitle(pathname)
  const title = config.title ?? fallbackTitle

  const handleBack = () => {
    startBackTransition(() => {
      ;(config.onBack ?? (() => router.back()))()
    })
  }

  const accentColor =
    config.variant === "secondary" ? config.accentColor : undefined

  return (
    <header
      data-header-variant={config.variant}
      className={cn(
        "sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 bg-background py-2.5",
        accentColor && "bg-transparent text-white"
      )}
      style={accentColor ? { background: accentColor } : undefined}
    >
      {config.variant === "secondary" ? (
        <SecondaryHeader
          title={title}
          actions={config.actions}
          onBack={handleBack}
          pending={isBackPending}
          tinted={Boolean(accentColor)}
          backIcon={config.backIcon}
          backLabel={config.backLabel}
        />
      ) : (
        <PrimaryHeader
          title={
            config.subtitle ? (
              <HeaderTitle title={title} subtitle={config.subtitle} />
            ) : typeof title === "string" ? (
              <HeaderTitle title={title} />
            ) : (
              title
            )
          }
          actions={config.actions}
          showSidebarTrigger={config.showSidebarTrigger}
          showNotificationBell={config.showNotificationBell}
          showUserMenu={config.showUserMenu}
        />
      )}
    </header>
  )
}
