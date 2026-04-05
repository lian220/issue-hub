"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createIssueColumns } from "./issue-tables/columns";
import { IssueToolbar } from "./issue-tables/toolbar";
import { useIssueList } from "../hooks/use-issues";
import type { Issue } from "@/types/issue";

export function IssueListing() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: "",
    status: null as string | null,
    priority: null as string | null,
    source: null as string | null,
  });

  const { data: filteredIssues, lookups } = useIssueList(filters);
  const columns = useMemo(() => createIssueColumns(lookups), [lookups]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">이슈</h1>
          <p className="text-muted-foreground">
            모든 플랫폼의 이슈를 통합 관리합니다.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          이슈 생성
        </Button>
      </div>

      <IssueToolbar filters={filters} onFiltersChange={setFilters} />

      <DataTable
        columns={columns}
        data={filteredIssues}
        onRowClick={(issue: Issue) => router.push(`/issues/${issue.id}`)}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>총 {filteredIssues.length}건의 이슈</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            이전
          </Button>
          <Button variant="outline" size="sm" disabled>
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
