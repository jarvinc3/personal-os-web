"use client"

import { KeepAwakeProvider } from "@/src/modules/keep-awake/context/keep-awake-context"
import { PendingAccountDeletionHandler } from "@/src/modules/settings/components/pending-account-deletion-handler"
import { PendingDataWipeHandler } from "@/src/modules/settings/components/pending-data-wipe-handler"
import { AppHeader } from "@/src/shared/components/layout/app-header"
import { AppSidebar } from "@/src/shared/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/src/shared/components/ui/sidebar"
import { HeaderProvider } from "@/src/shared/context/header-context"
import { usePathname } from "next/navigation"
import { useLayoutEffect, useRef } from "react"

function ResetMainScroll({
  scrollerRef,
}: {
  scrollerRef: React.RefObject<HTMLElement | null>
}) {
  const pathname = usePathname()

  useLayoutEffect(() => {
    scrollerRef.current?.scrollTo(0, 0)
  }, [pathname, scrollerRef])

  return null
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const mainRef = useRef<HTMLElement>(null)

  return (
    <SidebarProvider>
      <AppSidebar />
      <HeaderProvider>
        <SidebarInset className="h-svh max-h-svh overflow-hidden">
          <AppHeader />
          <main
            ref={mainRef}
            className="scrollbar-hide min-h-0 flex-1 overflow-auto"
          >
            <ResetMainScroll scrollerRef={mainRef} />
            <KeepAwakeProvider>
              <PendingAccountDeletionHandler />
              <PendingDataWipeHandler />
              {children}
            </KeepAwakeProvider>
          </main>
        </SidebarInset>
      </HeaderProvider>
    </SidebarProvider>
  )
}
