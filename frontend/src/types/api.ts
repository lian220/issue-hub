export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
  path: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface SortParams {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: SortParams;
}

export interface IssueFilterParams extends PaginationParams {
  status?: string;
  priority?: string;
  source?: string;
  assigneeId?: string;
  search?: string;
  labels?: string[];
}
