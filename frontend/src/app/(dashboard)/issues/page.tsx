"use client";

import { useState } from "react";
import { IssueTable } from "@/features/issues/components/issue-table";
import { IssueFilters } from "@/features/issues/components/issue-filters";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function IssuesPage() {
  const [status, setStatus] = useState<string | undefined>();
  const [priority, setPriority] = useState<string | undefined>();
  const [source, setSource] = useState<string | undefined>();
  const [search, setSearch] = useState("");

  function handleReset() {
    setStatus(undefined);
    setPriority(undefined);
    setSource(undefined);
    setSearch("");
  }

  return (
    <div className="space-y-6">
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

      <IssueFilters
        status={status}
        priority={priority}
        source={source}
        search={search}
        onStatusChange={setStatus}
        onPriorityChange={setPriority}
        onSourceChange={setSource}
        onSearchChange={setSearch}
        onReset={handleReset}
      />

      <IssueTable issues={[]} />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>총 5건의 이슈</span>
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
