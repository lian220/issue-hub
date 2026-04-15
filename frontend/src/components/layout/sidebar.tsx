"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CircleDot,
  Shield,
  CheckCircle,
  Plug,
  Activity,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/config/nav-config";

const ICON_MAP = {
  LayoutDashboard,
  CircleDot,
  Shield,
  CheckCircle,
  Plug,
  Activity,
  Settings,
} as const;

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[220px] flex-col bg-sidebar">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <Link href="/" className="flex items-center gap-2">
          <CircleDot className="h-6 w-6 text-sidebar-primary" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-sidebar-foreground">
              IssueHub
            </span>
            <span className="text-[10px] text-sidebar-foreground/50">
              정밀 인텔리전스
            </span>
          </div>
        </Link>
      </div>

      <nav
        className="flex-1 space-y-1 px-2 py-4"
        role="navigation"
        aria-label="메인 내비게이션"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
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
    </aside>
  );
}
