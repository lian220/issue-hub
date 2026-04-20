"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter } from "lucide-react";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { createIssueColumns } from "./issue-tables/columns";
import { useIssueList } from "../hooks/use-issues";
import { PendingIssuesTab } from "./pending-issues-tab";
import { MOCK_PENDING_ISSUES } from "@/constants/mock-integrations";
import type { Issue } from "@/types/issue";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "OPEN", label: "열림" },
  { value: "IN_PROGRESS", label: "진행 중" },
  { value: "RESOLVED", label: "해결됨" },
  { value: "CLOSED", label: "닫힘" },
];

const PRIORITY_OPTIONS = [
  { value: "CRITICAL", label: "심각" },
  { value: "HIGH", label: "높음" },
  { value: "MEDIUM", label: "보통" },
  { value: "LOW", label: "낮음" },
];

const SOURCE_OPTIONS = [
  { value: "JIRA", label: "Jira" },
  { value: "GITHUB", label: "GitHub" },
  { value: "MANUAL", label: "IssueHub" },
];

export function IssueListing() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    status: null as string | null,
    priority: null as string | null,
    source: null as string | null,
  });

  const [tab, setTab] = useQueryState("tab", { defaultValue: "all" });
  const pendingCount = MOCK_PENDING_ISSUES.filter((i) => i.status === "PENDING").length;

  const { data: allIssues, lookups } = useIssueList(filters);
  const columns = useMemo(() => createIssueColumns(lookups), [lookups]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(allIssues.length / PAGE_SIZE));
  const paginatedIssues = allIssues.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function toggleFilter(
    key: "status" | "priority" | "source",
    value: string,
  ) {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">이슈</h1>
          <p className="text-muted-foreground">
            모든 플랫폼 이슈를 한곳에서 관리하고 추적합니다.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          새 이슈 생성
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex gap-0 border-b border-border">
        <button
          className={`px-4 py-2 text-sm ${tab === "all" ? "text-foreground border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
          onClick={() => setTab("all")}
        >
          전체 이슈
        </button>
        <button
          className={`px-4 py-2 text-sm ${tab === "pending" ? "text-primary border-b-2 border-primary font-medium" : "text-muted-foreground"}`}
          onClick={() => setTab("pending")}
        >
          대기 중
          {pendingCount > 0 && (
            <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {tab === "pending" ? (
        <PendingIssuesTab />
      ) : (
        <>
          {/* Search + Filter */}
          <div className="space-y-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="이슈 검색..."
                value={filters.search}
                onChange={(e) => {
                  setPage(1);
                  setFilters((prev) => ({
                    ...prev,
                    search: (e.target as HTMLInputElement).value,
                  }));
                }}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <FilterGroup
                label="상태"
                options={STATUS_OPTIONS}
                selected={filters.status}
                onSelect={(v) => toggleFilter("status", v)}
              />
              <FilterGroup
                label="우선순위"
                options={PRIORITY_OPTIONS}
                selected={filters.priority}
                onSelect={(v) => toggleFilter("priority", v)}
              />
              <FilterGroup
                label="소스"
                options={SOURCE_OPTIONS}
                selected={filters.source}
                onSelect={(v) => toggleFilter("source", v)}
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={paginatedIssues}
            onRowClick={(issue: Issue) => router.push(`/issues/${issue.id}`)}
          />

          {/* Pagination */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {(page - 1) * PAGE_SIZE + 1}
              {" - "}
              {Math.min(page * PAGE_SIZE, allIssues.length)} / 총{" "}
              {allIssues.length}건
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                이전
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function FilterGroup({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}:</span>
      {options.map((opt) => (
        <Badge
          key={opt.value}
          variant={selected === opt.value ? "default" : "outline"}
          className="cursor-pointer text-xs"
          onClick={() => onSelect(opt.value)}
        >
          {opt.label}
        </Badge>
      ))}
    </div>
  );
}
