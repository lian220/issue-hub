"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MOCK_PENDING_ISSUES } from "@/constants/mock-integrations";

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-red-500/20 text-red-400",
  MEDIUM: "bg-yellow-500/20 text-yellow-400",
  LOW: "bg-muted text-muted-foreground",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

export function PendingIssuesTab() {
  const pendingIssues = MOCK_PENDING_ISSUES.filter((i) => i.status === "PENDING");

  function handleConfirm(id: string) {
    // TODO: apiClient.post(`/pending-issues/${id}/confirm`)
  }

  function handleDismiss(id: string) {
    // TODO: apiClient.post(`/pending-issues/${id}/dismiss`)
  }

  if (pendingIssues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">대기 중인 이슈가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {pendingIssues.map((issue) => (
        <div
          key={issue.id}
          className="flex items-center justify-between rounded-lg border bg-card p-4"
        >
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <Badge variant="outline" className={PRIORITY_STYLES[issue.parsedPriority ?? "LOW"]}>
                {issue.parsedPriority ?? "N/A"}
              </Badge>
              <span className="text-sm font-semibold">{issue.parsedTitle ?? "제목 없음"}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {issue.sourceChannel} · {formatTimeAgo(issue.createdAt)} · 신뢰도 {Math.round((issue.confidence ?? 0) * 100)}%
            </p>
          </div>
          <div className="ml-4 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
              onClick={() => handleConfirm(issue.id)}
            >
              확인
            </Button>
            {/* TODO: [BE 연동] 수정 클릭 → 대기 이슈 편집 모달 또는 상세 페이지 연결 */}
            <Button
              size="sm"
              variant="outline"
              className="text-xs text-primary"
              disabled
            >
              수정
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-muted-foreground"
              onClick={() => handleDismiss(issue.id)}
            >
              무시
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
