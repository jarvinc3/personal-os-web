"use client"

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
        <SidebarInset>
          <AppHeader />
          <main className="flex-1 overflow-auto">
            <PendingAccountDeletionHandler />
            {children}
          </main>
        </SidebarInset>
      </HeaderProvider>
    </SidebarProvider>
  )
}
