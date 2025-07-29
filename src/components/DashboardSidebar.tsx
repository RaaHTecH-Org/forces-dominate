import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Settings,
  ShoppingBag,
  Heart,
  CreditCard,
  Bell,
  LogOut,
  Zap,
  Bot
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Target Bot", url: "/dashboard/bot", icon: Bot },
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
  { title: "Wishlist", url: "/dashboard/wishlist", icon: Heart },
  { title: "Billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r border-border/50`}>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-foreground">BLACKFORCES</h2>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`${
                      isActive(item.url)
                        ? "bg-primary/10 text-primary border-l-2 border-primary"
                        : "hover:bg-muted/50"
                    } transition-all duration-200`}
                  >
                    <NavLink to={item.url}>
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}