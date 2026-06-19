'use client';

import { PendingAccountDeletionHandler } from '@/src/modules/settings/components/pending-account-deletion-handler';
import { AppShell } from '@/src/shared/components/layout/app-sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <PendingAccountDeletionHandler />
      {children}
    </AppShell>
  );
}
