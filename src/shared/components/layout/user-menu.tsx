'use client';

import { useAuth } from '@/src/modules/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/src/shared/components/ui/avatar';
import { Button } from '@/src/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/shared/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/src/shared/components/ui/sidebar';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import { useAppStore } from '@/src/shared/store/app-store';
import { ChevronsUpDown, LogOut } from 'lucide-react';
import Link from 'next/link';

type UserMenuProps = {
  variant?: 'sidebar' | 'header';
};

function UserAvatar({ displayName, avatarUrl }: { displayName: string; avatarUrl?: string }) {
  return (
    <Avatar className="size-8 rounded-lg">
      {avatarUrl ? <AvatarImage src={avatarUrl} alt={displayName} /> : null}
      <AvatarFallback className="rounded-lg">
        {displayName.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

export function UserMenu({ variant = 'sidebar' }: UserMenuProps) {
  const user = useAppStore((state) => state.user);
  const { logoutMutation } = useAuth();

  const displayName = user?.fullName ?? 'Usuario';
  const email = user?.email ?? '';
  const avatarUrl = user?.profile?.avatarUrl ?? user?.avatarUrl;

  if (!user) {
    return null;
  }

  const menuContent = (
    <DropdownMenuContent
      className="min-w-56 rounded-lg"
      side="bottom"
      align="end"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserAvatar displayName={displayName} avatarUrl={avatarUrl} />
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground">{email}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href={APP_ROUTES.app.settings}>Ajustes</Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        variant="destructive"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        <LogOut />
        Cerrar sesión
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (variant === 'header') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="size-10 shrink-0 rounded-full">
            <UserAvatar displayName={displayName} avatarUrl={avatarUrl} />
          </Button>
        </DropdownMenuTrigger>
        {menuContent}
      </DropdownMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar displayName={displayName} avatarUrl={avatarUrl} />
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs text-muted-foreground">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          {menuContent}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
