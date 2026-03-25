"use client";

import useSWR from "swr";
import { apiClient } from "@/lib/api";
import { Issue } from "@/types/issue";
import { PagedResponse, IssueFilterParams } from "@/types/api";

function buildQueryString(params: IssueFilterParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("size", String(params.size));
  if (params.status) searchParams.set("status", params.status);
  if (params.priority) searchParams.set("priority", params.priority);
  if (params.source) searchParams.set("source", params.source);
  if (params.assigneeId) searchParams.set("assigneeId", params.assigneeId);
  if (params.search) searchParams.set("search", params.search);
  if (params.sort) {
    searchParams.set("sort", `${params.sort.field},${params.sort.direction}`);
  }
  return searchParams.toString();
}

const fetcher = (url: string) => apiClient.get<PagedResponse<Issue>>(url);

export function useIssues(params: IssueFilterParams) {
  const queryString = buildQueryString(params);
  const key = `/issues?${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<PagedResponse<Issue>>(
    key,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    issues: data?.content ?? [],
    totalElements: data?.totalElements ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useIssue(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Issue>(
    id ? `/issues/${id}` : null,
    (url: string) => apiClient.get<Issue>(url),
    {
      revalidateOnFocus: false,
    }
  );

  return {
    issue: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
