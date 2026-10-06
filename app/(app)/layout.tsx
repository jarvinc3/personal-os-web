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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <HeaderProvider>
        <SidebarInset className="h-svh max-h-svh overflow-hidden">
          <AppHeader />
          <main className="scrollbar-hide min-h-0 flex-1 overflow-auto">
            <KeepAwakeProvider>
              <PendingAccountDeletionHandler />
              {children}
            </KeepAwakeProvider>
          </main>
        </SidebarInset>
      </HeaderProvider>
    </SidebarProvider>
  )
}
