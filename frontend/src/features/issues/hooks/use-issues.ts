"use client";

import { useMemo } from "react";

import {
  MOCK_ISSUES,
  MOCK_AI_ANALYSES,
  MOCK_TEAM,
  type AiAnalysis,
  type TeamMember,
} from "@/constants/mock-data";

// ── SWR 기반 (API 연동 시 활성화) ──
// import useSWR from "swr";
// import { apiClient } from "@/lib/api";
// import { PagedResponse, IssueFilterParams } from "@/types/api";

export interface IssueFilters {
  search: string;
  status: string | null;
  priority: string | null;
  source: string | null;
}

export interface IssueListLookups {
  aiAnalyses: Record<string, AiAnalysis>;
  teamMembers: TeamMember[];
}

/** 이슈 목록 + 필터링 훅 (Mock) — API 연동 시 내부만 SWR/fetch로 교체 */
export function useIssueList(filters: IssueFilters) {
  const data = useMemo(() => {
    return MOCK_ISSUES.filter((issue) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !issue.title.toLowerCase().includes(q) &&
          !issue.description?.toLowerCase().includes(q) &&
          !issue.externalId?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (filters.status && issue.status !== filters.status) return false;
      if (filters.priority && issue.priority !== filters.priority) return false;
      if (filters.source && issue.source !== filters.source) return false;
      return true;
    });
  }, [filters]);

  const lookups: IssueListLookups = {
    aiAnalyses: MOCK_AI_ANALYSES,
    teamMembers: MOCK_TEAM,
  };

  return { data, lookups, isLoading: false, error: null };
}
