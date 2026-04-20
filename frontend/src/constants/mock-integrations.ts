import type { Integration, PendingIssue } from "@/features/integrations/types/integration";

export const MOCK_INTEGRATIONS: Integration[] = [
  {
    id: "int-1",
    type: "JIRA",
    role: "ISSUE_SOURCE",
    status: "CONNECTED",
    config: {
      projectKeys: ["PAY", "AUTH"],
    },
    n8nWorkflowId: "wf-jira-001",
    lastSyncAt: "2026-04-20T10:58:00Z",
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-20T10:58:00Z",
  },
  {
    id: "int-2",
    type: "SLACK",
    role: "NOTIFICATION",
    status: "CONNECTED",
    config: {
      channels: {
        monitorChannels: ["#prod-alerts", "#backend-errors"],
        notifyChannel: "#issuehub-notifications",
      },
      keywords: ["error", "500", "exception", "fail", "timeout"],
    },
    n8nWorkflowId: "wf-slack-001",
    lastSyncAt: "2026-04-20T11:00:00Z",
    createdAt: "2026-04-01T00:00:00Z",
    updatedAt: "2026-04-20T11:00:00Z",
  },
];

export const MOCK_PENDING_ISSUES: PendingIssue[] = [
  {
    id: "pi-1",
    sourceType: "SLACK",
    sourceChannel: "#prod-alerts",
    rawMessage: "500 Error on /api/login — NullPointerException at AuthService.java:42",
    parsedTitle: "로그인 500 에러",
    parsedDescription:
      "프로덕션 환경에서 로그인 API(/api/login)에서 NullPointerException 발생. AuthService.java:42 라인에서 에러 추적.",
    parsedPriority: "HIGH",
    parsedComponent: "Backend/Auth",
    confidence: 0.94,
    status: "PENDING",
    createdAt: "2026-04-20T10:57:00Z",
  },
  {
    id: "pi-2",
    sourceType: "SLACK",
    sourceChannel: "#backend-errors",
    rawMessage: "Payment timeout occurred for order #12345, gateway response took 32s",
    parsedTitle: "결제 타임아웃 간헐적 발생",
    parsedDescription: "주문 #12345에서 결제 게이트웨이 응답이 32초 걸림. 타임아웃 기준(10초) 초과.",
    parsedPriority: "MEDIUM",
    parsedComponent: "Backend/Payment",
    confidence: 0.87,
    status: "PENDING",
    createdAt: "2026-04-20T10:42:00Z",
  },
  {
    id: "pi-3",
    sourceType: "SLACK",
    sourceChannel: "#prod-alerts",
    rawMessage: "Redis cache miss rate increased to 45% in last 15min",
    parsedTitle: "캐시 미스율 증가",
    parsedDescription: "Redis 캐시 미스율이 최근 15분간 45%로 증가. 평균 대비 3배.",
    parsedPriority: "LOW",
    parsedComponent: "Infra/Cache",
    confidence: 0.72,
    status: "PENDING",
    createdAt: "2026-04-20T09:58:00Z",
  },
];
