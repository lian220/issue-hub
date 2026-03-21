"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { STATUS_LABELS, PRIORITY_LABELS, PLATFORM_LABELS } from "@/lib/constants";
import { IssueStatus, IssuePriority, Platform } from "@/types/issue";

interface IssueFiltersProps {
  status?: string;
  priority?: string;
  source?: string;
  search?: string;
  onStatusChange: (value: string | undefined) => void;
  onPriorityChange: (value: string | undefined) => void;
  onSourceChange: (value: string | undefined) => void;
  onSearchChange: (value: string) => void;
  onReset: () => void;
}

export function IssueFilters({
  status,
  priority,
  source,
  search,
  onStatusChange,
  onPriorityChange,
  onSourceChange,
  onSearchChange,
  onReset,
}: IssueFiltersProps) {
  const hasFilters = status || priority || source || search;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="이슈 검색..."
          className="pl-9"
          value={search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="이슈 검색"
        />
      </div>

      <Select
        value={status ?? "all"}
        onValueChange={(v) => onStatusChange(v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-[140px]" aria-label="상태 필터">
          <SelectValue placeholder="상태" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 상태</SelectItem>
          {(Object.keys(STATUS_LABELS) as IssueStatus[]).map((key) => (
            <SelectItem key={key} value={key}>
              {STATUS_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={priority ?? "all"}
        onValueChange={(v) => onPriorityChange(v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-[140px]" aria-label="우선순위 필터">
          <SelectValue placeholder="우선순위" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 우선순위</SelectItem>
          {(Object.keys(PRIORITY_LABELS) as IssuePriority[]).map((key) => (
            <SelectItem key={key} value={key}>
              {PRIORITY_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={source ?? "all"}
        onValueChange={(v) => onSourceChange(v === "all" ? undefined : v)}
      >
        <SelectTrigger className="w-[140px]" aria-label="소스 필터">
          <SelectValue placeholder="소스" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 소스</SelectItem>
          {(Object.keys(PLATFORM_LABELS) as Platform[]).map((key) => (
            <SelectItem key={key} value={key}>
              {PLATFORM_LABELS[key]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <X className="h-4 w-4" />
          초기화
        </Button>
      )}
    </div>
  );
}
