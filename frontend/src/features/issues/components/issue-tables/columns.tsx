"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { Issue } from "@/types/issue";
import { SOURCE_CONFIG, PRIORITY_CONFIG } from "@/constants/mock-data";
import type { IssueListLookups } from "../../hooks/use-issues";

/** lookups를 받아 컬럼 정의를 생성하는 팩토리 함수 */
export function createIssueColumns(
  lookups: IssueListLookups,
): ColumnDef<Issue>[] {
  return [
    {
      accessorKey: "title",
      header: "Issue Title",
      cell: ({ row }) => {
        const issue = row.original;
        return (
          <div className="min-w-0">
            <span className="truncate font-medium text-sm">
              {issue.title}
            </span>
            <p className="text-xs text-muted-foreground">
              {issue.externalId || issue.id}
            </p>
          </div>
        );
      },
    },
    {
      id: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const config = PRIORITY_CONFIG[row.original.priority];
        return (
          <Badge variant="secondary" className={`${config.color} text-xs`}>
            {config.label}
          </Badge>
        );
      },
      size: 100,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusMap: Record<
          string,
          { label: string; className: string }
        > = {
          OPEN: {
            label: "Open",
            className: "border-blue-300 text-blue-700 bg-blue-50",
          },
          IN_PROGRESS: {
            label: "In Progress",
            className: "border-yellow-300 text-yellow-700 bg-yellow-50",
          },
          RESOLVED: {
            label: "Resolved",
            className: "border-green-300 text-green-700 bg-green-50",
          },
          CLOSED: {
            label: "Closed",
            className: "border-gray-300 text-gray-700 bg-gray-50",
          },
          BLOCKED: {
            label: "Blocked",
            className: "border-red-300 text-red-700 bg-red-50",
          },
          PENDING: {
            label: "Pending",
            className: "border-purple-300 text-purple-700 bg-purple-50",
          },
        };
        const config = statusMap[status] ?? { label: status, className: "" };
        return (
          <Badge variant="outline" className={`text-xs ${config.className}`}>
            {config.label}
          </Badge>
        );
      },
      size: 100,
    },
    {
      id: "source",
      header: "Source",
      cell: ({ row }) => {
        const source = SOURCE_CONFIG[row.original.source];
        return (
          <Badge
            variant="outline"
            className={`${source.bgColor} ${source.color} border-0 text-xs`}
          >
            {source.label}
          </Badge>
        );
      },
      size: 80,
    },
    {
      id: "aiAnalysis",
      header: "AI Analysis",
      cell: ({ row }) => {
        const hasAi = !!lookups.aiAnalyses[row.original.id];
        if (hasAi) {
          return (
            <span className="flex items-center gap-1.5 text-sm">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <Sparkles className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-green-700 dark:text-green-400 text-xs">
                Analyzed
              </span>
            </span>
          );
        }
        return (
          <span className="flex items-center gap-1.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="text-xs text-muted-foreground">Pending</span>
          </span>
        );
      },
      size: 120,
    },
  ];
}
