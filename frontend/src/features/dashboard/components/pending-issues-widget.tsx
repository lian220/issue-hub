"use client";

import Link from "next/link";
import { MOCK_PENDING_ISSUES } from "@/constants/mock-integrations";

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "text-red-400",
  MEDIUM: "text-yellow-400",
  LOW: "text-muted-foreground",
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

export function PendingIssuesWidget() {
  const pendingIssues = MOCK_PENDING_ISSUES.filter((i) => i.status === "PENDING");

  if (pendingIssues.length === 0) return null;

  return (
    <div className="rounded-xl border border-tertiary/30 bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-bold text-tertiary">대기 중 이슈</h3>
        <span className="rounded-full bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground">
          {pendingIssues.length}
        </span>
      </div>

      <div className="space-y-2">
        {pendingIssues.slice(0, 3).map((issue) => (
          <div
            key={issue.id}
            className="flex items-center justify-between rounded-lg bg-background p-2"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{issue.parsedTitle}</p>
              <p className="text-[11px] text-muted-foreground">
                {formatTimeAgo(issue.createdAt)}
              </p>
            </div>
            <span className={`ml-2 text-[11px] font-semibold ${PRIORITY_COLORS[issue.parsedPriority ?? "LOW"]}`}>
              {issue.parsedPriority}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/issues?tab=pending"
        className="mt-2 block text-center text-xs text-primary hover:underline"
      >
        전체 보기 →
      </Link>
    </div>
  );
}
