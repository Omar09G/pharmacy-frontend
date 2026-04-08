export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  active?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
