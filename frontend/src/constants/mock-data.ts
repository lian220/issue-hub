import type { Issue, Platform, IssueStatus, IssuePriority } from "@/types/issue";

// ── 프로젝트 목업 ──
export interface Project {
  id: string;
  name: string;
  serviceTag: string;
  gitUrl: string;
  codeIntelMode: "local" | "agent" | "api";
  llmProvider: "ollama" | "claude" | "gemini";
  issueCount: number;
  lastSyncAt: string;
  syncStatus: "synced" | "syncing" | "error";
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "결제 서비스",
    serviceTag: "payment",
    gitUrl: "github.com/our-org/payment-api",
    codeIntelMode: "local",
    llmProvider: "ollama",
    issueCount: 12,
    lastSyncAt: "5분 전",
    syncStatus: "synced",
  },
  {
    id: "proj-2",
    name: "쇼핑 API",
    serviceTag: "shopping",
    gitUrl: "github.com/our-org/shopping-api",
    codeIntelMode: "local",
    llmProvider: "claude",
    issueCount: 8,
    lastSyncAt: "3분 전",
    syncStatus: "synced",
  },
  {
    id: "proj-3",
    name: "관리자 포털",
    serviceTag: "admin",
    gitUrl: "github.com/our-org/admin-portal",
    codeIntelMode: "api",
    llmProvider: "gemini",
    issueCount: 5,
    lastSyncAt: "12분 전",
    syncStatus: "error",
  },
  {
    id: "proj-4",
    name: "블로그",
    serviceTag: "blog",
    gitUrl: "github.com/our-org/blog",
    codeIntelMode: "api",
    llmProvider: "gemini",
    issueCount: 3,
    lastSyncAt: "1분 전",
    syncStatus: "synced",
  },
];

// ── 이슈 목업 ──
export const MOCK_ISSUES: Issue[] = [
  {
    id: "iss-1",
    externalId: "PROJ-123",
    title: "결제 API 500 에러 간헐적 발생",
    description: "동시 요청이 많을 때 500 에러 재현",
    status: "OPEN",
    priority: "CRITICAL",
    source: "JIRA",
    sourceUrl: "https://jira.example.com/browse/PROJ-123",
    projectKey: "proj-1",
    assigneeId: "user-1",
    labels: ["bug", "payment", "p0"],
    slaBreach: false,
    slaDeadline: "2026-03-23T16:00:00Z",
    createdAt: "2026-03-23T10:00:00Z",
    updatedAt: "2026-03-23T12:00:00Z",
  },
  {
    id: "iss-2",
    externalId: "#45",
    title: "로그인 UX 개선 - 소셜 로그인 버튼 추가",
    status: "IN_PROGRESS",
    priority: "HIGH",
    source: "GITHUB",
    sourceUrl: "https://github.com/our-org/admin-portal/issues/45",
    projectKey: "proj-3",
    assigneeId: "user-2",
    labels: ["enhancement", "ux"],
    slaBreach: false,
    createdAt: "2026-03-22T09:00:00Z",
    updatedAt: "2026-03-23T08:00:00Z",
  },
  {
    id: "iss-3",
    externalId: "SHOP-89",
    title: "상품 검색 성능 최적화",
    status: "OPEN",
    priority: "HIGH",
    source: "JIRA",
    projectKey: "proj-2",
    assigneeId: "user-3",
    labels: ["performance", "search"],
    slaBreach: false,
    slaDeadline: "2026-03-24T10:00:00Z",
    createdAt: "2026-03-21T14:00:00Z",
    updatedAt: "2026-03-23T07:00:00Z",
  },
  {
    id: "iss-4",
    externalId: "",
    title: "API 문서 업데이트",
    status: "OPEN",
    priority: "LOW",
    source: "MANUAL",
    projectKey: "proj-2",
    labels: ["docs"],
    slaBreach: false,
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-03-20T10:00:00Z",
  },
  {
    id: "iss-5",
    externalId: "PROJ-120",
    title: "결제 내역 CSV 다운로드 기능",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    source: "JIRA",
    projectKey: "proj-1",
    assigneeId: "user-2",
    labels: ["feature", "export"],
    slaBreach: false,
    createdAt: "2026-03-19T11:00:00Z",
    updatedAt: "2026-03-22T16:00:00Z",
  },
  {
    id: "iss-6",
    externalId: "#12",
    title: "블로그 댓글 스팸 필터링",
    status: "OPEN",
    priority: "MEDIUM",
    source: "GITHUB",
    projectKey: "proj-4",
    assigneeId: "user-1",
    labels: ["bug", "spam"],
    slaBreach: true,
    createdAt: "2026-03-18T09:00:00Z",
    updatedAt: "2026-03-21T15:00:00Z",
  },
  {
    id: "iss-7",
    externalId: "PROJ-125",
    title: "PG 결제 로그 누락 건 조사",
    status: "RESOLVED",
    priority: "HIGH",
    source: "JIRA",
    projectKey: "proj-1",
    assigneeId: "user-3",
    labels: ["bug", "logging"],
    slaBreach: false,
    resolvedAt: "2026-03-23T09:00:00Z",
    createdAt: "2026-03-22T08:00:00Z",
    updatedAt: "2026-03-23T09:00:00Z",
  },
  {
    id: "iss-8",
    externalId: "SHOP-92",
    title: "장바구니 동시성 이슈",
    status: "OPEN",
    priority: "CRITICAL",
    source: "JIRA",
    projectKey: "proj-2",
    assigneeId: "user-1",
    labels: ["bug", "concurrency"],
    slaBreach: true,
    slaDeadline: "2026-03-23T14:00:00Z",
    createdAt: "2026-03-23T06:00:00Z",
    updatedAt: "2026-03-23T11:00:00Z",
  },
];

// ── 팀 멤버 목업 ──
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  openIssues: number;
  inProgressIssues: number;
}

export const MOCK_TEAM: TeamMember[] = [
  { id: "user-1", name: "김도영", role: "백엔드", openIssues: 5, inProgressIssues: 2 },
  { id: "user-2", name: "이서연", role: "프론트엔드", openIssues: 3, inProgressIssues: 1 },
  { id: "user-3", name: "박민수", role: "풀스택", openIssues: 4, inProgressIssues: 2 },
  { id: "user-4", name: "최지현", role: "DevOps", openIssues: 1, inProgressIssues: 0 },
];

// ── 소스별 아이콘/색상 ──
export const SOURCE_CONFIG: Record<Platform, { label: string; color: string; bgColor: string }> = {
  JIRA: { label: "Jira", color: "text-blue-700", bgColor: "bg-blue-100" },
  GITHUB: { label: "GitHub", color: "text-gray-900", bgColor: "bg-gray-100" },
  GITLAB: { label: "GitLab", color: "text-orange-700", bgColor: "bg-orange-100" },
  SLACK: { label: "Slack", color: "text-purple-700", bgColor: "bg-purple-100" },
  TEAMS: { label: "Teams", color: "text-indigo-700", bgColor: "bg-indigo-100" },
  EMAIL: { label: "Email", color: "text-green-700", bgColor: "bg-green-100" },
  MANUAL: { label: "IssueHub", color: "text-emerald-700", bgColor: "bg-emerald-100" },
};

export const PRIORITY_CONFIG: Record<IssuePriority, { label: string; color: string; dot: string }> = {
  CRITICAL: { label: "심각", color: "text-red-700 bg-red-100", dot: "bg-red-500" },
  HIGH: { label: "높음", color: "text-orange-700 bg-orange-100", dot: "bg-orange-500" },
  MEDIUM: { label: "보통", color: "text-yellow-700 bg-yellow-100", dot: "bg-yellow-500" },
  LOW: { label: "낮음", color: "text-green-700 bg-green-100", dot: "bg-green-500" },
  NONE: { label: "없음", color: "text-gray-700 bg-gray-100", dot: "bg-gray-400" },
};
