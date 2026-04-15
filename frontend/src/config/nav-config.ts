export const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: "LayoutDashboard" as const },
  { href: "/issues", label: "이슈", icon: "CircleDot" as const },
  { href: "/policies", label: "정책", icon: "Shield" as const },
  { href: "/approvals", label: "승인", icon: "CheckCircle" as const },
  { href: "/integrations", label: "연동", icon: "Plug" as const },
  { href: "/monitoring", label: "모니터링", icon: "Activity" as const },
  { href: "/settings", label: "설정", icon: "Settings" as const },
] as const;
