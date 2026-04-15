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
  title: "Optimize Database Query for User Logs",
  priority: "HIGH" as const,
  status: "IN_PROGRESS" as const,
  source: "Jira",
  description:
    "The current database query for fetching user logs is experiencing significant performance degradation under high load. The query execution time has increased from 200ms to over 4 seconds during peak hours, affecting the overall application responsiveness and user experience.",
  assignee: { name: "Sarah Chen", initials: "SC" },
  createdAt: "March 15, 2026",
  component: "Backend / Database",
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
          Issues
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
              HIGH PRIORITY
            </Badge>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              IN PROGRESS
            </Badge>
            <Badge variant="outline">Source: {d.source}</Badge>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight">{d.title}</h1>

          {/* Description */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Description
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
                <p className="text-xs text-muted-foreground">Assignee</p>
                <p className="font-medium">{d.assignee.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">{d.createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Component</p>
                <p className="font-medium">{d.component}</p>
              </div>
            </div>
          </div>

          {/* Affected Query card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Affected Query</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock code={d.affectedQuery} language="sql" />
            </CardContent>
          </Card>

          {/* Performance Impact card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Performance Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground">
                    Avg Execution Time
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
                  Target: &lt; 0.5s | Max observed: {d.maxExecutionTime}s
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
