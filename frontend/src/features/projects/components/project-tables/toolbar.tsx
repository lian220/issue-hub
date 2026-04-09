"use client";

import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterState {
  search: string;
  syncStatus: string | null;
  codeIntelMode: string | null;
  llmProvider: string | null;
}

interface ToolbarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const SYNC_OPTIONS = [
  { value: "synced", label: "동기화됨" },
  { value: "syncing", label: "동기화 중" },
  { value: "error", label: "오류" },
];

const CODE_INTEL_OPTIONS = [
  { value: "local", label: "Local" },
  { value: "agent", label: "Agent" },
  { value: "api", label: "API" },
];

const LLM_OPTIONS = [
  { value: "ollama", label: "Ollama" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
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

export function ProjectToolbar({ filters, onFiltersChange }: ToolbarProps) {
  const hasActiveFilters = filters.syncStatus || filters.codeIntelMode || filters.llmProvider || filters.search;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="프로젝트 검색..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: (e.target as HTMLInputElement).value })}
            className="pl-9"
          />
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ search: "", syncStatus: null, codeIntelMode: null, llmProvider: null })}
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
          label="동기화"
          options={SYNC_OPTIONS}
          selected={filters.syncStatus}
          onSelect={(v) => onFiltersChange({ ...filters, syncStatus: v })}
        />
        <FilterChips
          label="코드 인텔"
          options={CODE_INTEL_OPTIONS}
          selected={filters.codeIntelMode}
          onSelect={(v) => onFiltersChange({ ...filters, codeIntelMode: v })}
        />
        <FilterChips
          label="LLM"
          options={LLM_OPTIONS}
          selected={filters.llmProvider}
          onSelect={(v) => onFiltersChange({ ...filters, llmProvider: v })}
        />
      </div>
    </div>
  );
}
