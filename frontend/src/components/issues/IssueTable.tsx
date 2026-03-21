"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PriorityBadge } from "@/components/common/PriorityBadge";
import { PlatformIcon } from "@/components/common/PlatformIcon";
import { formatRelativeTime } from "@/lib/utils";
import { Issue } from "@/types/issue";

interface IssueTableProps {
  issues: Issue[];
  isLoading?: boolean;
}

const PLACEHOLDER_ISSUES: Issue[] = [
  {
    id: "ISS-001",
    externalId: "PROJ-101",
    title: "로그인 페이지 보안 취약점 수정",
    status: "OPEN",
    priority: "CRITICAL",
    source: "JIRA",
    labels: ["security"],
    slaBreach: false,
    createdAt: "2026-03-20T09:00:00Z",
    updatedAt: "2026-03-21T14:30:00Z",
    assignee: { id: "1", email: "kim@example.com", name: "김철수", displayName: "김철수", role: "MEMBER", isActive: true, createdAt: "", updatedAt: "" },
  },
  {
    id: "ISS-002",
    externalId: "#42",
    title: "API 응답 속도 개선 요청",
    status: "IN_PROGRESS",
    priority: "HIGH",
    source: "GITHUB",
    labels: ["performance"],
    slaBreach: false,
    createdAt: "2026-03-19T10:00:00Z",
    updatedAt: "2026-03-21T11:00:00Z",
    assignee: { id: "2", email: "lee@example.com", name: "이영희", displayName: "이영희", role: "MEMBER", isActive: true, createdAt: "", updatedAt: "" },
  },
  {
    id: "ISS-003",
    externalId: "SLK-789",
    title: "고객 문의: 결제 오류 반복 발생",
    status: "OPEN",
    priority: "HIGH",
    source: "SLACK",
    labels: ["customer", "payment"],
    slaBreach: true,
    createdAt: "2026-03-18T08:00:00Z",
    updatedAt: "2026-03-21T09:15:00Z",
  },
  {
    id: "ISS-004",
    externalId: "PROJ-108",
    title: "대시보드 차트 렌더링 오류",
    status: "RESOLVED",
    priority: "MEDIUM",
    source: "JIRA",
    labels: ["frontend", "bug"],
    slaBreach: false,
    createdAt: "2026-03-17T14:00:00Z",
    updatedAt: "2026-03-20T16:30:00Z",
    assignee: { id: "3", email: "park@example.com", name: "박지민", displayName: "박지민", role: "MEMBER", isActive: true, createdAt: "", updatedAt: "" },
  },
  {
    id: "ISS-005",
    externalId: "TMS-456",
    title: "인프라 모니터링 알림 설정 요청",
    status: "PENDING",
    priority: "LOW",
    source: "TEAMS",
    labels: ["infra"],
    slaBreach: false,
    createdAt: "2026-03-16T11:00:00Z",
    updatedAt: "2026-03-19T10:00:00Z",
  },
];

export function IssueTable({ issues, isLoading }: IssueTableProps) {
  const displayIssues = issues.length > 0 ? issues : PLACEHOLDER_ISSUES;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">이슈를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">ID</TableHead>
            <TableHead>제목</TableHead>
            <TableHead className="w-[100px]">상태</TableHead>
            <TableHead className="w-[100px]">우선순위</TableHead>
            <TableHead className="w-[80px]">소스</TableHead>
            <TableHead className="w-[100px]">담당자</TableHead>
            <TableHead className="w-[120px]">업데이트</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayIssues.map((issue) => (
            <TableRow
              key={issue.id}
              className={issue.slaBreach ? "bg-red-50/50 dark:bg-red-950/20" : ""}
            >
              <TableCell className="font-mono text-xs text-muted-foreground">
                <Link
                  href={`/issues/${issue.id}`}
                  className="hover:underline"
                >
                  {issue.externalId}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  href={`/issues/${issue.id}`}
                  className="font-medium hover:underline"
                >
                  {issue.title}
                  {issue.slaBreach && (
                    <span className="ml-2 text-xs text-destructive font-semibold">
                      SLA 위반
                    </span>
                  )}
                </Link>
              </TableCell>
              <TableCell>
                <StatusBadge status={issue.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={issue.priority} />
              </TableCell>
              <TableCell>
                <PlatformIcon platform={issue.source} showLabel />
              </TableCell>
              <TableCell className="text-sm">
                {issue.assignee?.displayName ?? (
                  <span className="text-muted-foreground">미배정</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatRelativeTime(issue.updatedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
