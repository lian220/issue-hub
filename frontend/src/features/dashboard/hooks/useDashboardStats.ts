"use client";

import type { Issue } from "@/types/issue";
import {
  MOCK_ISSUES,
  MOCK_TEAM,
  type TeamMember,
} from "@/constants/mock-data";

export interface DashboardSummary {
  totalOpen: number;
  totalInProgress: number;
  totalResolved: number;
  totalSlaBreach: number;
}

export interface SlaData {
  totalActive: number;
  breachCount: number;
  responseRate: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  recentIssues: Issue[];
  teamMembers: TeamMember[];
  sla: SlaData;
}

/** 대시보드 전체 데이터 훅 — API 연동 시 내부만 SWR/fetch로 교체 */
export function useDashboardStats() {
  const activeIssues = MOCK_ISSUES.filter(
    (i) => i.status !== "RESOLVED" && i.status !== "CLOSED",
  );
  const breachCount = MOCK_ISSUES.filter((i) => i.slaBreach).length;

  const data: DashboardData = {
    summary: {
      totalOpen: MOCK_ISSUES.filter((i) => i.status === "OPEN").length,
      totalInProgress: MOCK_ISSUES.filter((i) => i.status === "IN_PROGRESS")
        .length,
      totalResolved: MOCK_ISSUES.filter((i) => i.status === "RESOLVED").length,
      totalSlaBreach: breachCount,
    },
    recentIssues: activeIssues.slice(0, 6),
    teamMembers: MOCK_TEAM,
    sla: {
      totalActive: activeIssues.length,
      breachCount,
      responseRate:
        activeIssues.length > 0
          ? ((activeIssues.length - breachCount) / activeIssues.length) * 100
          : 100,
    },
  };

  return { data, isLoading: false, error: null };
}
