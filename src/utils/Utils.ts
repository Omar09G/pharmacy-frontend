export type ApiResponse<T> = {
  data: T;
  message: string;
  status: string;
  codeError: number;
  timestamp: string;
  total: number;
};

export const ADMIN_ROLE = 'ADMIN';

export const USER_ROLE = 'USER';
