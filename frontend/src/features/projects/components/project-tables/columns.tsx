"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, AlertCircle, GitBranch } from "lucide-react";
import type { Project } from "@/constants/mock-data";

const SYNC_STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  synced: {
    label: "동기화됨",
    className: "border-green-300 text-green-700 bg-green-50",
    icon: <CheckCircle className="h-3 w-3" />,
  },
  syncing: {
    label: "동기화 중",
    className: "border-yellow-300 text-yellow-700 bg-yellow-50",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
  },
  error: {
    label: "오류",
    className: "border-red-300 text-red-700 bg-red-50",
    icon: <AlertCircle className="h-3 w-3" />,
  },
};

const CODE_INTEL_CONFIG: Record<string, { label: string; className: string }> = {
  local: { label: "Local", className: "border-blue-300 text-blue-700 bg-blue-50" },
  agent: { label: "Agent", className: "border-purple-300 text-purple-700 bg-purple-50" },
  api: { label: "API", className: "border-gray-300 text-gray-700 bg-gray-50" },
};

const LLM_CONFIG: Record<string, { label: string; className: string }> = {
  ollama: { label: "Ollama", className: "border-emerald-300 text-emerald-700 bg-emerald-50" },
  claude: { label: "Claude", className: "border-orange-300 text-orange-700 bg-orange-50" },
  gemini: { label: "Gemini", className: "border-indigo-300 text-indigo-700 bg-indigo-50" },
};

export function createProjectColumns(): ColumnDef<Project>[] {
  return [
    {
      accessorKey: "name",
      header: "프로젝트",
      cell: ({ row }) => {
        const project = row.original;
        return (
          <div className="min-w-0">
            <span className="font-medium">{project.name}</span>
            <div className="mt-0.5">
              <Badge variant="outline" className="px-1 py-0 text-[10px] font-normal">
                {project.serviceTag}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      id: "gitUrl",
      header: "Git",
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <GitBranch className="h-3.5 w-3.5" />
          <span className="truncate font-mono text-xs">{row.original.gitUrl}</span>
        </span>
      ),
    },
    {
      id: "codeIntelMode",
      header: "코드 인텔",
      cell: ({ row }) => {
        const config = CODE_INTEL_CONFIG[row.original.codeIntelMode];
        return (
          <Badge variant="outline" className={`text-xs ${config.className}`}>
            {config.label}
          </Badge>
        );
      },
      size: 90,
    },
    {
      id: "llmProvider",
      header: "LLM",
      cell: ({ row }) => {
        const config = LLM_CONFIG[row.original.llmProvider];
        return (
          <Badge variant="outline" className={`text-xs ${config.className}`}>
            {config.label}
          </Badge>
        );
      },
      size: 80,
    },
    {
      accessorKey: "issueCount",
      header: "이슈",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.issueCount}건</span>
      ),
      size: 60,
    },
    {
      id: "syncStatus",
      header: "동기화",
      cell: ({ row }) => {
        const config = SYNC_STATUS_CONFIG[row.original.syncStatus];
        return (
          <Badge variant="outline" className={`gap-1 text-xs ${config.className}`}>
            {config.icon}
            {config.label}
          </Badge>
        );
      },
      size: 100,
    },
    {
      id: "lastSyncAt",
      header: "마지막 동기화",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">{row.original.lastSyncAt}</span>
      ),
      size: 100,
    },
  ];
}
