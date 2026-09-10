"use client"

import { KeepAwakeProvider } from "@/src/modules/keep-awake/context/keep-awake-context"
import { PendingAccountDeletionHandler } from "@/src/modules/settings/components/pending-account-deletion-handler"
import { AppHeader } from "@/src/shared/components/layout/app-header"
import { AppSidebar } from "@/src/shared/components/layout/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/src/shared/components/ui/sidebar"
import { HeaderProvider } from "@/src/shared/context/header-context"
import { ScrollChromeProvider } from "@/src/shared/context/scroll-chrome-context"
import { useState } from "react"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null)

  return (
    <SidebarProvider>
      <AppSidebar />
      <HeaderProvider>
        <ScrollChromeProvider scrollElement={scrollElement}>
          <SidebarInset>
            <AppHeader />
            <main ref={setScrollElement} className="flex-1 overflow-auto">
              <KeepAwakeProvider>
                <PendingAccountDeletionHandler />
                {children}
              </KeepAwakeProvider>
            </main>
          </SidebarInset>
        </ScrollChromeProvider>
      </HeaderProvider>
    </SidebarProvider>
  )
}
