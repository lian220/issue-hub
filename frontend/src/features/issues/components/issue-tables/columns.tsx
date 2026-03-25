"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle, Sparkles } from "lucide-react";
import type { Issue } from "@/types/issue";
import {
  SOURCE_CONFIG,
  PRIORITY_CONFIG,
  MOCK_AI_ANALYSES,
  MOCK_TEAM,
} from "@/constants/mock-data";

export const issueColumns: ColumnDef<Issue>[] = [
  {
    id: "priority",
    header: "",
    cell: ({ row }) => {
      const priority = PRIORITY_CONFIG[row.original.priority];
      return <span className={`inline-block h-2.5 w-2.5 rounded-full ${priority.dot}`} />;
    },
    size: 32,
  },
  {
    accessorKey: "title",
    header: "제목",
    cell: ({ row }) => {
      const issue = row.original;
      const hasAi = !!MOCK_AI_ANALYSES[issue.id];
      return (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium">{issue.title}</span>
            {hasAi && <Sparkles className="h-3.5 w-3.5 shrink-0 text-blue-500" />}
          </div>
          {issue.labels.length > 0 && (
            <div className="mt-0.5 flex gap-1">
              {issue.labels.slice(0, 3).map((label) => (
                <Badge key={label} variant="outline" className="px-1 py-0 text-[10px] font-normal">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "source",
    header: "소스",
    cell: ({ row }) => {
      const source = SOURCE_CONFIG[row.original.source];
      return (
        <Badge variant="outline" className={`${source.bgColor} ${source.color} border-0 text-xs`}>
          {source.label}
        </Badge>
      );
    },
    size: 80,
  },
  {
    id: "externalId",
    header: "외부 ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.externalId || "—"}
      </span>
    ),
    size: 100,
  },
  {
    id: "assignee",
    header: "담당자",
    cell: ({ row }) => {
      const assignee = MOCK_TEAM.find((m) => m.id === row.original.assigneeId);
      return <span className="text-sm">{assignee?.name ?? "미배정"}</span>;
    },
    size: 80,
  },
  {
    id: "status",
    header: "상태",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusMap: Record<string, { label: string; className: string }> = {
        OPEN: { label: "열림", className: "border-blue-300 text-blue-700 bg-blue-50" },
        IN_PROGRESS: { label: "진행 중", className: "border-yellow-300 text-yellow-700 bg-yellow-50" },
        RESOLVED: { label: "해결됨", className: "border-green-300 text-green-700 bg-green-50" },
        CLOSED: { label: "닫힘", className: "border-gray-300 text-gray-700 bg-gray-50" },
        BLOCKED: { label: "차단됨", className: "border-red-300 text-red-700 bg-red-50" },
        PENDING: { label: "대기 중", className: "border-purple-300 text-purple-700 bg-purple-50" },
      };
      const config = statusMap[status] ?? { label: status, className: "" };
      return (
        <Badge variant="outline" className={`text-xs ${config.className}`}>
          {config.label}
        </Badge>
      );
    },
    size: 80,
  },
  {
    id: "sla",
    header: "SLA",
    cell: ({ row }) => {
      const issue = row.original;
      if (issue.slaBreach) {
        return (
          <span className="flex items-center gap-1 text-xs text-red-600">
            <AlertTriangle className="h-3 w-3" />
            위반
          </span>
        );
      }
      if (issue.slaDeadline) {
        return (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            진행
          </span>
        );
      }
      return <span className="text-xs text-muted-foreground">—</span>;
    },
    size: 60,
  },
  {
    id: "createdAt",
    header: "생성일",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString("ko-KR")}
      </span>
    ),
    size: 90,
  },
];
