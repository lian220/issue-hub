"use client";

import { useState } from "react";
import { Search, Bell, Sparkles, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[220px] p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="메뉴 열기"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search issues, policies, or users..."
            className="pl-9"
            aria-label="검색"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="알림"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label="AI Insights"
          >
            <Sparkles className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3 ml-2">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium leading-none">Admin</p>
              <p className="text-xs text-muted-foreground">관리자</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">AD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
    </>
  );
}
