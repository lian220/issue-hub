"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CircleDot,
  FolderKanban,
  Shield,
  Zap,
  Plug,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/nav-config";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ICON_MAP = {
  LayoutDashboard,
  CircleDot,
  FolderKanban,
  Shield,
  Zap,
  Plug,
  BarChart3,
  Settings,
} as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r bg-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2">
            <CircleDot className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">IssueHub</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto">
            <CircleDot className="h-6 w-6 text-primary" />
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4" role="navigation" aria-label="메인 내비게이션">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active = isActive(item.href);

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex h-10 w-full items-center justify-center rounded-md transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{item.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center"
          aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
}
