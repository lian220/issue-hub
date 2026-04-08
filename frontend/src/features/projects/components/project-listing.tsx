"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { createProjectColumns } from "./project-tables/columns";
import { ProjectToolbar } from "./project-tables/toolbar";
import { useProjectList } from "../hooks/use-projects";
import type { Project } from "@/constants/mock-data";

export function ProjectListing() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    search: "",
    syncStatus: null as string | null,
    codeIntelMode: null as string | null,
    llmProvider: null as string | null,
  });

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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          프로젝트 추가
        </Button>
      </div>

      <ProjectToolbar filters={filters} onFiltersChange={setFilters} />

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
