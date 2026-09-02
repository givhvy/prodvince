"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { AstrixLogo } from "./logo";
import { SidebarToggleIcon } from "./icons";
import { useTheme } from "./theme-provider";
import { useStudioUser } from "@/components/studio/studio-user-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { workspaceNavigation, type NavigationItem } from "../../data";
import { cn } from "@/lib/index";

const dropdownTriggerClassName =
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm ring-sidebar-ring outline-hidden transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0";

function isNavActive(pathname: string, href: string) {
  if (href === "/studio") return pathname === "/studio";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavItem({ item }: { item: NavigationItem }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const isActive = isNavActive(pathname, item.href);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        tooltip={item.name}
        className={cn(
          "h-auto [&_svg]:size-5",
          "group-data-[collapsible=icon]:size-12!",
          "group-data-[collapsible=icon]:px-3.5!",
        )}
      >
        <Link
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          onClick={() => {
            if (isMobile) setOpenMobile(false);
          }}
          className={cn(
            "group/nav flex h-12 w-full items-center gap-2.5 overflow-hidden rounded-xl px-3 py-2.5 text-muted-foreground hover:text-foreground",
            "transition-[width,padding] ease-linear",
            "aria-[current=page]:bg-sidebar-accent aria-[current=page]:text-primary aria-[current=page]:[filter:var(--shadow-sidebar-item)]",
          )}
        >
          <item.icon className="size-5" />
          <span className="truncate text-base group-data-[collapsible=icon]:hidden">
            {item.name}
          </span>
          {item.badge ? (
            <span className="ml-auto rounded-md bg-foreground/10 px-1.5 py-0.5 text-xs font-medium text-foreground group-data-[collapsible=icon]:hidden group-aria-[current=page]/nav:bg-primary/10 group-aria-[current=page]/nav:text-primary">
              {item.badge}
            </span>
          ) : null}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function DashboardSidebar() {
  const { toggleSidebar } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const user = useStudioUser();

  return (
    <Sidebar collapsible="icon" className="border-none">
      <SidebarHeader className="h-16 flex-row items-center justify-between px-3 transition-[padding] ease-linear group-data-[collapsible=icon]:px-4.25">
        <Link
          href="/studio"
          className="flex min-w-0 items-center gap-2 overflow-hidden group-data-[collapsible=icon]:hidden"
        >
          <AstrixLogo />
          <span className="truncate text-xl font-medium">ASTRIX</span>
        </Link>
        <Button
          variant="ghost"
          size="iconlg"
          onClick={toggleSidebar}
          className="ml-auto text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:size-12"
        >
          <SidebarToggleIcon className="size-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden px-3 py-4 transition-[padding] ease-linear group-data-[collapsible=icon]:px-4.25">
        <SidebarMenu className="gap-3">
          {workspaceNavigation.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-3 py-2 transition-[padding] ease-linear group-data-[collapsible=icon]:px-5.25">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                type="button"
                className={cn(
                  dropdownTriggerClassName,
                  "h-auto gap-2.5 overflow-hidden rounded-xl px-1.5 py-1.5 group-data-[collapsible=icon]:size-10! group-data-[collapsible=icon]:rounded-full! group-data-[collapsible=icon]:p-0!",
                )}
                aria-label="Account menu"
              >
                <Avatar className="size-10 after:border-[0.15625rem]">
                  <AvatarFallback>{user.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                  <p className="truncate text-base font-semibold">{user.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="start"
                side="top"
                className="astrix-dashboard w-56"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "dark" ? <Sun /> : <Moon />}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="text-destructive focus:text-destructive">
                  <Link href="/api/auth/logout">
                    <LogOut />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
