"use client";

import type { Issue } from "@/types/issue";
import {
  MOCK_ISSUES,
  MOCK_AI_ANALYSES,
  MOCK_CODING_TASKS,
  MOCK_TEAM,
  type AiAnalysis,
  type CodingTask,
  type TeamMember,
} from "@/constants/mock-data";

export interface IssueDetailData {
  issue: Issue;
  analysis: AiAnalysis | null;
  codingTasks: CodingTask[];
  assignee: TeamMember | null;
}

/** 이슈 상세 + AI 분석 데이터 훅 — API 연동 시 내부만 SWR/fetch로 교체 */
export function useIssueDetail(issueId: string) {
  const issue = MOCK_ISSUES.find((i) => i.id === issueId) ?? null;
  const analysis = MOCK_AI_ANALYSES[issueId] ?? null;
  const codingTasks = MOCK_CODING_TASKS.filter((t) => t.issueId === issueId);
  const assignee = issue?.assigneeId
    ? (MOCK_TEAM.find((m) => m.id === issue.assigneeId) ?? null)
    : null;

  return {
    data: issue ? { issue, analysis, codingTasks, assignee } : null,
    isLoading: false,
    error: issue ? null : new Error("Issue not found"),
  };
}
