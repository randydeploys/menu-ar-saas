"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconInnerShadowTop,
  IconQrcode,
  IconSettings,
  IconUsers,
  IconBuildingStore,
  IconClipboardList,
  IconBowl,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { User } from "better-auth";
import { UserPlan } from "@/app/generated/prisma/enums";

/**
 * Extend better-auth User to include your app fields (plan).
 * If your `user` already contains `plan`, you can remove this.
 */
type UserWithPlan = User & { plan?: UserPlan };

type NavItem = {
  title: string;
  url: string;
  icon: any;
  proOnly?: boolean;
  badge?: "Pro";
  disabled?: boolean;
  locked?: boolean;
};

const navMainBase: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: IconDashboard },

  { title: "Restaurants", url: "/restaurants", icon: IconBuildingStore },
  { title: "Menus", url: "/menus", icon: IconClipboardList },
  { title: "Dishes", url: "/dishes", icon: IconBowl },
  { title: "QR Codes", url: "/qr-codes", icon: IconQrcode },

  { title: "Analytics", url: "/analytics", icon: IconChartBar, proOnly: true, badge: "Pro" },
  { title: "Media", url: "/media", icon: IconFolder, proOnly: true, badge: "Pro" },
  { title: "Team", url: "/team", icon: IconUsers, proOnly: true, badge: "Pro" },

  { title: "Settings", url: "/settings", icon: IconSettings },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: UserWithPlan;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const isPro = user?.plan === UserPlan.Pro;

  const navMain = React.useMemo(() => {
    return navMainBase.map((item) => {
      if (!item.proOnly) return item;
      if (isPro) return item;

      // Free user -> show Pro tabs but disabled + locked
      return {
        ...item,
        disabled: true,
        locked: true,
        badge: "Pro",
      };
    });
  }, [isPro]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Menu AR SaaS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user as any} />
      </SidebarFooter>
    </Sidebar>
  );
}
