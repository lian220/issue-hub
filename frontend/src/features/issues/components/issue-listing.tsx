"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { createIssueColumns } from "./issue-tables/columns";
import { useIssueList } from "../hooks/use-issues";
import type { Issue } from "@/types/issue";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const PRIORITY_OPTIONS = [
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
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
          <h1 className="text-2xl font-bold tracking-tight">Issues</h1>
          <p className="text-muted-foreground">
            Manage and track all platform issues in one place.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Issue
        </Button>
      </div>

      {/* Search + Filter */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
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
            label="Status"
            options={STATUS_OPTIONS}
            selected={filters.status}
            onSelect={(v) => toggleFilter("status", v)}
          />
          <FilterGroup
            label="Priority"
            options={PRIORITY_OPTIONS}
            selected={filters.priority}
            onSelect={(v) => toggleFilter("priority", v)}
          />
          <FilterGroup
            label="Source"
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
          Showing {(page - 1) * PAGE_SIZE + 1}
          {" - "}
          {Math.min(page * PAGE_SIZE, allIssues.length)} of{" "}
          {allIssues.length} issues
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
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
