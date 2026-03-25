"use client";

import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterState {
  search: string;
  status: string | null;
  priority: string | null;
  source: string | null;
}

interface ToolbarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

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

function FilterChips({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (value: string | null) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">{label}:</span>
      {options.map((opt) => (
        <Badge
          key={opt.value}
          variant={selected === opt.value ? "default" : "outline"}
          className="cursor-pointer text-xs"
          onClick={() => onSelect(selected === opt.value ? null : opt.value)}
        >
          {opt.label}
        </Badge>
      ))}
    </div>
  );
}

export function IssueToolbar({ filters, onFiltersChange }: ToolbarProps) {
  const hasActiveFilters = filters.status || filters.priority || filters.source || filters.search;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="이슈 검색..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: (e.target as HTMLInputElement).value })}
            className="pl-9"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ search: "", status: null, priority: null, source: null })}
            className="gap-1 text-xs"
          >
            <X className="h-3 w-3" />
            초기화
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <FilterChips
          label="상태"
          options={STATUS_OPTIONS}
          selected={filters.status}
          onSelect={(v) => onFiltersChange({ ...filters, status: v })}
        />
        <FilterChips
          label="우선순위"
          options={PRIORITY_OPTIONS}
          selected={filters.priority}
          onSelect={(v) => onFiltersChange({ ...filters, priority: v })}
        />
        <FilterChips
          label="소스"
          options={SOURCE_OPTIONS}
          selected={filters.source}
          onSelect={(v) => onFiltersChange({ ...filters, source: v })}
        />
      </div>
    </div>
  );
}
