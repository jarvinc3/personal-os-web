'use client';

import { PendingAccountDeletionHandler } from '@/src/modules/settings/components/pending-account-deletion-handler';
import { AppHeader } from '@/src/shared/components/layout/app-header';
import { AppSidebar } from '@/src/shared/components/layout/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/src/shared/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <main className="overflow-auto flex-1">
          <PendingAccountDeletionHandler />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
