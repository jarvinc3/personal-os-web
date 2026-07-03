'use client';

import { useAuth } from '@/src/modules/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/shared/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/shared/components/ui/dropdown-menu';
import { Separator } from '@/src/shared/components/ui/separator';
import {
  SidebarTrigger
} from '@/src/shared/components/ui/sidebar';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { useScrollDirection } from '@/src/shared/hooks/use-scroll-direction';
import { cn } from '@/src/shared/lib/utils';
import { useAppStore } from '@/src/shared/store/app-store';
import { BellIcon, LogOutIcon, SettingsIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

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
  const user = useAppStore((state) => state.user);
  const { logoutMutation } = useAuth();
  const { hidden } = useScrollDirection();
  const router = useRouter();

  const displayName = user?.fullName ?? 'Usuario';
  const email = user?.email ?? '';
  const avatarUrl = user?.profile?.avatarUrl ?? user?.avatarUrl;
  const isHomePage = pathname === APP_ROUTES.app.home;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex py-2.5 shrink-0 items-center gap-2 bg-background/80 backdrop-blur-lg transition-transform duration-300 ease-in-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)",
        hidden && "-translate-y-full",
      )}
    >
      <div className="flex gap-1 items-center px-4 w-full lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <div className="flex flex-col flex-1">
          {isHomePage ? (
            <div>
              <p className="text-sm text-muted-foreground">Hola,</p>
              <p className="text-xl font-semibold">{displayName}</p>
            </div>
          ) : (
            <h1 className="text-lg font-bold tracking-tight md:text-xl">{title}</h1>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="rounded-lg size-8">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="rounded-lg">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="rounded-lg size-8">
                    {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
                    <AvatarFallback className="rounded-lg">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-sm leading-tight text-left">
                    <span className="font-medium truncate">{displayName}</span>
                    <span className="text-xs truncate text-muted-foreground">{email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup className="flex flex-col gap-2">
              <DropdownMenuItem onClick={() => { }}>
                <BellIcon />
                Notificaciones
              </DropdownMenuItem>
              <DropdownMenuItem
                active={pathname === APP_ROUTES.app.settings}
                onClick={() => router.push(APP_ROUTES.app.settings)}
              >
                <SettingsIcon />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOutIcon />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
