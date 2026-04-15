"use client";

import Link from "next/link";
import {
  ChevronRight,
  Clock,
  User,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CodeBlock } from "@/components/common/code-block";
import { AiAnalysisPanel } from "./ai-analysis-panel";

interface IssueDetailProps {
  issueId: string;
}

/** Stitch design mock data for the detail page */
const MOCK_DETAIL = {
  ticketId: "ISSUE-4829",
  title: "사용자 로그 DB 쿼리 최적화",
  priority: "HIGH" as const,
  status: "IN_PROGRESS" as const,
  source: "Jira",
  description:
    "사용자 로그를 조회하는 현재 DB 쿼리가 고부하 상황에서 심각한 성능 저하를 보이고 있습니다. 피크 타임에 쿼리 실행 시간이 200ms에서 4초 이상으로 증가하여, 전체 애플리케이션 응답성과 사용자 경험에 영향을 미치고 있습니다.",
  assignee: { name: "김서연", initials: "김" },
  createdAt: "2026년 3월 15일",
  component: "백엔드 / 데이터베이스",
  affectedQuery: `SELECT ul.*, u.name, u.email
FROM user_logs ul
JOIN users u ON ul.user_id = u.id
WHERE ul.created_at > NOW() - INTERVAL '30 days'
ORDER BY ul.created_at DESC
LIMIT 1000;`,
  avgExecutionTime: 4.2,
  maxExecutionTime: 8.5,
};

export function IssueDetail({ issueId }: IssueDetailProps) {
  const d = MOCK_DETAIL;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/issues" className="hover:text-foreground">
          이슈
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{d.ticketId}</span>
      </nav>

      {/* 2-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* ===== Left Column ===== */}
        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
            >
              높은 우선순위
            </Badge>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              진행 중
            </Badge>
            <Badge variant="outline">소스: {d.source}</Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight">{d.title}</h1>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              설명
            </h2>
            <p className="text-sm leading-relaxed">{d.description}</p>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px]">
                  {d.assignee.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">담당자</p>
                <p className="font-medium">{d.assignee.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">생성일</p>
                <p className="font-medium">{d.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">컴포넌트</p>
                <p className="font-medium">{d.component}</p>
              </div>
            </div>
          </div>

          {/* Affected Query card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">영향받는 쿼리</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock code={d.affectedQuery} language="sql" />
            </CardContent>
          </Card>

          {/* Performance Impact card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">성능 영향</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">
                    평균 실행 시간
                  </span>
                  <span className="font-bold text-red-600">
                    {d.avgExecutionTime}s
                  </span>
                </div>
                <div className="h-2.5 rounded-full bg-muted">
                  <div
                    className="h-2.5 rounded-full bg-red-500 transition-all"
                    style={{
                      width: `${Math.min((d.avgExecutionTime / d.maxExecutionTime) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  목표: &lt; 0.5s | 최대 관측값: {d.maxExecutionTime}s
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== Right Column (AI Analysis) ===== */}
        <AiAnalysisPanel analysis={null} />
      </div>
    </div>
  );
}
