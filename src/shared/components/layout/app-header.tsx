'use client';

import { UserMenu } from '@/src/shared/components/layout/user-menu';
import { Separator } from '@/src/shared/components/ui/separator';
import { SidebarTrigger } from '@/src/shared/components/ui/sidebar';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { cn } from '@/src/shared/lib/utils';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  [APP_ROUTES.app.home]: 'Inicio',
  [APP_ROUTES.app.settings]: 'Ajustes',
};

function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }
  if (pathname.startsWith(APP_ROUTES.app.settings)) {
    return 'Ajustes';
  }
  return 'Personal OS';
}

export function AppHeader() {
  const pathname = usePathname();
  const title = resolvePageTitle(pathname);

  return (
    <header
      className={cn(
        'sticky top-0 z-10 flex min-h-14 shrink-0 items-center gap-2 border-b border-border',
        'bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:min-h-16',
      )}
    >
      <SidebarTrigger />
      <Separator orientation="vertical" className="mr-1 h-5" />
      <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground md:text-lg">
        {title}
      </h1>
      <UserMenu variant="header" />
    </header>
  );
}
