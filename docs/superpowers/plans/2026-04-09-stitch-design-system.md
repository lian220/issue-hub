# Stitch "Forge Logic" 디자인 시스템 적용 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 IssueHub 프론트엔드에 Stitch "Forge Logic" 디자인 시스템을 적용하여 MVP 화면 설계서에 맞는 UI로 전환한다.

**Architecture:** 기존 shadcn/ui + Tailwind CSS v4 기반을 유지하면서 컬러 토큰, 폰트, 사이드바 레이아웃을 Stitch 디자인에 맞게 교체한다. 네비게이션 구조를 MVP 기획서 기준(7개 메뉴)으로 변경하고, 공통 비즈니스 컴포넌트를 추가한다.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, shadcn/ui, Manrope + Inter fonts, lucide-react icons

**Scope:** EP-MVP-1 (LIH-87) — 레이아웃 + 공통 컴포넌트. 개별 화면(대시보드, 이슈 등)은 별도 플랜.

**참조:**
- [화면 설계서](../../mvp/issuehub-mvp-화면설계.md)
- [Stitch 프로토타입](https://stitch.withgoogle.com/projects/12991689494621040728)
- Jira: LIH-101, LIH-102, LIH-103

---

## File Structure

| File | Action | Responsibility |
|------|--------|---------------|
| `src/app/globals.css` | Modify | Forge Logic 컬러 팔레트 적용 |
| `src/app/layout.tsx` | Modify | Manrope + Inter 폰트 설정 |
| `src/config/nav-config.ts` | Modify | MVP 7개 메뉴로 변경 |
| `src/components/layout/sidebar.tsx` | Modify | 220px 고정 + 다크 배경 + 새 메뉴 |
| `src/components/layout/header.tsx` | Modify | 검색 + 알림 + AI Insights + 프로필 |
| `src/components/layout/app-shell.tsx` | Modify | 사이드바 고정 레이아웃 |
| `src/components/common/priority-badge.tsx` | Modify/Verify | Stitch 스타일 뱃지 |
| `src/components/common/status-badge.tsx` | Modify/Verify | Stitch 스타일 뱃지 |
| `src/components/common/source-badge.tsx` | Create | 이슈 소스 뱃지 (Jira/GitHub/Notion/GitLab) |
| `src/components/common/confidence-gauge.tsx` | Create | AI 신뢰도 원형 게이지 |
| `src/components/common/code-block.tsx` | Create | 코드 하이라이트 블록 |
| `src/app/(dashboard)/approvals/page.tsx` | Create | 승인 페이지 라우트 (빈 진입점) |
| `src/app/(dashboard)/integrations/page.tsx` | Create | 연동 페이지 라우트 (빈 진입점) |
| `src/app/(dashboard)/monitoring/page.tsx` | Create | 모니터링 페이지 라우트 (빈 진입점) |
| `src/app/(dashboard)/onboarding/page.tsx` | Create | 온보딩 페이지 라우트 (빈 진입점) |

---

### Task 1: 폰트 설정 (Manrope + Inter)

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: layout.tsx에 Manrope + Inter 폰트 추가**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = localFont({
  src: [],
  variable: "--font-manrope",
});
```

NOTE: Next.js 16에서 폰트 API가 변경되었을 수 있음. `node_modules/next/dist/docs/` 확인 후 적절히 수정할 것. Manrope는 Google Fonts에서 가져오거나 `next/font/google`로 import.

실제 구현:

```tsx
import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IssueHub - AI 기반 이슈 자동화 플랫폼",
  description: "이슈를 분석하고, 서비스 운영 정책 기반으로 자동 개발까지 수행하는 AI 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} ${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 브라우저에서 폰트 적용 확인**

Run: `cd frontend && npm run dev`
Expected: 본문이 Inter, 타이틀이 Manrope로 렌더링

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git commit -m "feat(frontend): Manrope + Inter 폰트 적용 — Forge Logic 디자인 시스템"
```

---

### Task 2: 컬러 팔레트 변경 (Forge Logic)

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: globals.css :root 컬러를 Forge Logic 팔레트로 교체**

`:root` (라이트 모드) 변경 사항:

```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0.02 260);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0.02 260);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0.02 260);
  --primary: oklch(0.588 0.213 264);       /* #3B82F6 blue */
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0.005 260);
  --secondary-foreground: oklch(0.32 0.02 260);
  --muted: oklch(0.97 0.005 260);
  --muted-foreground: oklch(0.556 0.02 260);
  --accent: oklch(0.97 0.005 260);
  --accent-foreground: oklch(0.32 0.02 260);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0.005 260);
  --input: oklch(0.922 0.005 260);
  --ring: oklch(0.588 0.213 264);          /* primary color for ring */
  --chart-1: oklch(0.588 0.213 264);       /* blue */
  --chart-2: oklch(0.65 0.17 45);          /* orange #D16900 */
  --chart-3: oklch(0.556 0.02 260);
  --chart-4: oklch(0.439 0.02 260);
  --chart-5: oklch(0.371 0.02 260);
  --radius: 0.625rem;
  /* Sidebar: dark theme always */
  --sidebar: oklch(0.208 0.042 265);       /* #1E293B */
  --sidebar-foreground: oklch(0.75 0.02 260);
  --sidebar-primary: oklch(0.588 0.213 264); /* #3B82F6 */
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.28 0.04 260);  /* slightly lighter than sidebar */
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.3 0.03 260);
  --sidebar-ring: oklch(0.588 0.213 264);
}
```

@theme inline에 폰트 변수 추가:

```css
@theme inline {
  --font-sans: var(--font-inter);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-manrope);
  /* ... 기존 color 매핑 유지 */
}
```

- [ ] **Step 2: 다크 모드 사이드바 컬러도 동일하게 유지 확인**

`.dark` 섹션의 sidebar 값은 라이트 모드와 동일하게 유지 (사이드바는 항상 다크).

- [ ] **Step 3: 브라우저에서 컬러 변경 확인**

Expected: Primary 버튼이 블루(#3B82F6), 사이드바가 다크(#1E293B)

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(frontend): Forge Logic 컬러 팔레트 적용 — blue primary + dark sidebar"
```

---

### Task 3: 네비게이션 구조 변경 (MVP 7개 메뉴)

**Files:**
- Modify: `src/config/nav-config.ts`

- [ ] **Step 1: nav-config.ts를 MVP 메뉴 구조로 교체**

```ts
export const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: "LayoutDashboard" as const },
  { href: "/issues", label: "이슈", icon: "CircleDot" as const },
  { href: "/policies", label: "정책", icon: "Shield" as const },
  { href: "/approvals", label: "승인", icon: "CheckCircle" as const },
  { href: "/integrations", label: "연동", icon: "Plug" as const },
  { href: "/monitoring", label: "모니터링", icon: "Activity" as const },
  { href: "/settings", label: "설정", icon: "Settings" as const },
] as const;
```

제거: Projects, Automation, Connectors, Analytics
추가: Approvals, Integrations, Monitoring

- [ ] **Step 2: Commit**

```bash
git add src/config/nav-config.ts
git commit -m "feat(frontend): MVP 7개 메뉴로 네비게이션 변경"
```

---

### Task 4: 사이드바 리디자인 (220px 고정 + 다크 배경)

**Files:**
- Modify: `src/components/layout/sidebar.tsx`

- [ ] **Step 1: sidebar.tsx를 220px 고정 다크 사이드바로 변경**

접이식 기능 제거, 220px 고정. 항상 다크 배경. 활성 메뉴 블루 하이라이트.

```tsx
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
      <div className="flex h-16 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
          <CircleDot className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <span className="text-sm font-bold text-sidebar-primary-foreground font-heading">
            IssueHub
          </span>
          <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">
            Precision Intelligence
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4" role="navigation" aria-label="메인 내비게이션">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
```

- [ ] **Step 2: app-shell.tsx에서 collapsed 관련 로직 제거**

Modify `src/components/layout/app-shell.tsx`: collapsed state 제거, `ml-[220px]` 고정.

```tsx
"use client";

import { Sidebar } from "./sidebar";
import { Header } from "./header";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-[220px] flex flex-1 flex-col">
        <Header />
        <main className="flex-1 bg-background p-6">{children}</main>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 브라우저에서 확인**

Expected: 220px 다크 사이드바, 활성 메뉴 블루, 로고 + "Precision Intelligence" 텍스트

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/sidebar.tsx src/components/layout/app-shell.tsx
git commit -m "feat(frontend): 사이드바 리디자인 — 220px 고정 + Forge Logic 다크 테마"
```

---

### Task 5: 헤더 리디자인 (검색 + 알림 + AI + 프로필)

**Files:**
- Modify: `src/components/layout/header.tsx`

- [ ] **Step 1: header.tsx를 Stitch 디자인으로 변경**

```tsx
"use client";

import { Search, Bell, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search issues, policies, or users..."
          className="pl-10"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="알림">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="AI Insights">
          <Sparkles className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2 ml-2">
          <div className="text-right">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-muted-foreground">관리자</p>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: 브라우저에서 확인**

Expected: 검색바 + 알림 + AI Insights + 프로필이 헤더에 표시

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/header.tsx
git commit -m "feat(frontend): 헤더 리디자인 — 검색 + 알림 + AI Insights + 프로필"
```

---

### Task 6: 신규 페이지 라우트 생성 (빈 진입점)

**Files:**
- Create: `src/app/(dashboard)/approvals/page.tsx`
- Create: `src/app/(dashboard)/integrations/page.tsx`
- Create: `src/app/(dashboard)/monitoring/page.tsx`
- Create: `src/app/(dashboard)/onboarding/page.tsx`

- [ ] **Step 1: 4개 빈 페이지 생성**

각 페이지는 동일한 패턴:

```tsx
// src/app/(dashboard)/approvals/page.tsx
export default function ApprovalsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading">승인 워크플로우</h1>
      <p className="text-muted-foreground mt-1">PR 승인/거절 관리</p>
    </div>
  );
}
```

```tsx
// src/app/(dashboard)/integrations/page.tsx
export default function IntegrationsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading">연동 설정</h1>
      <p className="text-muted-foreground mt-1">이슈 소스 + 알림 채널 관리</p>
    </div>
  );
}
```

```tsx
// src/app/(dashboard)/monitoring/page.tsx
export default function MonitoringPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading">모니터링</h1>
      <p className="text-muted-foreground mt-1">시스템 상태 및 SLO 메트릭</p>
    </div>
  );
}
```

```tsx
// src/app/(dashboard)/onboarding/page.tsx
export default function OnboardingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold font-heading">온보딩</h1>
      <p className="text-muted-foreground mt-1">초기 설정 마법사</p>
    </div>
  );
}
```

- [ ] **Step 2: 사이드바에서 각 메뉴 클릭 시 페이지 표시 확인**

- [ ] **Step 3: 기존 /projects, /automation, /connectors, /analytics 라우트 정리**

삭제하지 않고 유지 (기존 코드 참조용). MVP 메뉴에서 접근 불가하므로 사실상 비활성.

- [ ] **Step 4: Commit**

```bash
git add src/app/(dashboard)/approvals/ src/app/(dashboard)/integrations/ src/app/(dashboard)/monitoring/ src/app/(dashboard)/onboarding/
git commit -m "feat(frontend): 신규 페이지 라우트 추가 — 승인, 연동, 모니터링, 온보딩"
```

---

### Task 7: 공통 컴포넌트 — source-badge.tsx

**Files:**
- Create: `src/components/common/source-badge.tsx`

- [ ] **Step 1: source-badge.tsx 생성**

```tsx
import { cn } from "@/lib/utils";

const SOURCE_CONFIG = {
  JIRA: { label: "Jira", className: "bg-blue-100 text-blue-700" },
  GITHUB: { label: "GitHub", className: "bg-gray-100 text-gray-700" },
  NOTION: { label: "Notion", className: "bg-amber-100 text-amber-700" },
  GITLAB: { label: "GitLab", className: "bg-orange-100 text-orange-700" },
  INTERNAL: { label: "Internal", className: "bg-green-100 text-green-700" },
} as const;

type IssueSource = keyof typeof SOURCE_CONFIG;

interface SourceBadgeProps {
  source: IssueSource;
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const config = SOURCE_CONFIG[source] ?? SOURCE_CONFIG.INTERNAL;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/common/source-badge.tsx
git commit -m "feat(frontend): SourceBadge 공통 컴포넌트 추가"
```

---

### Task 8: 공통 컴포넌트 — confidence-gauge.tsx

**Files:**
- Create: `src/components/common/confidence-gauge.tsx`

- [ ] **Step 1: confidence-gauge.tsx 생성 (SVG 원형 프로그레스)**

```tsx
import { cn } from "@/lib/utils";

interface ConfidenceGaugeProps {
  score: number; // 0-100
  size?: number;
  className?: string;
}

export function ConfidenceGauge({
  score,
  size = 80,
  className,
}: ConfidenceGaugeProps) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 80
      ? "text-green-500 stroke-green-500"
      : score >= 50
        ? "text-amber-500 stroke-amber-500"
        : "text-red-500 stroke-red-500";

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={color}
        />
      </svg>
      <span
        className={cn("absolute text-lg font-bold font-heading", color.split(" ")[0])}
      >
        {score}%
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/common/confidence-gauge.tsx
git commit -m "feat(frontend): ConfidenceGauge 공통 컴포넌트 추가"
```

---

### Task 9: 공통 컴포넌트 — code-block.tsx

**Files:**
- Create: `src/components/common/code-block.tsx`

- [ ] **Step 1: code-block.tsx 생성**

```tsx
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
  return (
    <div className={cn("rounded-lg bg-gray-900 p-4", className)}>
      {language && (
        <div className="mb-2 text-xs text-gray-400 uppercase">{language}</div>
      )}
      <pre className="overflow-x-auto text-sm text-gray-100 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/common/code-block.tsx
git commit -m "feat(frontend): CodeBlock 공통 컴포넌트 추가"
```

---

### Task 10: 최종 확인 + 정리 커밋

- [ ] **Step 1: 전체 빌드 확인**

Run: `cd frontend && npm run build`
Expected: 빌드 성공

- [ ] **Step 2: 모든 페이지 네비게이션 확인**

사이드바 7개 메뉴 각각 클릭 → 페이지 표시 확인

- [ ] **Step 3: 최종 커밋 (필요 시)**

```bash
git add -A
git commit -m "chore(frontend): Forge Logic 디자인 시스템 적용 정리"
```
