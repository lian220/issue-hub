export const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: "LayoutDashboard" as const },
  { href: "/issues", label: "이슈", icon: "CircleDot" as const },
  { href: "/projects", label: "프로젝트", icon: "FolderKanban" as const },
  { href: "/policies", label: "정책", icon: "Shield" as const },
  { href: "/automation", label: "자동화", icon: "Zap" as const },
  { href: "/connectors", label: "커넥터", icon: "Plug" as const },
  { href: "/analytics", label: "분석", icon: "BarChart3" as const },
  { href: "/settings", label: "설정", icon: "Settings" as const },
] as const;
