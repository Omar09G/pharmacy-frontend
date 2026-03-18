export type ApiResponse<T> = {
  data: T;
  message: string;
  status: string;
  codeError: number;
  timestamp: string;
  total: number;
};
