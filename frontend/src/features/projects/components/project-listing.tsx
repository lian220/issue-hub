"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryState, parseAsString } from "nuqs";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createProjectColumns } from "./project-tables/columns";
import { ProjectToolbar } from "./project-tables/toolbar";
import { useProjectList } from "../hooks/use-projects";
import type { Project } from "@/constants/mock-data";

export function ProjectListing() {
  const router = useRouter();
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [syncStatus, setSyncStatus] = useQueryState("syncStatus");
  const [codeIntelMode, setCodeIntelMode] = useQueryState("codeIntelMode");
  const [llmProvider, setLlmProvider] = useQueryState("llmProvider");

  const filters = { search, syncStatus, codeIntelMode, llmProvider };

  const handleFiltersChange = useCallback(
    (next: typeof filters) => {
      setSearch(next.search || null);
      setSyncStatus(next.syncStatus);
      setCodeIntelMode(next.codeIntelMode);
      setLlmProvider(next.llmProvider);
    },
    [setSearch, setSyncStatus, setCodeIntelMode, setLlmProvider],
  );

  const { data: filteredProjects } = useProjectList(filters);
  const columns = useMemo(() => createProjectColumns(), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">프로젝트</h1>
          <p className="text-muted-foreground">
            연결된 프로젝트와 코드 저장소를 관리합니다.
          </p>
        </div>
        <Button className="gap-2" disabled>
          <Plus className="h-4 w-4" />
          프로젝트 추가
        </Button>
      </div>

      <ProjectToolbar filters={filters} onFiltersChange={handleFiltersChange} />

      <DataTable
        columns={columns}
        data={filteredProjects}
        onRowClick={(project: Project) => router.push(`/projects/${project.id}`)}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>총 {filteredProjects.length}개의 프로젝트</span>
      </div>
    </div>
  );
}
