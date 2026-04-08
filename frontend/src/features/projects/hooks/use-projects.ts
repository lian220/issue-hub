"use client";

import { useMemo } from "react";

import { MOCK_PROJECTS } from "@/constants/mock-data";

export interface ProjectFilters {
  search: string;
  syncStatus: string | null;
  codeIntelMode: string | null;
  llmProvider: string | null;
}

/** 프로젝트 목록 + 필터링 훅 (Mock) — API 연동 시 내부만 SWR/fetch로 교체 */
export function useProjectList(filters: ProjectFilters) {
  const data = useMemo(() => {
    return MOCK_PROJECTS.filter((project) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !project.name.toLowerCase().includes(q) &&
          !project.serviceTag.toLowerCase().includes(q) &&
          !project.gitUrl.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      if (filters.syncStatus && project.syncStatus !== filters.syncStatus) return false;
      if (filters.codeIntelMode && project.codeIntelMode !== filters.codeIntelMode) return false;
      if (filters.llmProvider && project.llmProvider !== filters.llmProvider) return false;
      return true;
    });
  }, [filters]);

  return { data, isLoading: false, error: null };
}
