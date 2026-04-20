import type { IntegrationType, IntegrationRole } from "../types/integration";

export interface PlatformInfo {
  type: IntegrationType;
  label: string;
  description: string;
  role: IntegrationRole;
  iconBgColor: string;
  iconLabel: string;
  phase: 1 | 2;
  authType: "oauth2" | "api_key" | "webhook_url";
  oauthUrl?: string;
}

export const PLATFORM_REGISTRY: PlatformInfo[] = [
  {
    type: "JIRA",
    label: "Jira",
    description: "이슈 트래킹",
    role: "ISSUE_SOURCE",
    iconBgColor: "bg-[#0052CC]",
    iconLabel: "J",
    phase: 1,
    authType: "oauth2",
    oauthUrl: "/api/oauth/jira",
  },
  {
    type: "GITHUB",
    label: "GitHub",
    description: "이슈 + CI/CD",
    role: "ISSUE_SOURCE",
    iconBgColor: "bg-[#24292e]",
    iconLabel: "G",
    phase: 2,
    authType: "oauth2",
  },
  {
    type: "GITLAB",
    label: "GitLab",
    description: "이슈 + CI/CD",
    role: "ISSUE_SOURCE",
    iconBgColor: "bg-[#FC6D26]",
    iconLabel: "GL",
    phase: 2,
    authType: "oauth2",
  },
  {
    type: "NOTION",
    label: "Notion",
    description: "이슈 데이터베이스",
    role: "ISSUE_SOURCE",
    iconBgColor: "bg-black",
    iconLabel: "N",
    phase: 2,
    authType: "oauth2",
  },
  {
    type: "SLACK",
    label: "Slack",
    description: "에러 감지 + 알림",
    role: "NOTIFICATION",
    iconBgColor: "bg-[#4A154B]",
    iconLabel: "S",
    phase: 1,
    authType: "oauth2",
    oauthUrl: "/api/oauth/slack",
  },
  {
    type: "TEAMS",
    label: "Teams",
    description: "알림 채널",
    role: "NOTIFICATION",
    iconBgColor: "bg-[#6264A7]",
    iconLabel: "T",
    phase: 2,
    authType: "oauth2",
  },
  {
    type: "EMAIL",
    label: "Email",
    description: "알림 발송",
    role: "NOTIFICATION",
    iconBgColor: "bg-muted-foreground",
    iconLabel: "@",
    phase: 2,
    authType: "api_key",
  },
];

export const ISSUE_SOURCES = PLATFORM_REGISTRY.filter((p) => p.role === "ISSUE_SOURCE");
export const NOTIFICATION_CHANNELS = PLATFORM_REGISTRY.filter((p) => p.role === "NOTIFICATION");

export function getPlatformInfo(type: IntegrationType): PlatformInfo | undefined {
  return PLATFORM_REGISTRY.find((p) => p.type === type);
}
