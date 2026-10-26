"use client"

import { PendingAccountDeletionHandler } from "@/src/modules/settings/components/pending-account-deletion-handler"
import { PendingDataWipeHandler } from "@/src/modules/settings/components/pending-data-wipe-handler"
import { ReleaseNotes } from "@/src/modules/settings/components/release-notes"
import { useTimeZoneSync } from "@/src/modules/settings/hooks/use-time-zone-sync"
import { KeepAwakeProvider } from "@/src/modules/keep-awake/context/keep-awake-context"
import { AppHeader } from "@/src/shared/components/shell/header/app-header"
import { AppSidebar } from "@/src/shared/components/shell/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/src/shared/components/ui/sidebar"
import { HeaderProvider } from "@/src/shared/context/header-context"
import { usePathname } from "next/navigation"
import { useLayoutEffect, useRef, Suspense } from "react"

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
  useTimeZoneSync()

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
              {/* La hoja lee la URL para abrirse por ruta; el resto del shell no espera por ella. */}
              <Suspense fallback={null}>
                <ReleaseNotes />
              </Suspense>
              {children}
            </KeepAwakeProvider>
          </main>
        </SidebarInset>
      </HeaderProvider>
    </SidebarProvider>
  )
}
