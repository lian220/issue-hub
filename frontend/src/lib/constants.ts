import { IssueStatus, IssuePriority, Platform } from "@/types/issue";

export const STATUS_LABELS: Record<IssueStatus, string> = {
  OPEN: "열림",
  IN_PROGRESS: "진행 중",
  RESOLVED: "해결됨",
  CLOSED: "닫힘",
  BLOCKED: "차단됨",
  PENDING: "대기 중",
};

export const STATUS_COLORS: Record<IssueStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  RESOLVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  CLOSED: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  BLOCKED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  PENDING: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

export const PRIORITY_LABELS: Record<IssuePriority, string> = {
  CRITICAL: "심각",
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
  NONE: "없음",
};

export const PRIORITY_COLORS: Record<IssuePriority, string> = {
  CRITICAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  NONE: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  JIRA: "Jira",
  GITHUB: "GitHub",
  GITLAB: "GitLab",
  SLACK: "Slack",
  TEAMS: "Teams",
  EMAIL: "이메일",
  MANUAL: "수동",
};

export const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: "LayoutDashboard" as const },
  { href: "/issues", label: "이슈", icon: "CircleDot" as const },
  { href: "/policies", label: "정책", icon: "Shield" as const },
  { href: "/automation", label: "자동화", icon: "Zap" as const },
  { href: "/connectors", label: "커넥터", icon: "Plug" as const },
  { href: "/analytics", label: "분석", icon: "BarChart3" as const },
  { href: "/settings", label: "설정", icon: "Settings" as const },
] as const;
