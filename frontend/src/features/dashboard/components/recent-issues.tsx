"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MOCK_ISSUES, SOURCE_CONFIG, PRIORITY_CONFIG } from "@/constants/mock-data";

export function RecentIssues() {
  const recentIssues = MOCK_ISSUES
    .filter((issue) => issue.status !== "RESOLVED" && issue.status !== "CLOSED")
    .slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">최근 이슈</CardTitle>
        <Link
          href="/issues"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          전체 보기 →
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentIssues.map((issue) => {
            const source = SOURCE_CONFIG[issue.source];
            const priority = PRIORITY_CONFIG[issue.priority];

            return (
              <Link
                key={issue.id}
                href={`/issues/${issue.id}`}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
              >
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${priority.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">
                      {issue.title}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge
                      variant="outline"
                      className={`px-1.5 py-0 text-[10px] font-normal ${source.bgColor} ${source.color} border-0`}
                    >
                      {source.label}
                    </Badge>
                    {issue.externalId && (
                      <span className="text-muted-foreground/70">
                        {issue.externalId}
                      </span>
                    )}
                    {issue.slaBreach && (
                      <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                        SLA 위반
                      </Badge>
                    )}
                    {issue.slaDeadline && !issue.slaBreach && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-3 w-3" />
                        SLA
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 text-[10px] ${priority.color} border-0`}
                >
                  {priority.label}
                </Badge>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
