'use client';

import { Home, LandmarkIcon, LogOutIcon, LucideIcon, Settings, SparklesIcon } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/src/modules/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/src/shared/components/ui/sidebar';
import { APP_ROUTES } from '@/src/shared/constants/app-routes';
import Image from 'next/image';
import { appAssets } from '../../constants/app-assets';
import { Separator } from '../ui/separator';

const navItems = [
  { title: 'Inicio', url: APP_ROUTES.app.home, icon: Home },
  { title: 'Ajustes', url: APP_ROUTES.app.settings, icon: Settings },
];

export function AppSidebar() {
  const router = useRouter();
  const { logoutMutation } = useAuth();

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => router.push(APP_ROUTES.app.home)}>
              <Image
                src={appAssets.iconLight}
                alt="Personal OS"
                width={24}
                height={24}
                className="rounded"
              />
              <span className="text-base font-semibold">Personal OS</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain groupLabel="Menú principal" items={navItems} />
        <Separator />
        <NavMain groupLabel="Aplicaciones" items={[{ title: 'Finanzas', url: '', icon: LandmarkIcon }]} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="md"
            >
              <SparklesIcon className="text-destructive" size={16} />
              Agente IA
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Separator />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logoutMutation.mutate()}
              variant="destructive"
              size="md"
            >
              <LogOutIcon className="text-destructive" size={16} />
              Cerrar sesión
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function NavMain({
  groupLabel,
  items,
}: {
  groupLabel: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
  }[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>
        {groupLabel}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={pathname === item.url}
                onClick={() => router.push(item.url)}
                size="md"
              >
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
